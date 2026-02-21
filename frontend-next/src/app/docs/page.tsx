'use client';

import Link from 'next/link';

export default function DocsIndexPage() {
  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Documentation</h1>
        <p className="text-sm text-white/70">
          Learn how OpsFlow ingests tickets, uses AI, and plugs into your stack.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/docs/getting-started"
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-cyan-400/60 transition-colors"
        >
          <h2 className="text-sm font-semibold mb-1">Getting started</h2>
          <p className="text-xs text-white/70">
            Core concepts and the fastest way to get to your first AI-assisted resolution.
          </p>
        </Link>
        <Link
          href="/docs/email-api-ingestion"
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-cyan-400/60 transition-colors"
        >
          <h2 className="text-sm font-semibold mb-1">Email and API ingestion</h2>
          <p className="text-xs text-white/70">
            Forward support inboxes, call the ingestion API, or embed the chat widget.
          </p>
        </Link>
        <Link
          href="/docs/knowledge-base"
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-cyan-400/60 transition-colors"
        >
          <h2 className="text-sm font-semibold mb-1">Knowledge base</h2>
          <p className="text-xs text-white/70">
            Teach OpsFlow your product so AI replies stay on-brand and accurate.
          </p>
        </Link>
        <Link
          href="/docs/ai-copilot"
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-cyan-400/60 transition-colors"
        >
          <h2 className="text-sm font-semibold mb-1">AI copilot</h2>
          <p className="text-xs text-white/70">
            How triage, suggestions, and auto-replies work and when AI sends messages.
          </p>
        </Link>
        <Link
          href="/docs/settings"
          className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-cyan-400/60 transition-colors"
        >
          <h2 className="text-sm font-semibold mb-1">Settings</h2>
          <p className="text-xs text-white/70">
            Configure auto-reply, API keys, and workspace-wide defaults.
          </p>
        </Link>
      </section>
    </div>
  );
}
