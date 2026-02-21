export default function Home() {
  return (
    <div className="overflow-x-hidden text-white">
      <header className="container mx-auto px-6 pt-32 pb-24 lg:pt-40 lg:pb-40">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-medium uppercase tracking-wide text-white/80">
            🚀 Now in public beta
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative">
          <div className="lg:col-span-7">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              The future of support
              <br />
              is autonomous
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
              Your AI copilot reads every ticket, understands every customer, and drafts every
              reply—instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="/signup"
                className="inline-flex h-14 items-center justify-center rounded-full bg-cyan-500 px-8 text-lg font-medium text-white shadow-xl hover:bg-cyan-400 hover:shadow-2xl transition-colors w-full sm:w-auto"
              >
                Start your evolution
              </a>
              <a
                href="#why-opsflow"
                className="h-14 px-8 rounded-full bg-white/10 border border-white/20 text-white font-medium transition-colors shadow-md hover:bg-white/15 hover:shadow-lg inline-flex items-center justify-center w-full sm:w-auto"
              >
                See how it works
              </a>
            </div>
            <div className="mt-4 text-sm text-white/60">
              Free trial • No credit card • Wire your first inbox in minutes
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-white/20 bg-white/5 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/60">OpsFlow AI Triage</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                  ● Live
                </span>
              </div>
              <div className="p-6 space-y-4 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/60">New tickets today</p>
                    <p className="text-2xl font-bold">87</p>
                  </div>
                  <div className="text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-2 py-1 rounded-full">
                    92% auto-triaged
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="text-white/60 mb-1">Billing</div>
                    <div className="text-lg font-semibold">24</div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="text-white/60 mb-1">Bugs</div>
                    <div className="text-lg font-semibold">31</div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="text-white/60 mb-1">Features</div>
                    <div className="text-lg font-semibold">32</div>
                  </div>
                </div>
                <div className="mt-2 rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-xs flex items-center justify-between">
                  <span className="text-white/70">
                    “Draft reply ready. Just hit send to delight this customer.”
                  </span>
                  <span className="text-cyan-300 font-medium">AI Draft ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="why-opsflow" className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-3">Triage every ticket instantly</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              OpsFlow reads every incoming email, classifies intent, sentiment, and priority, and
              routes it to the right person or queue automatically.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">Draft replies in your voice</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Suggested replies come pre-filled with context from the ticket, your past
              conversations, and your playbooks. Your team edits in seconds instead of writing from
              scratch.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">See the whole support story</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              The dashboard shows volume, sentiment, and AI resolution rate so you can spot trends
              before they become incidents.
            </p>
          </div>
        </div>
      </section>

      <section
        id="integrations"
        className="container mx-auto px-6 pb-24 border-t border-white/10 pt-16"
      >
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl font-semibold mb-3">Wire the tools you already use</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Connect your existing inboxes and CRMs. Start with email, then layer in chat, WhatsApp,
            and more as you grow.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/70">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="font-medium text-white mb-1">Shared inboxes</div>
            <p>Forward support@ and help@ into OpsFlow without changing your MX records.</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="font-medium text-white mb-1">Help desks</div>
            <p>Sync tickets with tools like Zendesk so AI triage fits your current workflows.</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="font-medium text-white mb-1">Messaging</div>
            <p>Bring chat and messaging channels into the same AI-first queue.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
