"use client";

import Link from "next/link";

export default function SettingsDocsPage() {
  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-white/70">
          Configure auto-replies, API keys, and other workspace-wide defaults.
        </p>
      </header>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Auto-reply configuration</h2>
        <p className="text-white/70">
          In the settings area, you can enable automatic replies for specific categories and
          set a minimum confidence threshold. When an AI draft meets these criteria,
          OpsFlow will send the reply automatically and mark the ticket as auto_resolved.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Ingestion API key</h2>
        <p className="text-white/70">
          Each tenant can generate an ingestion API key used to authenticate calls to the
          <code className="px-1 py-0.5 rounded bg-white/10 text-[11px]">/tickets/ingest</code>{" "}
          endpoint. You can rotate the key at any time. After rotation, update any systems
          that call the ingestion API so they keep working.
        </p>
        <p className="text-white/70">
          Only admins can view or rotate the key. All API usage is scoped to your tenant
          and shows up in dashboard metrics.
        </p>
        <p className="text-white/70">
          See{" "}
          <Link
            href="/docs/email-api-ingestion"
            className="text-cyan-300 hover:text-cyan-200"
          >
            Email and API ingestion
          </Link>{" "}
          for full request examples.
        </p>
      </section>
    </div>
  );
}

