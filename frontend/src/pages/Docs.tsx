import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';

export function Docs() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-300">OF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                OpsFlow
              </span>
              <span className="text-[11px] text-white/60">Developer Docs</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              to="/#features-future"
              className="px-3 py-1 rounded-full font-medium text-slate-200/80 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              Features
            </Link>
            <Link
              to="/#integrations"
              className="px-3 py-1 rounded-full font-medium text-slate-200/80 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              Integrations
            </Link>
            <Link
              to="/pricing"
              className="px-3 py-1 rounded-full font-medium text-slate-200/80 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/docs"
              className="px-3 py-1 rounded-full font-medium text-slate-200/80 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-slate-200/80 hover:text-white">
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 rounded-full bg-grad-main text-white font-medium text-xs"
              >
                Start free
              </Link>
            </div>
            <button
              type="button"
              className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
          <div className="container mx-auto px-6 py-3 space-y-2">
            <Link
              to="/#features-future"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-slate-800/80"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#integrations"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-slate-800/80"
              onClick={() => setMobileOpen(false)}
            >
              Integrations
            </Link>
            <Link
              to="/pricing"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-slate-800/80"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/docs"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-slate-800/80"
              onClick={() => setMobileOpen(false)}
            >
              Docs
            </Link>
            <div className="pt-3 mt-1 border-t border-slate-800/80 space-y-3">
              <Link
                to="/login"
                className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-slate-800/80"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-11 rounded-full bg-grad-main text-sm font-medium text-white shadow-lg">
                  Start free
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <main className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_60%)] pointer-events-none" />
        <div className="relative container mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[260px,minmax(0,1fr)] gap-10 lg:gap-16">
            <aside className="lg:pt-4">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-4">
                <BookOpen size={14} />
                <span>Docs</span>
              </div>
              <div className="text-sm text-slate-300 mb-6 max-w-xs">
                Everything you need to wire OpsFlow into a real customer operations stack.
              </div>
              <nav className="space-y-1 text-sm text-slate-300">
                <a
                  href="#getting-started"
                  className="block rounded-md px-3 py-1.5 hover:bg-slate-800/80 hover:text-white"
                >
                  Getting started
                </a>
                <a
                  href="#email-forwarding"
                  className="block rounded-md px-3 py-1.5 hover:bg-slate-800/80 hover:text-white"
                >
                  Email forwarding
                </a>
                <a
                  href="#api"
                  className="block rounded-md px-3 py-1.5 hover:bg-slate-800/80 hover:text-white"
                >
                  API reference
                </a>
                <a
                  href="#integrations"
                  className="block rounded-md px-3 py-1.5 hover:bg-slate-800/80 hover:text-white"
                >
                  Integration guides
                </a>
                <a
                  href="#faq"
                  className="block rounded-md px-3 py-1.5 hover:bg-slate-800/80 hover:text-white"
                >
                  FAQ
                </a>
              </nav>
            </aside>
            <div className="space-y-14">
              <section id="getting-started" className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-cyan-300 uppercase tracking-[0.2em]">
                    Overview
                  </p>
                  <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
                    Getting started with OpsFlow
                  </h1>
                </div>
                <p className="text-sm text-slate-300 max-w-2xl">
                  OpsFlow is a customer operations platform built around tickets, AI triage, and a
                  clean REST API. This page walks you through wiring the product into your stack in
                  minutes.
                </p>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                  <div>
                    <div className="mb-2 text-xs font-semibold text-slate-300">Base URL</div>
                    <code className="block bg-black/40 px-3 py-2 rounded text-xs text-slate-100">
                      {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                    </code>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                    <li>Create a tenant and first admin via the in‑product Sign up flow.</li>
                    <li>Grab the API URL from your environment or this page.</li>
                    <li>Call the auth endpoints from your backend to obtain a bearer token.</li>
                    <li>
                      Use the tickets API to push events from your app, CRM, or support inbox.
                    </li>
                  </ol>
                </div>
              </section>
              <section id="email-forwarding" className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-white">
                  Email forwarding guide
                </h2>
                <p className="text-sm text-slate-300 max-w-2xl">
                  You can pipe customer emails straight into OpsFlow so every support conversation
                  becomes a ticket, with AI triage and assignment applied automatically.
                </p>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-sm text-slate-300">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      In OpsFlow, open{' '}
                      <span className="font-medium text-slate-100">Settings → Inbound email</span>{' '}
                      and copy your tenant&apos;s inbound address.
                    </li>
                    <li>
                      In your email provider (Google Workspace, Microsoft 365, etc.), create a group
                      or alias such as{' '}
                      <code className="bg-black/40 px-1 rounded text-xs">support@</code>.
                    </li>
                    <li>
                      Configure forwarding from that address to the inbound address you copied from
                      OpsFlow.
                    </li>
                    <li>
                      Send a test email. You should see a new ticket in the{' '}
                      <span className="font-medium text-slate-100">Tickets</span> view within a few
                      seconds.
                    </li>
                  </ol>
                  <p className="text-xs text-slate-400">
                    Forwarding happens at the envelope level only. Authentication and spam filtering
                    stay in your email provider.
                  </p>
                </div>
              </section>
              <section id="api" className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-heading font-semibold text-white">API reference</h2>
                  <p className="text-sm text-slate-300 max-w-2xl">
                    The OpsFlow API is small on purpose: a few endpoints to authenticate, create
                    tickets, and run AI workflows. All endpoints are tenant‑scoped and use JSON over
                    HTTPS.
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-heading font-semibold text-slate-100">
                      Authentication
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl">
                      Authentication uses short‑lived bearer tokens. Call these endpoints from a
                      trusted environment (your backend, a secure worker, or an integration
                      service).
                    </p>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
                      <ul className="space-y-1">
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            POST /auth/signup
                          </code>{' '}
                          create tenant and first admin user
                        </li>
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            POST /auth/login
                          </code>{' '}
                          exchange email and password for tokens
                        </li>
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            GET /auth/me
                          </code>{' '}
                          fetch the current user
                        </li>
                      </ul>
                      <div>
                        <div className="text-xs font-medium text-slate-400 mb-2">
                          Authorization header
                        </div>
                        <pre className="text-xs bg-black/60 rounded-xl p-3 overflow-auto text-slate-100">
                          {`Authorization: Bearer <access_token>`}
                        </pre>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-heading font-semibold text-slate-100">
                      Tickets and AI workflows
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl">
                      Tickets are the core unit in OpsFlow. You can create them from any system,
                      then invoke AI workflows to triage, classify, and draft replies. The same
                      analysis powers the in‑product AI panel.
                    </p>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
                      <ul className="space-y-1">
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            POST /tickets
                          </code>{' '}
                          create a ticket
                        </li>
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            POST /tickets/:id/workflows/triage
                          </code>{' '}
                          run AI triage on a ticket
                        </li>
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            GET /tickets/:id/workflows
                          </code>{' '}
                          inspect workflow history and AI outputs
                        </li>
                        <li>
                          <code className="text-xs bg-black/50 px-2 py-1 rounded">
                            POST /tickets/:id/reply
                          </code>{' '}
                          attach and send a reply
                        </li>
                      </ul>
                      <p className="text-xs text-slate-400">
                        All endpoints respect the same role model you see in the dashboard (admin vs
                        member) and return standard HTTP status codes on error.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section id="integrations" className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-white">
                  Integration guides
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
                  <div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">
                      Backend services
                    </div>
                    <p className="text-xs">
                      Use your existing job workers or API layer to push important events into
                      OpsFlow as tickets. For example, failed payments, uptime incidents, or key
                      account changes.
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">
                      CRMs and helpdesks
                    </div>
                    <p className="text-xs">
                      Mirror tickets into your CRM by listening for ticket webhooks and writing a
                      small adapter that syncs status, priority, and account metadata.
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">Internal tools</div>
                    <p className="text-xs">
                      Build lightweight internal tools on top of the OpsFlow API to give sales,
                      product, or leadership curated views of customer issues and AI insights.
                    </p>
                  </div>
                </div>
              </section>
              <section id="faq" className="space-y-4">
                <h2 className="text-xl font-heading font-semibold text-white">FAQ</h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
                  <div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">
                      Is the API stable?
                    </div>
                    <p className="text-xs">
                      Yes. The surface area is intentionally small and changes are rolled out
                      backwards‑compatible whenever possible.
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">
                      How does authentication expire?
                    </div>
                    <p className="text-xs">
                      Access tokens are short‑lived. Your integration should be prepared to refresh
                      or re‑authenticate when you receive 401 responses.
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 mb-1">
                      Can I use OpsFlow in multiple environments?
                    </div>
                    <p className="text-xs">
                      Yes. Use separate tenants and API keys for staging and production, and wire
                      each environment to its own OpsFlow workspace.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
