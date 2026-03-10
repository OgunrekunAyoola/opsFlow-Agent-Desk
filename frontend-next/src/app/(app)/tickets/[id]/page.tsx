'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Send,
  AlertTriangle,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { fetchWithAccess } from '../../../../lib/auth-client';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../../components/ui/Card';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Textarea } from '../../../../components/ui/Textarea';
import { useToast } from '../../../../context/ToastContext';

interface TicketReply {
  _id: string;
  body: string;
  createdAt: string;
  authorName?: string;
  authorType?: 'human' | 'ai';
  isInternalNote?: boolean;
  type?: 'reply' | 'note';
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
    faithfulness?: 'high' | 'medium' | 'low';
    completeness?: 'high' | 'medium' | 'low';
    risk?: 'low' | 'medium' | 'high';
    explanation?: string;
  };
  aiDraft?: {
    body?: string;
    confidence?: number;
  };
  assigneeId?: { _id: string; name: string; email: string } | null;
  replies: TicketReply[];
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningTriage, setRunningTriage] = useState(false);
  const [usingSuggestion, setUsingSuggestion] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);

      const [ticketRes, usersRes] = await Promise.all([
        fetchWithAccess<TicketDetail>(`/tickets/${id}`),
        fetchWithAccess<{ users: User[] }>('/users'),
      ]);

      if (cancelled) return;

      if (!ticketRes.ok) {
        if (ticketRes.status === 401) {
          router.push('/login');
        } else if (ticketRes.status === 404) {
          setError('Ticket not found.');
        } else {
          setError('Unable to load this ticket.');
        }
        setIsLoading(false);
        return;
      }

      setTicket(ticketRes.data || null);
      if (usersRes.ok && usersRes.data) {
        setUsers(usersRes.data.users);
      }
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!id || !ticket) return;
    setUpdatingAssignee(true);
    try {
      const res = await fetchWithAccess<TicketDetail>(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId: newAssigneeId === 'unassigned' ? null : newAssigneeId }),
      });
      if (res.ok && res.data) {
        setTicket((prev) => (prev ? { ...prev, assigneeId: res.data?.assigneeId } : null));
      }
    } catch (err) {
      console.error('Failed to update assignee', err);
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const handleManualReply = async () => {
    if (!id || !replyBody.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetchWithAccess(`/tickets/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ body: replyBody }),
      });
      if (!res.ok) {
        toast.error('Failed to send reply');
      } else {
        setReplyBody('');
        const next = await fetchWithAccess<TicketDetail>(`/tickets/${id}`);
        if (next.ok) {
          setTicket(next.data || null);
        }
        toast.success('Reply sent');
      }
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

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
        toast.error('AI triage failed');
      } else {
        const next = await fetchWithAccess<TicketDetail>(`/tickets/${id}`);
        if (next.ok) {
          setTicket(next.data || null);
        }
        toast.success('AI triage completed');
      }
    } catch {
      setError('Something went wrong while running AI triage.');
      toast.error('AI triage failed');
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
        toast.error('Failed to send AI reply');
      } else {
        const next = await fetchWithAccess<TicketDetail>(`/tickets/${id}`);
        if (next.ok) {
          setTicket(next.data || null);
        }
        toast.success('Reply sent using AI suggestion');
      }
    } catch {
      setError('Something went wrong while sending the reply.');
      toast.error('Failed to send AI reply');
    } finally {
      setUsingSuggestion(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-400 mb-4">{error}</p>
        <Link href="/tickets">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tickets
          </Button>
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    triaged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    awaiting_reply: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const confidence =
    ticket.aiDraft && typeof ticket.aiDraft.confidence === 'number'
      ? ticket.aiDraft.confidence
      : ticket.aiAnalysis && typeof ticket.aiAnalysis.priorityScore === 'number'
        ? ticket.aiAnalysis.priorityScore
        : null;

  const confidenceLabel =
    confidence == null ? null : confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low';

  const faithfulness = ticket.aiAnalysis?.faithfulness;
  const completeness = ticket.aiAnalysis?.completeness;
  const risk = ticket.aiAnalysis?.risk;
  const evalExplanation = ticket.aiAnalysis?.explanation;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-4">
        <Link
          href="/tickets"
          className="text-sm text-slate-400 hover:text-slate-200 inline-flex items-center gap-2 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tickets
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-100 leading-tight">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-800">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium text-slate-300">
                  {ticket.customerName || ticket.customerEmail}
                </span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-800">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`px-3 py-1 text-sm capitalize ${statusColors[ticket.status] || 'bg-slate-500/10'}`}
            >
              {ticket.status.replace('_', ' ')}
            </Badge>
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm capitalize ${priorityColors[ticket.priority] || ''}`}
            >
              {ticket.priority} Priority
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden border-slate-800 bg-slate-900/20">
            <CardHeader className="bg-slate-900/50 border-b border-slate-800 pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-200">
                <FileText className="h-4 w-4 text-blue-400" /> Ticket Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-line text-sm text-slate-300 leading-relaxed font-normal">
                {ticket.body}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" /> Discussion
              </h2>
              <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-full">
                {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:bg-slate-800 before:w-0.5 before:h-full">
              {ticket.replies.length === 0 ? (
                <div className="relative pl-12">
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                    <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No replies yet.</p>
                    <p className="text-xs text-slate-600 mt-1">Start the conversation below.</p>
                  </div>
                </div>
              ) : (
                ticket.replies.map((reply) => {
                  const isAi = reply.authorType === 'ai';
                  const isInternal = reply.isInternalNote || reply.type === 'note';

                  return (
                    <div key={reply._id} className="relative pl-12 group">
                      <div
                        className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-slate-950 border ${
                          isAi
                            ? 'bg-purple-900/20 border-purple-500/30 text-purple-400'
                            : isInternal
                              ? 'bg-amber-900/20 border-amber-500/30 text-amber-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {isAi ? (
                          <Sparkles className="h-4 w-4" />
                        ) : isInternal ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <Card
                        className={`transition-colors hover:border-slate-700 ${
                          isInternal
                            ? 'bg-amber-950/10 border-amber-500/20'
                            : isAi
                              ? 'bg-purple-950/10 border-purple-500/20'
                              : 'bg-slate-900/40 border-slate-800'
                        }`}
                      >
                        <CardHeader
                          className={`py-3 px-5 border-b flex flex-row items-center justify-between space-y-0 ${
                            isInternal
                              ? 'border-amber-500/10 bg-amber-900/5'
                              : isAi
                                ? 'border-purple-500/10 bg-purple-900/5'
                                : 'border-slate-800/50 bg-slate-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                isInternal
                                  ? 'text-amber-200'
                                  : isAi
                                    ? 'text-purple-200'
                                    : 'text-slate-200'
                              }`}
                            >
                              {isAi ? 'AI Agent' : reply.authorName || 'Agent'}
                            </span>
                            {isInternal && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 border-amber-500/30 text-amber-400 bg-amber-500/5"
                              >
                                Internal Note
                              </Badge>
                            )}
                            {isAi && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 border-purple-500/30 text-purple-400 bg-purple-500/5"
                              >
                                Automated Action
                              </Badge>
                            )}
                            {!reply.authorName && !isAi && !isInternal && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5 border-blue-500/30 text-blue-400 bg-blue-500/5"
                              >
                                Team
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </CardHeader>
                        <CardContent className="py-4 px-5">
                          <div className="whitespace-pre-line text-sm text-slate-300 leading-relaxed">
                            {reply.body}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })
              )}

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 ring-4 ring-slate-950">
                  <Send className="h-4 w-4 text-white" />
                </div>
                <Card className="border-slate-800 bg-slate-950 shadow-lg">
                  <CardContent className="p-4 space-y-4">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      className="min-h-[120px] resize-y bg-slate-900/50 border-slate-800 focus:border-blue-500/50"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        <span className="hidden sm:inline">Pro tip: </span>
                        Use AI Copilot to generate a draft.
                      </p>
                      <Button
                        onClick={handleManualReply}
                        disabled={!replyBody.trim() || sendingReply}
                        className="px-6"
                      >
                        {sendingReply ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="border-slate-800 bg-slate-950/50">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-semibold text-slate-200">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Assignee
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={ticket.assigneeId ? ticket.assigneeId._id : 'unassigned'}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={updatingAssignee}
                >
                  <option value="unassigned">Unassigned</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <Badge className={`px-2 py-1 text-xs capitalize ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Priority
                </label>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`px-2 py-1 text-xs capitalize ${priorityColors[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-950/10 sticky top-6 shadow-lg shadow-blue-900/5">
            <CardHeader className="pb-3 border-b border-blue-500/10 bg-blue-900/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-100">
                  <Sparkles className="h-4 w-4 text-blue-400" /> AI Copilot
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={runTriage}
                  disabled={runningTriage}
                  className="h-8 px-3 text-xs font-medium text-blue-300 hover:text-blue-200 hover:bg-blue-500/20 transition-all"
                >
                  {runningTriage ? (
                    <span className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Analyzing...
                    </span>
                  ) : (
                    'Run Triage'
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {ticket.aiDraft && ticket.aiDraft.body ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Suggested Reply
                      </h4>
                      {confidenceLabel && (
                        <Badge
                          variant="outline"
                          className={`
                            text-[10px] h-5 px-1.5
                            ${
                              confidenceLabel === 'High'
                                ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                                : confidenceLabel === 'Medium'
                                  ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                                  : 'text-red-400 border-red-500/20 bg-red-500/5'
                            }
                          `}
                        >
                          {confidenceLabel} Confidence
                        </Badge>
                      )}
                    </div>
                    <div className="bg-slate-950/80 rounded-lg p-3.5 border border-blue-500/20 shadow-inner">
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                        {ticket.aiDraft.body}
                      </p>
                    </div>
                  </div>

                  {(faithfulness || completeness || risk) && (
                    <div className="grid grid-cols-2 gap-2">
                      {faithfulness && (
                        <div className="flex flex-col gap-1 p-2 rounded bg-slate-900/50 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Faithfulness
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              faithfulness === 'high'
                                ? 'text-emerald-400'
                                : faithfulness === 'medium'
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {faithfulness}
                          </span>
                        </div>
                      )}
                      {completeness && (
                        <div className="flex flex-col gap-1 p-2 rounded bg-slate-900/50 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Completeness
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              completeness === 'high'
                                ? 'text-emerald-400'
                                : completeness === 'medium'
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }`}
                          >
                            {completeness}
                          </span>
                        </div>
                      )}
                      {risk && (
                        <div className="flex flex-col gap-1 p-2 rounded bg-slate-900/50 border border-slate-800 col-span-2">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Risk Level
                          </span>
                          <span
                            className={`text-xs font-medium flex items-center gap-1.5 ${
                              risk === 'low'
                                ? 'text-emerald-400'
                                : risk === 'medium'
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                            }`}
                          >
                            <ShieldAlert className="h-3 w-3" />
                            {risk.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {evalExplanation && (
                    <div className="text-[11px] text-slate-400 italic bg-blue-900/10 p-2.5 rounded border border-blue-500/10">
                      "{evalExplanation}"
                    </div>
                  )}

                  {ticket.aiAnalysis?.sources && ticket.aiAnalysis.sources.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-blue-500/10">
                      <p className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Referenced Sources
                      </p>
                      <ul className="space-y-1.5">
                        {ticket.aiAnalysis.sources.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/30 p-1.5 rounded hover:bg-slate-900/50 transition-colors cursor-help"
                            title={s.title}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <span className="line-clamp-1">{s.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="w-full border-blue-500/20 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
                        onClick={() => {
                          if (ticket.aiDraft?.body) {
                            setReplyBody(ticket.aiDraft.body);
                            // Scroll to reply box
                            const replyBox = document.querySelector('textarea');
                            if (replyBox) {
                              replyBox.focus();
                              replyBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }
                        }}
                        size="sm"
                      >
                        <FileText className="mr-2 h-4 w-4" /> Edit Draft
                      </Button>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                        onClick={useSuggestionAsReply}
                        disabled={usingSuggestion}
                        size="sm"
                      >
                        {usingSuggestion ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Send
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-center text-slate-500">
                      'Approve & Send' will send the reply immediately.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200">No Analysis Yet</p>
                    <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                      Run the triage workflow to generate an AI analysis and suggested reply for
                      this ticket.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runTriage}
                    disabled={runningTriage}
                    className="mt-2 border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    Run Triage Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
