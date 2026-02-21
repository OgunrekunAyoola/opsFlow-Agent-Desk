"use client";

import Link from "next/link";

export default function KnowledgeBaseDocsPage() {
  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Knowledge base</h1>
        <p className="text-sm text-white/70">
          Teach OpsFlow how your product works so AI replies stay accurate.
        </p>
      </header>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">What the knowledge base is</h2>
        <p className="text-white/70">
          The knowledge base is a tenant-scoped collection of articles that describe your
          product, policies, and troubleshooting steps. OpsFlow uses these articles when
          generating AI suggestions so that replies reflect your own docs instead of generic
          answers.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Adding and editing articles</h2>
        <p className="text-white/70">
          Go to the Knowledge Base section in the app. Admin users can create, edit, and
          delete articles. Each article has a title, rich body text, and optional tags that
          help group related content.
        </p>
        <p className="text-white/70">
          Start with a few high-leverage topics: common onboarding issues, billing
          questions, and frequently asked troubleshooting steps. You can always refine the
          content as you see how AI uses it.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">How AI uses your articles</h2>
        <p className="text-white/70">
          When you run triage on a ticket, OpsFlow searches your knowledge base for
          relevant articles. Those snippets are injected into the AI prompt so that the
          draft reply is grounded in your own content.
        </p>
        <p className="text-white/70">
          In the ticket sidebar, the AI panel shows which knowledge base articles were
          used. This makes it easy to understand why a suggestion looks the way it does and
          to spot missing docs.
        </p>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-base font-semibold">Keeping content safe and scoped</h2>
        <p className="text-white/70">
          Articles are always scoped to your tenant. The AI copilot only sees knowledge
          from your workspace when drafting replies, so data never crosses between
          customers.
        </p>
      </section>

      <div className="pt-4 border-top border-white/10 text-xs text-white/60">
        Learn how the AI panel behaves in detail in{" "}
        <Link href="/docs/ai-copilot" className="text-cyan-300 hover:text-cyan-200">
          AI copilot
        </Link>
        .
      </div>
    </div>
  );
}

