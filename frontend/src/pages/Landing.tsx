import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  ArrowRight,
  Zap,
  BarChart3,
  Check,
  Star,
  Globe2,
  PenTool,
  Shield,
  Target,
  Activity,
  Rocket,
  AlertTriangle,
  Clock,
  XCircle,
  Bell,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import type {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Points,
  BufferGeometry,
  PointsMaterial,
  Mesh,
} from 'three';

export function Landing() {
  const [activeHash, setActiveHash] = useState<string>(() => window.location.hash || '');
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const onHash = () => setActiveHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const glowRef = useRef<HTMLDivElement | null>(null);
  const heroMockRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const p = Math.min(y / 600, 1);
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(-50%, -10%) scale(${1 + p * 0.05})`;
        glowRef.current.style.opacity = String(0.2 + p * 0.2);
      }
      if (heroMockRef.current) {
        heroMockRef.current.style.transform = `translateY(${p * -12}px)`;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden text-white"
      style={{ backgroundImage: 'linear-gradient(180deg, #0A0E27 0%, #1A1F3A 100%)' }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-black/60 focus:text-white focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/90 border-b border-white/10 backdrop-blur"
        role="navigation"
        aria-label="Primary"
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center">
              <Bot size={18} className="text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm tracking-tight">OpsFlow</span>
              <span className="text-[11px] text-white/50">Customer Operations Platform</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#features-future"
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                activeHash === '#features-future'
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              aria-current={activeHash === '#features-future' ? 'page' : undefined}
            >
              Features
            </a>
            <a
              href="#integrations"
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                activeHash === '#integrations'
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              aria-current={activeHash === '#integrations' ? 'page' : undefined}
            >
              Integrations
            </a>
            <Link
              to="/pricing"
              className="px-3 py-1 rounded-full font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/docs"
              className="px-3 py-1 rounded-full font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden xs:inline-block text-sm font-medium text-white/70 hover:text-white"
            >
              Log in
            </Link>
            <Link to="/signup" className="hidden sm:inline-block">
              <Button size="sm" className="bg-grad-main text-white">
                Start free <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <button
              type="button"
              className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#050816]/95">
            <div className="container mx-auto px-4 sm:px-6 py-4 space-y-4">
              <a
                href="#features-future"
                className="block text-sm text-white/80 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </a>
              <a
                href="#integrations"
                className="block text-sm text-white/80 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                Integrations
              </a>
              <Link
                to="/pricing"
                className="block text-sm text-white/80 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/docs"
                className="block text-sm text-white/80 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                Docs
              </Link>
              <div className="pt-3 border-t border-white/10 space-y-3">
                <Link
                  to="/login"
                  className="block text-sm text-white/80 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-grad-main text-white">Start free</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <header
        className="container mx-auto px-6 pt-36 pb-24 lg:pt-40 lg:pb-40 relative"
        id="main"
        role="main"
      >
        <HeroCanvas />
        <div
          ref={glowRef}
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-grad-soft opacity-25 blur-[140px] rounded-full pointer-events-none z-0"
        />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-medium uppercase tracking-wide text-white/80">
            🚀 NOW IN PUBLIC BETA
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7">
            <h1 className="text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight tracking-tight">
              THE FUTURE OF SUPPORT
              <br />
              IS AUTONOMOUS
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mb-10 leading-relaxed">
              Your AI copilot reads every ticket, understands every customer, and drafts every
              reply—instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-grad-main text-white shadow-xl hover:shadow-2xl"
                >
                  Start Your Evolution <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
              <a
                href="#features-future"
                className="h-14 px-8 rounded-full bg-white/10 border border-white/20 text-white font-medium transition-colors shadow-md hover:bg-white/15 hover:shadow-lg inline-flex items-center justify-center w-full sm:w-auto"
              >
                See the Future
              </a>
            </div>
            <div className="mt-4 text-sm text-white/60">
              Free forever · No credit card · 2 minute setup
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative">
              <div
                ref={heroMockRef}
                className="rounded-2xl border border-white/20 bg-white/5 shadow-2xl overflow-hidden transition-transform duration-500 will-change-transform"
              >
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-white/60">Holographic Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-28 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between px-6">
                    <div>
                      <p className="text-sm text-white/60">Open Tickets</p>
                      <p className="text-2xl font-bold">128</p>
                    </div>
                    <div className="text-xs text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                      +12% this week
                    </div>
                  </div>
                  <TypingBlock />
                </div>
              </div>
              <div className="absolute -inset-4 rounded-3xl border border-cyan-400/30 blur-xl opacity-30" />
            </div>
          </div>
        </div>
      </header>

      <RevealSection id="future" className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-white/70 mb-3">
              Imagine the impossible
            </div>
            <h2 className="text-4xl font-heading font-bold mb-6">
              What if support
              <br />
              could think?
            </h2>
            <ul className="space-y-3 text-lg leading-8">
              <li className="flex items-center gap-2 text-white/90">
                <Check size={18} className="text-green-600" /> Every ticket is read the moment it
                arrives
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Check size={18} className="text-green-600" /> Categories appear before you even
                think
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Check size={18} className="text-green-600" /> Priorities adjust in real-time
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Check size={18} className="text-green-600" /> Replies write themselves—perfectly
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Check size={18} className="text-green-600" /> Your team only touches what truly
                needs a human
              </li>
            </ul>
            <div className="mt-6 text-2xl italic text-white/80">
              That world exists. You're looking at it.
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative h-80 rounded-2xl border border-slate-200 bg-white/50 flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full bg-purple-200 blur-xl animate-pulse"></div>
              <div className="absolute w-24 h-24 rounded-full bg-blue-200 blur-2xl animate-ping"></div>
              <div className="absolute w-12 h-12 rounded-full bg-pink-200 blur-xl animate-pulse"></div>
              <Flowchart />
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h3 className="text-3xl font-heading font-bold">The old way</h3>
            <div className="space-y-2 text-text-muted">
              <div>8:00 AM → 50 unread tickets</div>
              <div>8:30 AM → Still sorting priorities</div>
              <div>9:00 AM → Finally starting replies</div>
              <div>12:00 PM → Still catching up</div>
              <div className="mt-2">Result: Burnt out team, slow responses 😞</div>
            </div>
            <MessyInboxVisual />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-heading font-bold">The OpsFlow way</h3>
            <div className="space-y-2 text-text-muted">
              <div>8:00 AM → 50 tickets already triaged ✓</div>
              <div>8:01 AM → Priorities set, owners assigned ✓</div>
              <div>8:02 AM → Drafts ready for review ✓</div>
              <div>8:15 AM → All 50 replies sent ✓</div>
              <div className="mt-2">Result: Happy team, instant support 🚀</div>
            </div>
            <CleanDashboardVisual />
          </div>
        </div>
        <div className="mt-12 mx-auto max-w-md text-center px-6 py-4 rounded-2xl bg-white border border-slate-200">
          From chaos to clarity in 60 seconds.
        </div>
      </RevealSection>

      <RevealSection id="features-future" className="container mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-text-muted mb-2">
            Features from the future
          </div>
          <h3 className="text-3xl font-heading font-bold">Build once. Benefit forever.</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureTile
            icon={<Zap />}
            status="Available Now"
            color="cyan"
            name="Instant Triage"
            description="AI reads, categorizes, and prioritizes every ticket in <2 seconds"
          />
          <FeatureTile
            icon={<Star />}
            status="Available Now"
            color="purple"
            name="Context Memory"
            description="Remembers every customer, every conversation, every detail"
          />
          <FeatureTile
            icon={<Target />}
            status="Available Now"
            color="pink"
            name="Smart Routing"
            description="Assigns tickets to the perfect team member based on skills and workload"
          />
          <FeatureTile
            icon={<PenTool />}
            status="Available Now"
            color="green"
            name="Reply Generation"
            description="Drafts perfect, personalized replies using your brand voice and knowledge base"
          />
          <FeatureTile
            icon={<Activity />}
            status="Coming Q2 2026"
            color="purple"
            name="Workflow Engine"
            description="Trigger actions: create refunds, update CRMs, notify Slack—automatically"
          />
          <FeatureTile
            icon={<Globe2 />}
            status="Coming Q2 2026"
            color="cyan"
            name="Multi-Language"
            description="Detect customer language, reply in their native tongue—35 languages supported"
          />
          <FeatureTile
            icon={<BarChart3 />}
            status="Coming Q2 2026"
            color="pink"
            name="Predictive Analytics"
            description="Know tomorrow's ticket volume today. Prevent issues before they explode."
          />
          <FeatureTile
            icon={<Shield />}
            status="Coming Q2 2026"
            color="green"
            name="Sentiment Radar"
            description="Track customer happiness in real-time. Catch churn risks before they leave."
          />
          <FeatureTile
            icon={<Rocket />}
            status="Coming Q2 2026"
            color="purple"
            name="Auto-Resolve"
            description="Common questions answered instantly, no human needed. 40% of tickets solved autonomously."
          />
        </div>
        <div className="mt-10 text-center text-text-muted italic">
          And we're just getting started. Our AI learns every day. Your support desk gets smarter
          every hour.
        </div>
      </RevealSection>

      <RevealSection id="integrations" className="container mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-heading font-bold">
            Connect everything.
            <br />
            Automate anything.
          </h3>
          <p className="text-text-muted mt-3">
            OpsFlow doesn't live in isolation. It's the brain of your entire support ecosystem.
          </p>
        </div>
        <IntegrationsHub />
        <div className="text-center mt-8 text-text-muted">
          If it has an API, OpsFlow can orchestrate it. The only limit is your imagination.
        </div>
      </RevealSection>

      <RevealSection className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/70 mb-3">
              Future-proof
            </div>
            <h3 className="text-4xl font-heading font-bold mb-6">
              The world is accelerating. Your support shouldn't fall behind.
            </h3>
            <div className="space-y-4 text-lg">
              <div>→ Customers expect instant replies</div>
              <div className="text-white/70">(AI delivers in seconds)</div>
              <div>→ Teams are smaller, tickets are more</div>
              <div className="text-white/70">(AI scales infinitely)</div>
              <div>→ Support is 24/7 global</div>
              <div className="text-white/70">(AI never sleeps)</div>
              <div>→ Data is everywhere</div>
              <div className="text-white/70">(AI connects it all)</div>
            </div>
            <div className="mt-6 text-xl italic text-white/80">
              OpsFlow isn't built for today's support desk. It's built for the one that doesn't
              exist yet.
            </div>
          </div>
          <Cityscape />
        </div>
      </RevealSection>

      <RevealSection className="container mx-auto px-6 py-24">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
            Under the hood
          </div>
          <h3 className="text-3xl font-heading font-bold">Powered by Next-Gen AI</h3>
          <p className="text-white/70 mt-3">
            Our agentic workflow orchestrates multiple specialized agents working in parallel.
          </p>
        </div>
        <AgentWorkflow />
      </RevealSection>

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

function FeatureTile({
  icon,
  status,
  color,
  name,
  description,
}: {
  icon: React.ReactNode;
  status: string;
  color: 'cyan' | 'purple' | 'pink' | 'green';
  name: string;
  description: string;
}) {
  const glow =
    color === 'cyan'
      ? 'shadow-[0_0_30px_rgba(0,240,255,0.25)]'
      : color === 'purple'
        ? 'shadow-[0_0_30px_rgba(176,38,255,0.25)]'
        : color === 'pink'
          ? 'shadow-[0_0_30px_rgba(255,0,128,0.25)]'
          : 'shadow-[0_0_30px_rgba(0,255,148,0.25)]';
  const badge = status.includes('Coming')
    ? 'bg-purple-100 text-purple-700 border border-purple-200'
    : 'bg-green-100 text-green-700 border border-green-200';
  return (
    <div
      className={`p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-1 ${glow}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 text-text-primary">
        {icon}
      </div>
      <div className={`inline-flex px-2 py-0.5 rounded-full text-xs mb-2 ${badge}`}>{status}</div>
      <h4 className="text-lg font-bold text-text-primary mb-1">{name}</h4>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function RevealSection({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setVisible(true)),
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section
      id={id}
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(24px)',
        transition: 'opacity 600ms ease-out, transform 600ms ease-out',
        contentVisibility: 'auto',
      }}
    >
      {children}
    </section>
  );
}

function TypingBlock() {
  const [text, setText] = useState('');
  const full = 'Typing AI reply…';
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setText(full.slice(0, i % (full.length + 10)));
    }, 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="h-40 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 text-sm">
      {text}
    </div>
  );
}

function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    let running = true;
    const mountEl = mountRef.current;
    let renderer: WebGLRenderer | null = null;
    let scene: Scene | null = null;
    let camera: PerspectiveCamera | null = null;
    let points: Points<BufferGeometry, PointsMaterial> | null = null;
    const cards: Mesh[] = [];
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cleanup: (() => void) | null = null;
    import('three').then((THREE) => {
      const m = mountRef.current;
      if (!m) return;
      const canvas = document.createElement('canvas');
      m.appendChild(canvas);
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 6;
      const count = Math.min(
        3200,
        Math.max(1200, Math.floor(((m.clientWidth || 800) * (window.devicePixelRatio || 1)) / 1.2)),
      );
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        positions[ix] = (Math.random() - 0.5) * 12;
        positions[ix + 1] = (Math.random() - 0.5) * 8;
        positions[ix + 2] = (Math.random() - 0.5) * 10;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: new THREE.Color(0x78d5ff),
        size: window.innerWidth < 640 ? 0.06 : 0.06,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      points = new THREE.Points(geo, mat);
      scene.add(points);
      const cardGeo = new THREE.BoxGeometry(0.9, 0.6, 0.02);
      const cardMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
      });
      for (let i = 0; i < 16; i++) {
        const c = new THREE.Mesh(cardGeo, cardMat);
        c.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
        );
        c.rotation.set(Math.random() * 0.6, Math.random() * 0.6, Math.random() * 0.6);
        cards.push(c);
        scene.add(c);
      }
      const ringGeo = new THREE.RingGeometry(1.6, 1.75, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.25,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      scene.add(ring);
      const resize = () => {
        const rect = m.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        renderer!.setSize(w, h, false);
        camera!.aspect = w / h;
        camera!.updateProjectionMatrix();
      };
      resize();
      const onResize = () => resize();
      window.addEventListener('resize', onResize, { passive: true });
      const animate = () => {
        if (!running || !renderer || !scene || !camera || !points) return;
        const t = performance.now() * 0.00025;
        points.rotation.y = t;
        ring.rotation.z = t * 0.7;
        cards.forEach((c) => {
          c.position.y -= 0.007 + Math.random() * 0.003;
          c.rotation.y += 0.002;
          if (c.position.y < -4) {
            c.position.y = 4 + Math.random() * 1;
            c.position.x = (Math.random() - 0.5) * 8;
            c.position.z = (Math.random() - 0.5) * 6;
          }
        });
        const mtl = points.material as PointsMaterial;
        mtl.opacity = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(t * 3));
        renderer.render(scene, camera);
        rafRef.current = requestAnimationFrame(animate);
      };
      const io = new IntersectionObserver((entries) => {
        const active = entries.some((e) => e.isIntersecting);
        if (active) {
          if (!rafRef.current && !reduce) animate();
          if (reduce && renderer && scene && camera) renderer.render(scene, camera);
        } else {
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        }
      });
      io.observe(m);
      if (!reduce) animate();
      cleanup = () => {
        running = false;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        window.removeEventListener('resize', onResize);
        renderer?.dispose();
        geo.dispose();
        mat.dispose();
        cardGeo.dispose();
        ringGeo.dispose();
        if (m && canvas) m.removeChild(canvas);
      };
    });
    return () => {
      running = false;
      if (cleanup) {
        cleanup();
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const m = mountEl;
        if (m) {
          const c = m.querySelector('canvas');
          if (c) m.removeChild(c);
        }
      }
    };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 z-10 pointer-events-none" />;
}

function Flowchart() {
  const pathRef = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    let d = 0;
    const id = setInterval(() => {
      d = (d + 4) % 400;
      if (pathRef.current) pathRef.current.style.strokeDashoffset = String(400 - d);
    }, 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative h-80 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 400 300">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#B026FF" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="80" r="28" fill="url(#grad)" opacity="0.8" />
        <circle cx="200" cy="150" r="34" fill="none" stroke="#B026FF" strokeWidth="2"></circle>
        <circle cx="120" cy="220" r="22" fill="none" stroke="#FF0080" strokeWidth="2"></circle>
        <circle cx="200" cy="220" r="22" fill="none" stroke="#00F0FF" strokeWidth="2"></circle>
        <circle cx="280" cy="220" r="22" fill="none" stroke="#00FF94" strokeWidth="2"></circle>
        <path
          ref={pathRef}
          d="M200 108 L200 116 L120 180 L120 198 M200 116 L200 198 M200 116 L280 180 L280 198"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="3"
          strokeDasharray="8 8"
        />
      </svg>
    </div>
  );
}

function IntegrationsHub() {
  const p1 = useRef<SVGPathElement | null>(null);
  const p2 = useRef<SVGPathElement | null>(null);
  const p3 = useRef<SVGPathElement | null>(null);
  const p4 = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    let d = 0;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => {
      d = (d + 4) % 200;
      [p1.current, p2.current, p3.current, p4.current].forEach((p) => {
        if (p) {
          p.setAttribute('stroke-dasharray', '6 6');
          p.setAttribute('stroke-dashoffset', String(d));
        }
      });
    }, 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="relative mx-auto max-w-3xl h-80 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
      role="region"
      aria-label="Integrations hub"
    >
      <div className="w-24 h-24 rounded-full bg-grad-main text-white flex items-center justify-center font-bold">
        OpsFlow
      </div>
      <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
        <div
          className="absolute left-8 top-8 w-12 h-12 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/40"
          title="Email"
        />
        <div
          className="absolute right-12 top-10 w-12 h-12 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/40"
          title="Slack"
        />
        <div
          className="absolute left-16 bottom-10 w-12 h-12 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/40"
          title="Stripe"
        />
        <div
          className="absolute right-8 bottom-8 w-12 h-12 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/40"
          title="Jira/Linear"
        />
      </div>
      <svg className="absolute inset-0" viewBox="0 0 800 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#B026FF" />
          </linearGradient>
        </defs>
        <path ref={p1} d="M400 150 L300 80" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
        <path ref={p2} d="M400 150 L520 90" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
        <path ref={p3} d="M400 150 L320 240" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
        <path ref={p4} d="M400 150 L560 240" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

function MessyInboxVisual() {
  return (
    <div className="relative h-48 rounded-xl bg-white/10 border border-white/20 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="text-xs text-white/60">Inbox</div>
      </div>
      <div className="grid grid-cols-12 text-xs text-white/70 px-4 py-2 border-b border-white/10">
        <div className="col-span-1">From</div>
        <div className="col-span-7">Subject</div>
        <div className="col-span-2">Label</div>
        <div className="col-span-2 text-right">Received</div>
      </div>
      <div className="divide-y divide-white/10">
        {[
          {
            from: 'Billing',
            subject: 'Payment failed for PRO plan',
            label: 'URGENT',
            time: '08:00',
          },
          { from: 'VIP', subject: 'Unable to login, 2FA broken', label: 'VIP', time: '08:03' },
          {
            from: 'Bug Reports',
            subject: 'Crash when clicking Submit',
            label: 'Bug',
            time: '08:05',
          },
          {
            from: 'General',
            subject: 'Invoice download link expired',
            label: 'Question',
            time: '08:07',
          },
          { from: 'Refunds', subject: 'Refund request #49213', label: 'Refund', time: '08:12' },
        ].map((r, i) => (
          <div key={i} className="grid grid-cols-12 items-center px-4 py-2">
            <div className="col-span-1 flex items-center gap-2">
              <Star size={12} className="text-yellow-400 opacity-50" />
              <span className="font-medium">{r.from}</span>
            </div>
            <div className="col-span-7">
              <span className="font-semibold">{r.subject}</span>
            </div>
            <div className="col-span-2">
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] ${r.label === 'URGENT' ? 'bg-red-500/20 border-red-500/40 text-red-300' : r.label === 'VIP' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'}`}
              >
                {r.label}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} className="opacity-60" /> {r.time}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute -right-2 top-4 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full px-2 py-1 text-[10px] inline-flex items-center gap-1">
        <AlertTriangle size={12} /> SLA breach risk
      </div>
      <div className="absolute left-3 bottom-3 bg-yellow-500/20 text-yellow-200 border border-yellow-500/40 rounded-full px-2 py-1 text-[10px] inline-flex items-center gap-1">
        <Bell size={12} /> 14 unread
      </div>
      <div className="absolute right-6 bottom-3 bg-pink-500/20 text-pink-200 border border-pink-500/40 rounded-full px-2 py-1 text-[10px] inline-flex items-center gap-1">
        <XCircle size={12} /> 3 failed sends
      </div>
    </div>
  );
}

function CleanDashboardVisual() {
  return (
    <div className="relative h-48 rounded-xl bg-white/5 border border-white/15 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="text-xs text-white/60">OpsFlow Dashboard</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-200">
            <Check size={12} /> Stable
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4">
        <div className="col-span-1 rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60">Triaged</div>
          <div className="text-2xl font-bold">50</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-green-300">
            <Check size={12} /> Ready
          </div>
        </div>
        <div className="col-span-1 rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60">Priorities Set</div>
          <div className="text-2xl font-bold">50</div>
          <div className="mt-1 h-1 w-full bg-white/10 rounded">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded" />
          </div>
        </div>
        <div className="col-span-1 rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60">Drafts Ready</div>
          <div className="text-2xl font-bold">50</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-cyan-300">
            <PenTool size={12} /> Reviewed
          </div>
        </div>
        <div className="col-span-1 rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs text-white/60">Replies Sent</div>
          <div className="text-2xl font-bold">50</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-green-300">
            <Rocket size={12} /> Delivered
          </div>
        </div>
      </div>
      <div className="absolute right-3 bottom-3 inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
        <Bot size={14} className="text-cyan-300" />
        <span className="text-white/70">Agent Assist active</span>
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-[#00F0FF] to-[#B026FF]" />
    </div>
  );
}

function Cityscape() {
  return (
    <div className="relative h-80 rounded-2xl border border-white/10 bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A] overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 30%, rgba(0,240,255,0.15), transparent 60%)',
          }}
        />
      </div>
      <div className="absolute bottom-0 left-10 w-12 h-40 bg-gradient-to-t from-[#1A1F3A] to-[#3a3f66]" />
      <div className="absolute bottom-0 left-24 w-16 h-56 bg-gradient-to-t from-[#1A1F3A] to-[#3a3f66]" />
      <div className="absolute bottom-0 left-48 w-24 h-72 bg-gradient-to-t from-[#1A1F3A] to-[#3a3f66]" />
      <div className="absolute bottom-0 left-80 w-14 h-52 bg-gradient-to-t from-[#1A1F3A] to-[#3a3f66]" />
      <div className="absolute inset-0">
        <svg width="100%" height="100%" viewBox="0 0 800 300">
          <defs>
            <linearGradient id="stream" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#B026FF" />
            </linearGradient>
          </defs>
          <path
            d="M0 120 Q 200 160 400 140 T 800 120"
            stroke="url(#stream)"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M0 200 Q 200 220 400 200 T 800 180"
            stroke="url(#stream)"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}

function AgentWorkflow() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let d = 0;
    const id = setInterval(() => {
      d = (d + 6) % 240;
      setPulse((p) => (p + 1) % 5);
      if (pathRef.current) pathRef.current.setAttribute('stroke-dashoffset', String(240 - d));
    }, 80);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mx-auto max-w-4xl">
      <svg width="100%" height="240" viewBox="0 0 600 240">
        <defs>
          <linearGradient id="aw" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#B026FF" />
          </linearGradient>
        </defs>
        <circle cx="300" cy="40" r="16" fill="url(#aw)" opacity="0.9" />
        <circle
          cx="120"
          cy="100"
          r="18"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2"
          opacity={pulse === 0 ? 1 : 0.5}
        />
        <circle
          cx="220"
          cy="100"
          r="18"
          fill="none"
          stroke="#B026FF"
          strokeWidth="2"
          opacity={pulse === 1 ? 1 : 0.5}
        />
        <circle
          cx="380"
          cy="100"
          r="18"
          fill="none"
          stroke="#FF0080"
          strokeWidth="2"
          opacity={pulse === 2 ? 1 : 0.5}
        />
        <circle
          cx="480"
          cy="100"
          r="18"
          fill="none"
          stroke="#00FF94"
          strokeWidth="2"
          opacity={pulse === 3 ? 1 : 0.5}
        />
        <circle
          cx="300"
          cy="180"
          r="18"
          fill="none"
          stroke="#4EA8FF"
          strokeWidth="2"
          opacity={pulse === 4 ? 1 : 0.5}
        />
        <path
          ref={pathRef}
          d="M300 56 L120 82 L120 100 M300 56 L220 82 L220 100 M300 56 L380 82 L380 100 M300 56 L480 82 L480 100 M120 118 L300 160 M220 118 L300 160 M380 118 L300 160 M480 118 L300 160 M300 198 L300 210"
          stroke="url(#aw)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 10"
        />
      </svg>
      <div className="mt-4 text-center text-white/80">All in under 3 seconds.</div>
    </div>
  );
}
