import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function Docs() {
  return (
    <div className="min-h-screen bg-page text-text-primary">
      <header className="border-b border-white/10 bg-[#050816]/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-xl">
            OpsFlow
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/pricing" className="text-white/80 hover:text-white">
              Pricing
            </Link>
            <Link to="/login" className="text-white/80 hover:text-white">
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 rounded-full bg-grad-main text-white font-medium text-xs"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[220px,minmax(0,1fr)] gap-12">
          <aside className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-text-muted">
              <BookOpen size={14} />
              <span>Developer docs</span>
            </div>
            <nav className="space-y-1 text-sm">
              <a href="#overview" className="block text-text-muted hover:text-text-primary">
                Overview
              </a>
              <a href="#authentication" className="block text-text-muted hover:text-text-primary">
                Authentication
              </a>
              <a href="#tickets-ai" className="block text-text-muted hover:text-text-primary">
                Tickets and AI workflows
              </a>
            </nav>
          </aside>
          <div className="space-y-12">
            <section id="overview" className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">
                Build on the OpsFlow support graph
              </h1>
              <p className="text-text-muted text-base max-w-2xl">
                OpsFlow exposes a small, stable REST API for creating tickets, running AI triage,
                and keeping your support data aligned with the rest of your stack. The dashboard you
                see in production is built on the same surface.
              </p>
              <div className="glass-panel rounded-2xl p-4 text-xs text-text-muted">
                <div className="mb-2 font-medium text-text-primary">Base URL</div>
                <code className="block bg-black/40 px-3 py-2 rounded">
                  {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                </code>
              </div>
            </section>
            <section id="authentication" className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Authentication
              </h2>
              <p className="text-sm text-text-muted max-w-2xl">
                Authentication uses short‑lived bearer tokens. You typically call the auth endpoints
                from your backend or a secure integration, then call the tickets API with that
                token.
              </p>
              <div className="glass-panel rounded-2xl p-4 space-y-3 text-sm text-text-muted">
                <ul className="space-y-1">
                  <li>
                    <code className="text-xs bg-black/50 px-2 py-1 rounded">POST /auth/signup</code>{' '}
                    create tenant and first admin user
                  </li>
                  <li>
                    <code className="text-xs bg-black/50 px-2 py-1 rounded">POST /auth/login</code>{' '}
                    exchange email and password for tokens
                  </li>
                  <li>
                    <code className="text-xs bg-black/50 px-2 py-1 rounded">GET /auth/me</code>{' '}
                    fetch the current user
                  </li>
                </ul>
                <div>
                  <div className="text-xs font-medium text-text-muted mb-2">
                    Authorization header
                  </div>
                  <pre className="text-xs bg-black/60 rounded-xl p-3 overflow-auto">
                    {`Authorization: Bearer <access_token>`}
                  </pre>
                </div>
              </div>
            </section>
            <section id="tickets-ai" className="space-y-4">
              <h2 className="text-xl font-heading font-semibold text-text-primary">
                Tickets and AI workflows
              </h2>
              <p className="text-sm text-text-muted max-w-2xl">
                Tickets are the core unit in OpsFlow. You can create them from any system, then
                invoke AI workflows to triage, classify, and draft replies. The same analysis powers
                the in‑product AI panel.
              </p>
              <div className="glass-panel rounded-2xl p-4 space-y-3 text-sm text-text-muted">
                <ul className="space-y-1">
                  <li>
                    <code className="text-xs bg-black/50 px-2 py-1 rounded">POST /tickets</code>{' '}
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
                <p className="text-xs text-text-muted">
                  All endpoints are tenant‑scoped and respect the same role model you see in the
                  dashboard (admin vs member).
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
