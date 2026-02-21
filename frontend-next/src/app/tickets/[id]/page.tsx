'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAccess } from '../../../lib/auth-client';

interface TicketReply {
  _id: string;
  body: string;
  createdAt: string;
  authorName?: string;
}

interface TicketDetail {
  _id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  category?: string;
  customerEmail?: string;
  customerName?: string;
  aiAnalysis?: {
    sentiment?: string;
    category?: string;
    suggestedCategory?: string;
    summary?: string;
    priorityScore?: number;
    suggestedReply?: string;
    sources?: { id: string; title: string }[];
  };
  aiDraft?: {
    body?: string;
    confidence?: number;
  };
  replies: TicketReply[];
  createdAt: string;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningTriage, setRunningTriage] = useState(false);
  const [usingSuggestion, setUsingSuggestion] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      const res = await fetchWithAccess<TicketDetail>(`/tickets/${id}`);
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else if (res.status === 404) {
          setError('Ticket not found.');
        } else {
          setError('Unable to load this ticket.');
        }
        setIsLoading(false);
        return;
      }
      setTicket(res.data || null);
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-10 text-white space-y-4">
        <div className="h-6 w-64 bg-white/10 rounded" />
        <div className="h-4 w-40 bg-white/10 rounded" />
        <div className="h-40 w-full bg-white/5 rounded-2xl border border-white/10" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="container mx-auto px-6 py-10 text-white">
        <p className="text-sm text-white/70 mb-4">{error}</p>
        <Link
          href="/tickets"
          className="inline-flex items-center text-sm text-cyan-300 hover:text-cyan-200"
        >
          ← Back to tickets
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const confidence =
    ticket.aiDraft && typeof ticket.aiDraft.confidence === 'number'
      ? ticket.aiDraft.confidence
      : ticket.aiAnalysis && typeof ticket.aiAnalysis.priorityScore === 'number'
        ? ticket.aiAnalysis.priorityScore
        : null;

  const confidenceLabel =
    confidence == null ? null : confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low';

  async function runTriage() {
    if (!id) return;
    setRunningTriage(true);
    setError(null);
    try {
      const res = await fetchWithAccess(`/tickets/${id}/workflows/triage`, {
        method: 'POST',
      });
      if (!res.ok) {
        setError('Unable to run AI triage on this ticket.');
      } else {
        const next = await fetchWithAccess<TicketDetail>(`/tickets/${id}`);
        if (next.ok) {
          setTicket(next.data || null);
        }
      }
    } catch {
      setError('Something went wrong while running AI triage.');
    } finally {
      setRunningTriage(false);
    }
  }

  async function useSuggestionAsReply() {
    if (!id || !ticket || !ticket.aiDraft || !ticket.aiDraft.body) return;
    setUsingSuggestion(true);
    setError(null);
    try {
      const res = await fetchWithAccess(`/tickets/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ body: ticket.aiDraft.body, useAiDraft: true }),
      });
      if (!res.ok) {
        setError('Unable to send reply using the AI suggestion.');
      } else {
        const next = await fetchWithAccess<TicketDetail>(`/tickets/${id}`);
        if (next.ok) {
          setTicket(next.data || null);
        }
      }
    } catch {
      setError('Something went wrong while sending the reply.');
    } finally {
      setUsingSuggestion(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/tickets"
            className="text-xs text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 mb-2"
          >
            ← Back to tickets
          </Link>
          <h1 className="text-2xl font-semibold mb-1">{ticket.subject}</h1>
          <p className="text-xs text-white/60">
            {ticket.customerName || ticket.customerEmail} •{' '}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs">
          <span className="px-2 py-1 rounded-full border border-white/20 bg-white/5">
            {ticket.status}
          </span>
          <span className="px-2 py-1 rounded-full border border-white/20 bg-white/5">
            Priority: {ticket.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 min-h-[160px]">
            <div className="whitespace-pre-line text-sm text-white/90">{ticket.body}</div>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Discussion</h2>
            {ticket.replies.length === 0 ? (
              <p className="text-sm text-white/60">
                No replies yet. Reply from the main app to see them here.
              </p>
            ) : (
              ticket.replies.map((reply) => (
                <div
                  key={reply._id}
                  className="rounded-2xl border border-white/10 bg-slate-950/80 p-4"
                >
                  <div className="flex items-center justify-between mb-2 text-xs text-white/60">
                    <span>{reply.authorName || 'Agent'}</span>
                    <span>{new Date(reply.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="whitespace-pre-line text-sm text-white/90">{reply.body}</div>
                </div>
              ))
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">AI copilot</h2>
              <button
                type="button"
                onClick={runTriage}
                disabled={runningTriage}
                className="px-3 py-1 rounded-full border border-cyan-400/60 bg-cyan-500/10 text-[11px] font-medium text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {runningTriage ? 'Running…' : 'Run triage'}
              </button>
            </div>
            {ticket.aiDraft && ticket.aiDraft.body ? (
              <div className="space-y-3">
                <div className="text-[11px] text-white/60">
                  Draft reply based on this ticket and your knowledge base.
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 max-h-64 overflow-y-auto whitespace-pre-line text-xs text-white/90">
                  {ticket.aiDraft.body}
                </div>
                {confidenceLabel && (
                  <div className="text-[11px] text-white/60">
                    Confidence: <span className="font-medium text-white">{confidenceLabel}</span>
                    {confidence != null && (
                      <span className="text-white/50"> ({Math.round(confidence * 100)}%)</span>
                    )}
                  </div>
                )}
                {ticket.aiAnalysis &&
                  ticket.aiAnalysis.sources &&
                  ticket.aiAnalysis.sources.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-medium text-white/70">
                        Used knowledge articles
                      </div>
                      <ul className="space-y-1 text-[11px] text-cyan-200">
                        {ticket.aiAnalysis.sources.map((s) => (
                          <li key={s.id}>• {s.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={useSuggestionAsReply}
                    disabled={usingSuggestion}
                    className="flex-1 px-3 py-1.5 rounded-full bg-cyan-500 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {usingSuggestion ? 'Sending…' : 'Use suggestion and send'}
                  </button>
                </div>
                <div className="text-[10px] text-white/50">
                  You can always edit or follow up after sending. AI never sends without you.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/70">
                  Run AI triage to generate a draft reply using this ticket and your knowledge base.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
