"use client";

import Link from "next/link";

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Getting started</h1>
        <p className="text-sm text-white/70">
          A short path from zero to your first AI-assisted ticket resolution.
        </p>
      </header>

      <ol className="space-y-6 text-sm">
        <li className="space-y-2">
          <h2 className="text-base font-semibold">1. Sign in and invite your team</h2>
          <p className="text-white/70">
            Sign in to OpsFlow, create your workspace, and invite the teammates who will
            handle tickets. Each user is scoped to your tenant so data never leaks between
            workspaces.
          </p>
        </li>
        <li className="space-y-2">
          <h2 className="text-base font-semibold">2. Create or ingest your first ticket</h2>
          <p className="text-white/70">
            Use the Tickets page to create a ticket manually, or set up ingestion from email
            and API. Email and API ingestion are covered in more detail in{" "}
            <Link href="/docs/email-api-ingestion" className="text-cyan-300 hover:text-cyan-200">
              Email and API ingestion
            </Link>
            .
          </p>
        </li>
        <li className="space-y-2">
          <h2 className="text-base font-semibold">3. Add a few knowledge base articles</h2>
          <p className="text-white/70">
            Go to the Knowledge Base section and add a handful of articles that reflect your
            most common issues, troubleshooting steps, and policy answers. The AI copilot
            uses these articles when drafting replies so that responses stay accurate.
          </p>
        </li>
        <li className="space-y-2">
          <h2 className="text-base font-semibold">4. Run AI triage on a ticket</h2>
          <p className="text-white/70">
            Open a ticket and click Run triage in the AI panel. OpsFlow will classify the
            ticket, set priority, suggest an assignee, and create a draft reply grounded in
            your knowledge base.
          </p>
        </li>
        <li className="space-y-2">
          <h2 className="text-base font-semibold">5. Review and send the AI suggestion</h2>
          <p className="text-white/70">
            Read the draft reply, check the confidence label, and look at the knowledge
            base sources it used. When you are comfortable, click Use suggestion and send to
            send it as a human reply. AI never sends messages without a human click.
          </p>
        </li>
      </ol>
    </div>
  );
}

