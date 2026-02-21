'use client';

import { FormEvent, useState } from 'react';
import { fetchWithAccess } from '../../../lib/auth-client';

type IngestResponse = {
  ticket?: {
    _id: string;
    subject: string;
  };
};

export default function ChatWidgetPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSubmittedTicketId(null);
    try {
      const res = await fetchWithAccess<IngestResponse>('/tickets/ingest', {
        method: 'POST',
        body: JSON.stringify({
          subject: message.slice(0, 80) || 'New message from chat widget',
          body: message,
          customerName: name || undefined,
          customerEmail: email || undefined,
          channel: 'chat',
        }),
      });
      if (!res.ok) {
        setError('Unable to send your message. Please try again.');
      } else if (res.data && res.data.ticket && res.data.ticket._id) {
        setSubmittedTicketId(res.data.ticket._id);
        setMessage('');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-xl">
        <h1 className="text-lg font-semibold mb-1">Contact support</h1>
        <p className="text-sm text-white/70 mb-4">
          Send a message to the OpsFlow support team. We&apos;ll reply by email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs text-white/70">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-white/70">How can we help?</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[120px] rounded-md border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              placeholder="Describe what you need help with..."
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {submittedTicketId && !error && (
            <p className="text-xs text-emerald-400">
              Thanks, your message was sent. We&apos;ll get back to you soon.
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed w-full"
          >
            {isSubmitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
}
