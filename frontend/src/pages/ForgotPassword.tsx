import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
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
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-sm text-text-muted hover:text-text-primary transition-colors mb-4">
            <ArrowLeft size={16} className="mr-1" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Reset Password</h1>
          <p className="text-text-muted mt-2">Enter your email to receive a password reset link.</p>
        </div>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Check your email</h3>
            <p className="text-text-muted mb-6">
              If an account exists for <span className="font-medium text-text-primary">{email}</span>, 
              we've sent a password reset link.
            </p>
            <Button onClick={() => setIsSuccess(false)} variant="secondary" className="w-full">
              Send another link
            </Button>
          </div>
        ) : (
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

            <Button
              type="submit"
              className="w-full h-10 shadow-lg shadow-blue-500/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
