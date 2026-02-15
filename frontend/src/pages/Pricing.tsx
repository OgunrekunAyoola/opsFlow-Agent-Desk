import { Check, Zap, Rocket, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    badge: 'Sandbox',
    highlight: false,
    icon: Zap,
    features: ['Up to 3 teammates', 'Email channel only', 'AI triage in preview mode'],
  },
  {
    name: 'Growth',
    price: '$49',
    period: 'per agent / month',
    badge: 'Most popular',
    highlight: true,
    icon: Rocket,
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
    icon: Shield,
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
    <div className="min-h-screen bg-page text-white">
      <header className="border-b border-white/10">
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
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Plans that scale with your support team
          </h1>
          <p className="text-white/70">
            Start free, switch plans as you grow, and keep every agent operating with an AI copilot
            from day one.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`rounded-2xl border ${
                  plan.highlight
                    ? 'border-cyan-400 bg-white/10 shadow-xl'
                    : 'border-white/10 bg-white/5'
                } p-6 flex flex-col gap-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-wide text-white/60">{plan.name}</div>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-3xl font-heading font-bold">{plan.price}</span>
                      <span className="text-xs text-white/60 mb-1">{plan.period}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
                    <Icon size={22} />
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-white/10 text-white/80 w-fit">
                  {plan.badge}
                </div>
                <ul className="flex-1 space-y-2 text-sm text-white/80 mt-2">
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
