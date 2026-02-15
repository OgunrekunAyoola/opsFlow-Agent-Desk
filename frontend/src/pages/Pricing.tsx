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
    <div className="min-h-screen bg-page text-text-primary">
      <header className="border-b border-white/10 bg-[#050816]/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-xl">
            OpsFlow
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
      <main className="container mx-auto px-6 py-16 space-y-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-text-muted mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Clear plans for serious support teams
          </h1>
          <p className="text-text-muted text-base">
            Choose a plan that matches your volume and complexity. All plans share the same core
            platform, security model, and API surface; you only scale up when your operations do.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            return (
              <div
                key={plan.name}
                className={`glass-panel rounded-2xl border p-6 flex flex-col gap-4 ${
                  plan.highlight ? 'border-cyan-300/80 ring-1 ring-cyan-300/30' : 'border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-text-muted">
                    {plan.badge}
                  </div>
                  <div className="text-lg font-heading font-semibold text-text-primary">
                    {plan.name}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold">{plan.price}</span>
                    <span className="text-xs text-text-muted">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2 text-sm text-text-muted mt-2">
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
      </main>
    </div>
  );
}
