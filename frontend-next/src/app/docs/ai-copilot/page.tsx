"use client";

export default function AiCopilotDocsPage() {
  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">AI copilot</h1>
        <p className="text-sm text-white/70">
          How OpsFlow triages tickets, drafts replies, and when it is allowed to send
          messages.
        </p>
      </header>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">AI triage</h2>
        <p className="text-white/70">
          From a ticket, click Run triage in the sidebar. OpsFlow will classify the ticket,
          choose a priority, suggest an assignee, and generate a draft reply using your
          knowledge base.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Draft replies and confidence</h2>
        <p className="text-white/70">
          The AI panel shows a draft reply along with a confidence label. Confidence is
          based on how well the ticket matches historical patterns and your knowledge base
          content. You can always edit the draft before sending or choose to ignore it.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Auto-replies</h2>
        <p className="text-white/70">
          If you enable auto-replies for certain categories in settings, OpsFlow can send
          an email reply automatically when confidence is above your configured threshold.
          Tickets resolved this way are marked as auto_resolved and still appear in
          reporting.
        </p>
        <p className="text-white/70">
          Even with auto-replies, the AI uses your knowledge base and your tenant-scoped
          data only.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Human in the loop</h2>
        <p className="text-white/70">
          Outside of configured auto-reply thresholds, AI never sends messages on its own.
          A human must click to send the suggestion as a reply. This is especially useful
          while you are still tuning the knowledge base and categories.
        </p>
      </section>
    </div>
  );
}

