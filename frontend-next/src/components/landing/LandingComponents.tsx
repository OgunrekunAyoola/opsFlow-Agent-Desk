'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = ['Product', 'Features', 'Pricing', 'Docs', 'Changelog'];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
        background: scrolled ? 'rgba(4,4,4,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: '#f0f0f0' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', color: '#000', fontWeight: 900, fontSize: 14 }}>O</span>
            OpsFlow<span style={{ color: 'var(--accent)' }}>AI</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desk-nav">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--text-muted)',
                transition: 'color 0.2s, background 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >{l}</a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', padding: '7px 14px', borderRadius: 8, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
            >Sign in</Link>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 14,
              padding: '8px 18px', borderRadius: 'var(--radius-pill)', transition: 'all 0.2s',
              boxShadow: '0 0 20px rgba(170,255,0,0.25)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(170,255,0,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(170,255,0,0.25)'; }}
            >Get started →</Link>
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desk-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
export function Hero() {
  const [typed, setTyped] = useState('');
  const fullText = "AI is analyzing ticket #4821 and drafting a personalized reply...";

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < fullText.length) { setTyped(fullText.slice(0, ++i)); }
      else clearInterval(t);
    }, 38);
    return () => clearInterval(t);
  }, []);

  const words = ["Support.", "Triage.", "Replies.", "Automation."];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 80, overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {/* Main radial glow */}
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle, rgba(170,255,0,0.07) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glow-pulse 4s ease-in-out infinite' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900 }}>
        {/* Badge */}
        <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(170,255,0,0.25)', background: 'rgba(170,255,0,0.05)', marginBottom: 36 }}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite', opacity: 0.7 }} />
            <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase' }}>Now in public beta · 2,000+ teams onboarded</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-1" style={{ fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em', color: '#f5f5f5', marginBottom: 20 }}>
          AI-Powered<br />
          <span className="gradient-text" style={{ display: 'inline-block' }}>{words[wordIdx]}</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-up delay-2" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          OpsFlowAI triages every ticket, drafts intelligent replies, and learns from your best agents — fully automated.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-3" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 64 }}>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 'var(--radius-pill)',
            background: 'var(--accent)', color: '#000', fontWeight: 800, fontSize: 16,
            boxShadow: '0 0 40px rgba(170,255,0,0.35), 0 8px 32px rgba(0,0,0,0.4)', transition: 'all 0.25s var(--spring)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.03)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(170,255,0,0.55), 0 12px 40px rgba(0,0,0,0.5)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(170,255,0,0.35), 0 8px 32px rgba(0,0,0,0.4)'; }}
          >Start free — no credit card →</Link>
          <a href="#demo" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
            color: 'var(--text)', fontWeight: 600, fontSize: 16, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
          >▶ Watch 2-min demo</a>
        </div>

        {/* Social proof */}
        <div className="animate-fade-up delay-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {['AM','JD','KL','RW','ST','BM'].map((init, i) => (
              <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--bg)', background: `hsl(${i * 55}, 40%, 18%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginLeft: i > 0 ? -10 : 0 }}>{init}</div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--accent)', fontSize: 14, letterSpacing: 2 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loved by <strong style={{ color: 'var(--text)' }}>2,000+ support teams</strong></span>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="animate-fade-up delay-5" style={{ marginTop: 72, position: 'relative' }}>
          {/* Glow behind card */}
          <div style={{ position: 'absolute', inset: '-40px -60px', background: 'radial-gradient(ellipse, rgba(170,255,0,0.12) 0%, transparent 60%)', pointerEvents: 'none', animation: 'glow-pulse 3s ease-in-out infinite', borderRadius: '50%' }} />

          {/* Floating card */}
          <div style={{
            position: 'relative', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(40px)',
            overflow: 'hidden', animation: 'float 6s ease-in-out infinite',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
          }}>
            {/* Left: Ticket */}
            <div style={{ padding: 28, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {['#FF5F57','#FFBD2E','#27C93F'].map((c,i) => <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, display: 'block' }} />)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#7c83fd', border: '1px solid rgba(124,131,253,0.2)' }}>JD</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Jane Doe</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>jane@startup.io · just now</div>
                </div>
                <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Urgent</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>API integration failing — 500 errors</div>
              {[100, 80, 95, 60].map((w, i) => (
                <div key={i} style={{ height: 9, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 8, width: `${w}%`, animation: `shimmer 2.4s ease-in-out ${i * 0.2}s infinite` }}>
                  <div style={{ height: '100%', width: '30%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)', animation: 'shimmer 1.8s ease infinite' }} />
                </div>
              ))}
              <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: 'rgba(170,255,0,0.04)', border: '1px solid rgba(170,255,0,0.12)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>AI Analysis</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Root cause: Authorization header mismatch</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>
                  <span>Confidence</span><span>94%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(170,255,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '94%', background: 'var(--accent)', borderRadius: 3, animation: 'progress-fill 1.5s ease 1.5s both' }} />
                </div>
              </div>
            </div>

            {/* Right: AI Draft */}
            <div style={{ padding: 28, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI drafting reply</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />)}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75, minHeight: 140 }}>
                {typed}
                <span style={{ animation: 'typing-cursor 1s step-end infinite', opacity: 1, color: 'var(--accent)' }}>|</span>
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                <button style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--accent)', color: '#000', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 0 16px rgba(170,255,0,0.3)' }}>Send reply ↗</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LOGOS BAR
───────────────────────────────────────────── */
export function LogoBar() {
  const logos = ['Atlassian', 'Notion', 'Linear', 'Vercel', 'Stripe', 'Figma', 'GitHub', 'Loom'];
  return (
    <section style={{ padding: '40px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
      <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28 }}>Trusted by teams at</p>
      <div style={{ display: 'flex', gap: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 60, animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap', paddingRight: 60, flexShrink: 0 }}>
          {[...logos, ...logos].map((l, i) => (
            <span key={i} style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '-0.02em', flexShrink: 0 }}>{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
const features = [
  { icon: '⚡', title: 'Instant Triage', desc: 'Every incoming ticket gets priority scored, categorized, and routed in under 2 seconds by our AI engine.', accent: '#AAFF00' },
  { icon: '✍️', title: 'Smart Drafts', desc: 'Context-aware, on-brand replies drafted from your knowledge base. Agents review and send — never start from scratch.', accent: '#7c83fd' },
  { icon: '🔄', title: 'Auto-Routing', desc: 'Intelligent assignment based on agent expertise, availability, and customer tier. No more cherry-picking tickets.', accent: '#f59e0b' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Live CSAT, deflection rates, SLA compliance, and agent performance — all in one unified dashboard.', accent: '#ec4899' },
  { icon: '🔌', title: 'Every Integration', desc: 'Connect your email, Zendesk, Slack, Intercom, Linear, and CRM in minutes with pre-built connectors.', accent: '#06b6d4' },
  { icon: '🛡️', title: 'Enterprise Security', desc: 'SOC 2 Type II, GDPR compliant. Full audit trails, RBAC, SSO, and tenant isolation built in from day one.', accent: '#a78bfa' },
];

export function Features() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section id="features" style={{ padding: '100px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(170,255,0,0.2)', background: 'rgba(170,255,0,0.04)', marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Everything you need</span>
          </div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Built for modern<br /><span className="gradient-text">support teams</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto' }}>
            Stop firefighting. OpsFlowAI handles the boring parts so your agents can focus on what matters — making customers happy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: 28, borderRadius: var_radius_lg, border: `1px solid ${hovered === i ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`,
                background: hovered === i ? 'rgba(255,255,255,0.03)' : 'var(--surface)',
                transition: 'all 0.3s var(--spring)', cursor: 'default',
                transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hovered === i ? `0 20px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)` : 'none',
                position: 'relative', overflow: 'hidden',
              }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: hovered === i ? `linear-gradient(90deg, transparent, ${f.accent}40, transparent)` : 'transparent', transition: 'all 0.3s' }} />
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper const to avoid template literal issues  
const var_radius_lg = 'var(--radius-lg)';

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
const stats = [
  { value: '94%', label: 'Avg. CSAT Score' },
  { value: '< 2s', label: 'AI triage time' },
  { value: '68%', label: 'Ticket deflection' },
  { value: '3×', label: 'Faster resolution' },
];

export function Stats() {
  return (
    <section style={{ padding: '80px 0', background: 'linear-gradient(to bottom, var(--surface) 0%, var(--bg) 100%)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }} className="gradient-text">{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
const plans = [
  { name: 'Starter', price: '$0', period: '/mo', desc: 'Perfect for small teams getting started with AI support.', features: ['Up to 3 agents', '500 AI replies/mo', 'Email channel', 'Basic analytics', '48h support'], cta: 'Start free', accent: false },
  { name: 'Growth', price: '$79', period: '/mo', desc: 'For growing teams that need more power and integrations.', features: ['Up to 20 agents', '10,000 AI replies/mo', 'All channels', 'Advanced analytics', 'Priority support', 'Custom workflows'], cta: 'Start free trial', accent: true },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations with advanced security needs.', features: ['Unlimited agents', 'Unlimited replies', 'All channels + API', 'SSO & SAML', 'Dedicated CSM', 'SLA guarantee', 'Custom AI training'], cta: 'Book a demo', accent: false },
];

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: '100px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-muted)' }}>All plans include a 14-day free trial. No credit card required.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'end' }}>
          {plans.map((p, i) => (
            <div key={i} style={{
              padding: 32, borderRadius: var_radius_lg,
              border: p.accent ? '1px solid rgba(170,255,0,0.4)' : '1px solid var(--border)',
              background: p.accent ? 'linear-gradient(135deg, rgba(170,255,0,0.06) 0%, rgba(170,255,0,0.02) 100%)' : 'var(--surface)',
              position: 'relative', overflow: 'hidden',
              transform: p.accent ? 'scale(1.03)' : 'scale(1)',
              boxShadow: p.accent ? '0 0 80px rgba(170,255,0,0.1), 0 40px 80px rgba(0,0,0,0.4)' : 'none',
            }}>
              {p.accent && (
                <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: '#000', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Most popular</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, color: p.accent ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)' }}>{p.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{p.period}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginBottom: 24 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14, color: 'var(--text)' }}>
                    <span style={{ color: 'var(--accent)', fontSize: 12, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{
                display: 'block', textAlign: 'center', padding: '12px 0', borderRadius: 'var(--radius-pill)',
                background: p.accent ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: p.accent ? '#000' : 'var(--text)', fontWeight: 700, fontSize: 14,
                border: p.accent ? 'none' : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >{p.cta} →</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
const testimonials = [
  { name: 'Sarah Chen', role: 'Head of Support, Cascade', quote: "OpsFlowAI cut our first response time by 80%. Our agents actually enjoy work now — they're not buried in repetitive tickets.", avatar: 'SC' },
  { name: 'Marcus Rodriguez', role: 'CTO, BuildFast', quote: 'The AI draft quality is insane. 9 out of 10 suggestions go out unchanged. We\'ve handled 3× the volume with the same team size.', avatar: 'MR' },
  { name: 'Priya Sharma', role: 'VP Customer Success, Luma', quote: 'We evaluated 8 tools. OpsFlowAI was the only one that felt like a true AI partner, not just autocomplete for tickets.', avatar: 'PS' },
];

export function Testimonials() {
  return (
    <section style={{ padding: '100px 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Loved by <span className="gradient-text">support leaders</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ padding: 28, borderRadius: var_radius_lg, border: '1px solid var(--border)', background: 'var(--bg)', position: 'relative' }}>
              <div style={{ fontSize: 36, lineHeight: 1, color: 'var(--accent)', marginBottom: 16, opacity: 0.5 }}>"</div>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-dim), rgba(124,131,253,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)', border: '1px solid rgba(170,255,0,0.2)', flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────── */
export function CTABanner() {
  return (
    <section style={{ padding: '100px 0' }}>
      <div className="container">
        <div style={{
          padding: 'clamp(48px, 8vw, 80px)', borderRadius: 28,
          background: 'linear-gradient(135deg, rgba(170,255,0,0.07) 0%, rgba(0,0,0,0) 60%)',
          border: '1px solid rgba(170,255,0,0.15)', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(170,255,0,0.08) 0%, transparent 65%)', pointerEvents: 'none', animation: 'glow-pulse 4s ease-in-out infinite' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Ready to automate<br /><span className="gradient-text">your support?</span>
            </h2>
            <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 36px' }}>
              Join 2,000+ teams resolving tickets faster, happier, and at a fraction of the cost.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 'var(--radius-pill)',
                background: 'var(--accent)', color: '#000', fontWeight: 800, fontSize: 16,
                boxShadow: '0 0 40px rgba(170,255,0,0.35)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 64px rgba(170,255,0,0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(170,255,0,0.35)'}
              >Start for free →</Link>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No credit card · 14-day trial · Cancel anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
export function Footer() {
  const cols = [
    { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap', 'Security'] },
    { title: 'Developers', links: ['Documentation', 'API Reference', 'SDKs', 'Status', 'GitHub'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'GDPR'] },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '64px 0 40px', background: 'var(--surface)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 56 }}>
          {/* Brand col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--text)' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', color: '#000', fontWeight: 900, fontSize: 12 }}>O</span>
              OpsFlowAI
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>The AI-native support platform built for modern, high-velocity teams.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['𝕏', 'in', '⬡'].map((icon, i) => (
                <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >{icon}</a>
              ))}
            </div>
          </div>
          {/* Link cols */}
          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
              {col.links.map((link, j) => (
                <a key={j} href="#" style={{ display: 'block', fontSize: 14, color: 'var(--text-muted)', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                >{link}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2026 OpsFlowAI, Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: 'var(--accent)', fontSize: 12 }}>★</span>)}
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>4.9/5 from 400+ reviews</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
