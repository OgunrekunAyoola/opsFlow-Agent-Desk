import { Link } from 'react-router-dom';
import { Bot, ArrowRight, Zap, BarChart3, Users } from 'lucide-react';
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
          <Link to="/login">
            <button className="h-14 px-8 rounded-xl bg-white border border-slate-200 text-text-primary font-medium hover:bg-slate-50 transition-colors">
              View Demo
            </button>
          </Link>
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

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12 bg-white/50">
        <div className="container mx-auto px-6 text-center text-text-muted text-sm">
          <p>© 2025 OpsFlow Agent Desk. All rights reserved.</p>
        </div>
      </footer>
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
