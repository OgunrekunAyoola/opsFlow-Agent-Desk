import { useState } from 'react';
import {
  Check,
  Menu,
  X,
  Bot,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Shield,
  Globe2,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const PAID_PLANS = [
  {
    id: 'growth',
    name: 'Growth',
    priceMonthly: '$39',
    priceYearly: '$374',
    period: 'per agent / month',
    badge: 'Best for small teams',
    highlight: false,
    idealFor: 'Startups and SMBs getting serious about support.',
    ctaLabel: 'Start with Growth',
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
    ctaLabel: 'Start with Professional',
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
    ctaLabel: 'Talk to sales',
    features: [
      'Everything in Professional',
      'Dedicated AI instance and data isolation',
      'Omnichannel routing and custom integrations',
      'SAML/SSO, audit logs, and data residency options',
      'Dedicated account team and custom SLAs',
    ],
  },
];

export function Pricing() {
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
              <span className="text-[11px] text-white/60">Customer Operations Platform</span>
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
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-sm text-white/80 hover:text-white">
                Log in
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-grad-main text-white">
                  Start free
                </Button>
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
                <Button className="w-full h-11 bg-grad-main text-white shadow-lg">
                  Start free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      <main className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.18),_transparent_60%)] pointer-events-none" />
        <div className="relative container mx-auto px-6 py-12 lg:py-16 space-y-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-white">
              Pricing that grows with your team
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              Start with a 14-day free trial. No credit card required. Choose a plan when you are
              ready and only pay for the agents you keep active.
            </p>
            <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2">
              <span className="text-xs font-medium text-cyan-200">
                14-day free trial • All Growth features • No card required
              </span>
            </div>
          </div>

          <section aria-label="All plans include" className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">All plans include</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                  <Check size={16} className="text-emerald-400" />
                  Core platform
                </div>
                <p className="text-xs text-slate-300">
                  Unlimited tickets, AI-powered triage and drafts, team collaboration, and a shared
                  metrics dashboard for your whole workspace.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                  <Check size={16} className="text-emerald-400" />
                  Reliable operations
                </div>
                <p className="text-xs text-slate-300">
                  Tenant-isolated data model, HTTPS everywhere, daily backups, and opinionated
                  defaults for safe AI usage.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                  <Check size={16} className="text-emerald-400" />
                  Human support
                </div>
                <p className="text-xs text-slate-300">
                  Email support from the team building OpsFlow, plus an evolving docs site and
                  runbooks for common issues.
                </p>
              </div>
            </div>
          </section>

          <section aria-label="Paid plans" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-heading font-semibold text-white mb-1">
                  Choose your plan
                </h2>
                <p className="text-xs text-slate-400">
                  Prices shown are monthly. Save around 20% when you pay annually.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {PAID_PLANS.map((plan) => {
                return (
                  <div
                    key={plan.id}
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
                          {plan.priceMonthly}
                        </span>
                        <span className="text-xs text-slate-400">{plan.period}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        or {plan.priceYearly}/agent/year with annual billing
                      </div>
                      <p className="text-xs text-slate-300">{plan.idealFor}</p>
                    </div>
                    <ul className="flex-1 space-y-2 text-sm text-slate-300 mt-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={plan.id === 'enterprise' ? '/contact' : '/signup'} className="mt-4">
                      <Button
                        className="w-full h-11"
                        variant={plan.highlight ? 'primary' : 'secondary'}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          <section
            aria-label="Plan comparison"
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-lg font-heading font-semibold text-white">Compare plans</h2>
                <p className="text-xs text-slate-400">
                  See how Growth, Professional, and Enterprise differ on features and limits.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full text-xs text-left border-separate border-spacing-y-1">
                <thead>
                  <tr>
                    <th className="py-2 pr-4 text-slate-400 font-normal">Feature</th>
                    <th className="py-2 px-3 text-slate-100 font-semibold">Growth</th>
                    <th className="py-2 px-3 text-slate-100 font-semibold">Professional</th>
                    <th className="py-2 pl-3 text-slate-100 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Pricing</td>
                    <td className="py-2 px-3 text-slate-200">
                      $39/agent/mo
                      <br />
                      Save 20% annually
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      $69/agent/mo
                      <br />
                      Save 20% annually
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      From $149/agent/mo
                      <br />
                      Custom for 100+ agents
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Agents</td>
                    <td className="py-2 px-3 text-slate-200">Up to 10</td>
                    <td className="py-2 px-3 text-slate-200">Up to 50</td>
                    <td className="py-2 px-3 text-slate-200">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Channels</td>
                    <td className="py-2 px-3 text-slate-200">Email</td>
                    <td className="py-2 px-3 text-slate-200">Email, chat, WhatsApp</td>
                    <td className="py-2 px-3 text-slate-200">Omnichannel (all)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">AI</td>
                    <td className="py-2 px-3 text-slate-200">
                      Triage, drafts (~80%),
                      <br />
                      sentiment, priority
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Everything in Growth plus
                      <br />
                      advanced auto-reply and controls
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Dedicated AI instance,
                      <br />
                      custom models and routing rules
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Analytics</td>
                    <td className="py-2 px-3 text-slate-200">
                      Basic metrics dashboard,
                      <br />
                      weekly email reports
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Advanced dashboards,
                      <br />
                      SLA reporting, exports
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Custom dashboards, real-time,
                      <br />
                      BI exports and API access
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Integrations</td>
                    <td className="py-2 px-3 text-slate-200">Email providers, basic automations</td>
                    <td className="py-2 px-3 text-slate-200">
                      Zendesk/Intercom, HubSpot,
                      <br />
                      webhooks, advanced alerts
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Custom integrations and
                      <br />
                      dedicated integration engineer
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Support</td>
                    <td className="py-2 px-3 text-slate-200">
                      Email (24–48h),
                      <br />
                      docs and community
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Email + chat (4–12h),
                      <br />
                      monthly check-ins
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      Dedicated account team,
                      <br />
                      1–2h response, 24/7 option
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Security</td>
                    <td className="py-2 px-3 text-slate-200">
                      Standard security,
                      <br />
                      HTTPS, backups
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      SSO, audit logs,
                      <br />
                      custom retention
                    </td>
                    <td className="py-2 px-3 text-slate-200">
                      SAML/SSO, data residency,
                      <br />
                      SOC 2 and custom SLAs
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-slate-300">Data retention</td>
                    <td className="py-2 px-3 text-slate-200">30 days</td>
                    <td className="py-2 px-3 text-slate-200">90 days</td>
                    <td className="py-2 px-3 text-slate-200">Unlimited or custom</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section aria-label="FAQ" className="space-y-6">
            <div>
              <h2 className="text-lg font-heading font-semibold text-white mb-1">
                Frequently asked questions
              </h2>
              <p className="text-xs text-slate-400">
                If you have a question that is not covered here, reach out to{' '}
                <a
                  href="mailto:sales@opsflowai.com"
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                >
                  sales@opsflowai.com
                </a>
                .
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  What happens after my 14-day trial?
                </h3>
                <p className="text-xs text-slate-300">
                  After 14 days you will be asked to choose a paid plan to continue using OpsFlow.
                  If you do nothing, your workspace becomes read-only: you can view tickets but
                  cannot create new ones or reply.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="text-sm font-semibold text-slate-100">Can I change plans later?</h3>
                <p className="text-xs text-slate-300">
                  Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately;
                  downgrades apply from your next billing period.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  What payment methods do you accept?
                </h3>
                <p className="text-xs text-slate-300">
                  We use Stripe for billing and accept major credit and debit cards (Visa,
                  Mastercard, Amex). Enterprise customers can also pay by invoice on Net 30 terms.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  Do you offer discounts or volume pricing?
                </h3>
                <p className="text-xs text-slate-300">
                  Yes. Annual billing includes around 20% savings compared to monthly. We also offer
                  volume discounts for larger teams on the Enterprise plan.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  What if I need more than 50 agents?
                </h3>
                <p className="text-xs text-slate-300">
                  If you are running a large team or multiple brands, the Enterprise plan scales
                  with you. Contact us to design the right mix of seats, channels, and support.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h3 className="text-sm font-semibold text-slate-100">
                  Can I try Professional or Enterprise features during trial?
                </h3>
                <p className="text-xs text-slate-300">
                  Your trial unlocks the Growth feature set by default. If you want to explore
                  Professional or Enterprise capabilities, we can walk you through them in a live
                  demo.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-white/10 bg-white/5">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-grad-main flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Bot size={24} />
                </div>
                <span className="font-heading font-bold text-xl tracking-tight">OpsFlow</span>
              </div>
              <p className="mt-4 text-white/70 text-sm">
                Autonomous support platform for modern teams.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white">
                  <Twitter />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-white">
                  <Linkedin />
                </a>
                <a href="#" aria-label="GitHub" className="text-white/70 hover:text-white">
                  <Github />
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#features-future" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#integrations" className="hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/docs" className="hover:text-white">
                    Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-4">Stay in the loop</h5>
              <form className="flex items-center gap-2">
                <div className="flex-1 h-10 rounded-lg bg-white/10 border border-white/20 px-3 text-sm text-white/80 flex items-center gap-2">
                  <Mail size={16} className="opacity-70" />
                  <input
                    aria-label="Email"
                    type="email"
                    placeholder="you@company.com"
                    className="bg-transparent outline-none flex-1 placeholder:text-white/50"
                  />
                </div>
                <Button size="sm" className="bg-grad-main text-white">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-white/50 mt-2">
                By subscribing you agree to our Terms & Privacy.
              </p>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              <span>Enterprise security: SSO, SAML, SOC 2-ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 size={14} className="text-cyan-400" />
              <span>Global: 99.9% uptime, multi-region</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-purple-400" />
              <span>Analytics: actionable insights out of the box</span>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-white/70 text-sm">
            © 2026 OpsFlow Agent Desk · Terms · Privacy · Security
          </div>
        </div>
      </footer>
    </div>
  );
}
