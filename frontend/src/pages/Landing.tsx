import { Link } from 'react-router-dom';
import {
  Bot,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Check,
  Star,
  Globe2,
  PenTool,
  Shield,
  Target,
  Activity,
  Rocket,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-page text-text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-grad-main flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Bot size={24} />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">OpsFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            Log in
          </Link>
          <Link to="/signup">
            <Button size="sm" className="hidden sm:flex">
              Get Started <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-20 lg:py-32 text-center relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-grad-soft opacity-20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Now in Public Beta
          </span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 leading-tight tracking-tight">
          Support your customers <br />
          <span className="bg-clip-text text-transparent bg-grad-main">with AI superpowers</span>
        </h1>

        <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Streamline your agency's help desk with intelligent triage, automated replies, and
          seamless team collaboration.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button
              size="lg"
              className="h-14 px-8 text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              Start Free Trial <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 mx-auto max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-text-muted">Dashboard Preview</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-28 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between px-6">
                  <div>
                    <p className="text-sm text-text-muted">Open Tickets</p>
                    <p className="text-2xl font-bold text-text-primary">128</p>
                  </div>
                  <div className="text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded">
                    +12% this week
                  </div>
                </div>
                <div className="h-40 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-text-muted text-sm">
                  Status breakdown and trends chart
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-sm font-medium text-text-primary mb-2">AI Suggestions</p>
                  <ul className="text-sm text-text-muted space-y-2">
                    <li>Prioritize critical bug reports</li>
                    <li>Auto-respond to billing inquiries</li>
                    <li>Assign feature requests to product</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-sm font-medium text-text-primary mb-2">Team Activity</p>
                  <p className="text-sm text-text-muted">Live stream of recent actions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Zap className="text-yellow-500" />}
            title="AI Triage"
            description="Automatically categorize and prioritize tickets instantly."
          />
          <FeatureCard
            icon={<Bot className="text-blue-500" />}
            title="Smart Replies"
            description="Draft perfect responses in seconds with context awareness."
          />
          <FeatureCard
            icon={<BarChart3 className="text-purple-500" />}
            title="Analytics"
            description="Track team performance and customer satisfaction trends."
          />
          <FeatureCard
            icon={<Users className="text-green-500" />}
            title="Team Flow"
            description="Collaborate seamlessly with internal notes and assignments."
          />
        </div>
      </section>

      <section id="future" className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-accent-primary mb-3">
              Imagine the impossible
            </div>
            <h2 className="text-4xl font-heading font-bold mb-6">
              What if support
              <br />
              could think?
            </h2>
            <ul className="space-y-3 text-lg leading-8">
              <li className="flex items-center gap-2 text-text-primary">
                <Check size={18} className="text-green-600" /> Every ticket is read the moment it
                arrives
              </li>
              <li className="flex items-center gap-2 text-text-primary">
                <Check size={18} className="text-green-600" /> Categories appear before you even
                think
              </li>
              <li className="flex items-center gap-2 text-text-primary">
                <Check size={18} className="text-green-600" /> Priorities adjust in real-time
              </li>
              <li className="flex items-center gap-2 text-text-primary">
                <Check size={18} className="text-green-600" /> Replies write themselves—perfectly
              </li>
              <li className="flex items-center gap-2 text-text-primary">
                <Check size={18} className="text-green-600" /> Your team only touches what truly
                needs a human
              </li>
            </ul>
            <div className="mt-6 text-2xl italic text-accent-primary">
              That world exists. You're looking at it.
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative h-80 rounded-2xl border border-slate-200 bg-white/50 flex items-center justify-center">
              <div className="absolute w-16 h-16 rounded-full bg-purple-200 blur-xl animate-pulse"></div>
              <div className="absolute w-24 h-24 rounded-full bg-blue-200 blur-2xl animate-ping"></div>
              <div className="absolute w-12 h-12 rounded-full bg-pink-200 blur-xl animate-pulse"></div>
              <div className="text-text-muted text-sm">AI Brain Flowchart</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
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
            <div className="h-40 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-text-muted">
              Messy inbox visual
            </div>
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
            <div className="h-40 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-text-muted">
              Clean dashboard visual
            </div>
          </div>
        </div>
        <div className="mt-12 mx-auto max-w-md text-center px-6 py-4 rounded-2xl bg-white border border-slate-200">
          From chaos to clarity in 60 seconds.
        </div>
      </section>

      <section id="features-future" className="container mx-auto px-6 py-24">
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
      </section>

      <section id="integrations" className="container mx-auto px-6 py-24">
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
        <div className="relative mx-auto max-w-3xl h-80 rounded-2xl border border-slate-200 bg-white flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-grad-main text-white flex items-center justify-center font-bold">
            OpsFlow
          </div>
          <div className="absolute w-12 h-12 rounded-full bg-white border border-slate-200 left-8 top-8" />
          <div className="absolute w-12 h-12 rounded-full bg-white border border-slate-200 right-12 top-10" />
          <div className="absolute w-12 h-12 rounded-full bg-white border border-slate-200 left-16 bottom-10" />
          <div className="absolute w-12 h-12 rounded-full bg-white border border-slate-200 right-8 bottom-8" />
        </div>
        <div className="text-center mt-8 text-text-muted">
          If it has an API, OpsFlow can orchestrate it. The only limit is your imagination.
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white/50">
        <div className="container mx-auto px-6 text-center text-text-muted text-sm">
          <p>© 2025 OpsFlow Agent Desk. All rights reserved.</p>
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
      className={`p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all ${glow}`}
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}
