import React, { useState, useEffect } from 'react';
import { Bot, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      toast.error('Session expired. Please sign in again.');
    }
  }, [location, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token } = res.data;
      localStorage.setItem('access_token', access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const isTimeout = (err as any)?.code === 'ECONNABORTED';
      const msg = isTimeout ? 'Request timed out. Please try again.' : 'Invalid email or password';
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-grad-main text-white mb-4 shadow-lg shadow-blue-500/30">
            <Bot size={24} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-muted mt-2">Sign in to your OpsFlow agent desk</p>
        </div>

        {/* Social Login removed */}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 backdrop-blur-sm px-2 text-text-muted">
              Or sign in with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary ml-1">Email</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                placeholder="you@agency.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary ml-1">Password</label>
              <Link to="/forgot-password" className="text-xs text-accent-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 shadow-lg shadow-blue-500/20"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent-primary font-medium hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
