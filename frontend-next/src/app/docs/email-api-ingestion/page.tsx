"use client";

import Link from "next/link";

export default function EmailApiIngestionPage() {
  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Email and API ingestion</h1>
        <p className="text-sm text-white/70">
          Get customer messages into OpsFlow from email, your own backend, or embedded chat.
        </p>
      </header>

      <section className="space-y-4 text-sm">
        <h2 className="text-base font-semibold">Email forwarding</h2>
        <p className="text-white/70">
          Configure your support inbox to forward messages into OpsFlow. Each inbound email
          becomes a ticket with the sender&apos;s address and message body attached. Duplicate
          messages are deduplicated using the email message-id when provided.
        </p>
      </section>

      <section className="space-y-4 text-sm">
        <h2 className="text-base font-semibold">Generic ingestion API</h2>
        <p className="text-white/70">
          Use the ingestion API to create tickets from your own systems. Authenticate using
          the tenant API key and send a simple JSON payload.
        </p>
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white/90">POST /tickets/ingest</span>
            <span className="text-white/60">tenant-scoped API key</span>
          </div>
          <pre className="whitespace-pre-wrap text-white/80">
{`Headers:
  x-opsflow-key: YOUR_API_KEY

Body (JSON):
  {
    "subject": "Short summary",
    "body": "Full description of the issue",
    "customerName": "Optional name",
    "customerEmail": "Optional email",
    "externalId": "Optional id from your system",
    "channel": "chat | email"
  }`}
          </pre>
          <p className="text-white/60">
            Requests with the same externalId for a tenant will re-use the existing ticket
            instead of creating duplicates.
          </p>
        </div>
      </section>

      <section className="space-y-4 text-sm">
        <h2 className="text-base font-semibold">Lightweight chat widget</h2>
        <p className="text-white/70">
          OpsFlow ships with a minimal chat-style form at <code className="px-1 py-0.5 rounded bg-white/10 text-[11px]">/widget/chat</code>.
          You can embed it in your app or proxy requests through your own frontend if you
          prefer full control.
        </p>
      </section>

      <div className="pt-4 border-t border-white/10 text-xs text-white/60">
        Continue to{" "}
        <Link href="/docs/knowledge-base" className="text-cyan-300 hover:text-cyan-200">
          Knowledge base
        </Link>{" "}
        to see how AI uses your docs once tickets are ingested.
      </div>
    </div>
  );
}

