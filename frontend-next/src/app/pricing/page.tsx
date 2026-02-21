'use client';

import Link from 'next/link';

const PLANS = [
  {
    id: 'growth',
    name: 'Growth',
    priceMonthly: '$39',
    priceYearly: '$374',
    period: 'per agent / month',
    badge: 'Best for small teams',
    highlight: false,
    idealFor: 'Startups and SMBs getting serious about support.',
    features: [
      'Core AI triage, drafts, and sentiment',
      'Unlimited tickets over email',
      'Up to 10 agents with roles',
      'Basic metrics dashboard and weekly reports',
      'Email support and knowledge base',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: '$69',
    priceYearly: '$662',
    period: 'per agent / month',
    badge: 'Most popular',
    highlight: true,
    idealFor: 'Growing teams and agencies managing multiple brands.',
    features: [
      'Everything in Growth',
      'Advanced AI auto-reply and confidence controls',
      'Multi-channel (email, chat, WhatsApp)',
      'SLAs, advanced analytics, and report exports',
      'Priority support and onboarding call',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: '$149',
    priceYearly: 'Custom',
    period: 'per agent / month or custom',
    badge: 'For large teams',
    highlight: false,
    idealFor: 'Enterprises with complex workflows and strict compliance needs.',
    features: [
      'Everything in Professional',
      'Dedicated AI instance and data isolation',
      'Omnichannel routing and custom integrations',
      'SAML/SSO, audit logs, and data residency options',
      'Dedicated account team and custom SLAs',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-6 py-16 lg:py-20 text-white">
      <div className="max-w-3xl mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-300 mb-3">Pricing</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing that grows with your team</h1>
        <p className="text-sm md:text-base text-slate-200 max-w-2xl">
          Start with a 14-day free trial. No credit card required. Choose a plan when you are ready
          and only pay for the agents you keep active.
        </p>
        <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-200">
          14-day free trial • All Growth features • No card required
        </div>
      </div>

      <section aria-label="Plans" className="grid gap-6 md:grid-cols-3 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border bg-slate-950/60 p-6 flex flex-col gap-4 ${
              plan.highlight
                ? 'border-cyan-400/70 shadow-[0_18px_60px_rgba(34,211,238,0.35)]'
                : 'border-slate-800/80'
            }`}
          >
            {plan.badge && (
              <div
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${
                  plan.highlight
                    ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/60'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
              >
                {plan.badge}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-1">{plan.name}</h2>
              <p className="text-xs text-slate-300">{plan.idealFor}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{plan.priceMonthly}</span>
              <span className="text-xs text-slate-300">{plan.period}</span>
            </div>
            <p className="text-xs text-slate-400">
              Billed annually: <span className="font-medium">{plan.priceYearly}</span>
            </p>
            <button
              type="button"
              className={`mt-2 inline-flex items-center justify-center h-10 rounded-full text-sm font-medium w-full ${
                plan.highlight
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'bg-white/5 text-white hover:bg-white/10'
              } transition-colors`}
            >
              {plan.id === 'enterprise' ? 'Talk to sales' : 'Start free trial'}
            </button>
            <ul className="mt-4 space-y-2 text-xs text-slate-200">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3 text-sm text-slate-200">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h3 className="font-semibold mb-2">Transparent billing</h3>
          <p>
            Add or remove agents at any time. Only pay for active seats in the current billing
            period.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h3 className="font-semibold mb-2">Enterprise ready</h3>
          <p>
            SOC2-ready practices, SSO options, and data residency controls on the Enterprise plan.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h3 className="font-semibold mb-2">Need something custom?</h3>
          <p>
            <Link href="/signup" className="text-cyan-300 hover:text-cyan-200">
              Talk to us
            </Link>{' '}
            about volume discounts, agencies, or multi-brand setups.
          </p>
        </div>
      </section>
    </div>
  );
}
