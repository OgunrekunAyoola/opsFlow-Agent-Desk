import { Link } from 'react-router-dom';
import { Bot, ArrowLeft, Home, LifeBuoy } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="max-w-xl w-full glass-panel rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-grad-main text-white mb-6 shadow-lg shadow-blue-500/30">
          <Bot size={30} />
        </div>
        <div className="uppercase tracking-[0.25em] text-xs text-text-muted mb-2">Error 404</div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-3">
          This route fell off the map
        </h1>
        <p className="text-text-muted mb-8">
          The page you are looking for does not exist or has moved. Use the shortcuts below to get
          back to a safe part of OpsFlow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full h-11 flex items-center justify-center gap-2">
              <Home size={18} />
              Go to dashboard
            </Button>
          </Link>
          <Link to="/tickets" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full h-11 flex items-center justify-center gap-2 border-slate-200"
            >
              <LifeBuoy size={18} />
              View tickets
            </Button>
          </Link>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 text-sm text-accent-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to marketing site
        </Link>
      </div>
    </div>
  );
}

