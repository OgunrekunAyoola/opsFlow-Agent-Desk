import { Link } from 'react-router-dom';
import { BookOpen, Server, Terminal, Zap, Activity } from 'lucide-react';

export function Docs() {
  return (
    <div className="min-h-screen bg-page text-white">
      <header className="border-b border-white/10">
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
      <main className="container mx-auto px-6 py-16 space-y-12">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60 mb-3">
            <BookOpen size={14} />
            <span>Developer docs</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Build on the OpsFlow support graph
          </h1>
          <p className="text-white/70 text-lg">
            Use a small, composable REST API to create tickets, triage them with AI, and keep your
            support desk in sync with the rest of your stack.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DocCard
            icon={Server}
            title="Base URL"
            body={
              <>
                <div className="text-xs text-white/50 mb-2">Backend</div>
                <code className="text-xs bg-black/40 px-2 py-1 rounded">
                  {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                </code>
              </>
            }
          />
          <DocCard
            icon={Terminal}
            title="Auth"
            body={
              <ul className="text-sm text-white/80 space-y-1">
                <li>
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">
                    POST /auth/signup
                  </code>{' '}
                  – create tenant + admin
                </li>
                <li>
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">
                    POST /auth/login
                  </code>{' '}
                  – email + password
                </li>
                <li>
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">
                    GET /auth/me
                  </code>{' '}
                  – current user
                </li>
              </ul>
            }
          />
          <DocCard
            icon={Zap}
            title="AI Workflow"
            body={
              <ul className="text-sm text-white/80 space-y-1">
                <li>
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">
                    POST /tickets
                  </code>{' '}
                  – create ticket
                </li>
                <li>
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">
                    POST /tickets/:id/workflows/triage
                  </code>{' '}
                  – run AI triage
                </li>
                <li>
                  <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">
                    GET /tickets/:id/workflows
                  </code>{' '}
                  – workflow history
                </li>
              </ul>
            }
          />
        </div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-heading font-bold mb-3 flex items-center gap-2">
              <Activity size={18} className="text-emerald-300" />
              Typical flow
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-white/80">
              <li>Call POST /auth/signup or POST /auth/login to obtain an access token.</li>
              <li>
                Create tickets via POST /tickets (from your app, webhook, or existing helpdesk).
              </li>
              <li>Trigger AI triage for important tickets via POST /tickets/:id/workflows/triage.</li>
              <li>
                Read suggested replies and analysis from GET /tickets/:id and workflow history
                endpoints.
              </li>
              <li>Send replies using POST /tickets/:id/reply, or let the UI send on approval.</li>
            </ol>
          </div>
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-heading font-bold mb-3">Authentication</h2>
            <p className="text-sm text-white/80 mb-4">
              All authenticated endpoints expect a bearer token:
            </p>
            <pre className="text-xs bg-black/60 rounded-xl p-4 overflow-auto">
{`Authorization: Bearer <access_token>`}
            </pre>
            <p className="text-xs text-white/60 mt-4">
              Tokens are issued on sign up / login and stored in the dashboard in{' '}
              <code>localStorage</code>. For backend integrations, store them securely on the
              server.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function DocCard({
  icon: Icon,
  title,
  body,
}: {
  icon: any;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
          <Icon size={18} />
        </div>
        <h2 className="text-sm font-heading font-semibold">{title}</h2>
      </div>
      <div>{body}</div>
    </div>
  );
}

