import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    badge: 'Sandbox',
    highlight: false,
    features: ['Up to 3 teammates', 'Email channel only', 'AI triage in preview mode'],
  },
  {
    name: 'Growth',
    price: '$49',
    period: 'per agent / month',
    badge: 'Most popular',
    highlight: true,
    features: [
      'Unlimited teammates',
      'Multiple brands and inboxes',
      'Full AI triage and suggested replies',
      'Priority support SLA',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Let’s talk',
    period: 'custom',
    badge: 'Enterprise',
    highlight: false,
    features: [
      'Custom data retention and SSO',
      'Dedicated onboarding engineer',
      'Fine-grained permissions and audit log',
      'Custom workflows and integrations',
    ],
  },
];

export function Pricing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-300">OF</span>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm tracking-tight text-white">
                OpsFlow
              </span>
              <span className="text-[11px] text-white/60">Customer Operations Platform</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/80 hover:text-white">
              Log in
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-grad-main text-white">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_60%)] pointer-events-none" />
        <div className="relative container mx-auto px-6 py-12 lg:py-16 space-y-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-white">
              Clear plans for serious support teams
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              Choose a plan that matches your volume and complexity. All plans share the same core
              platform, security model, and API surface; you only scale up when your operations do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {PLANS.map((plan) => {
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                    plan.highlight
                      ? 'border-cyan-300/80 ring-1 ring-cyan-300/40 bg-slate-900/80'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {plan.badge}
                    </div>
                    <div className="text-lg font-heading font-semibold text-slate-100">
                      {plan.name}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-heading font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-2 text-sm text-slate-300 mt-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-4">
                    <Button
                      className="w-full h-11"
                      variant={plan.highlight ? 'primary' : 'secondary'}
                    >
                      {plan.name === 'Enterprise' ? 'Talk to sales' : 'Start with this plan'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
