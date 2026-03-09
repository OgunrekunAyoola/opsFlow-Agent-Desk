'use client';

import { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { getForgetPasswordClient } from '../../../lib/auth-client';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const client = getForgetPasswordClient();
    try {
      const { error: forgotError } = await client.forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      if (forgotError) {
        const msg = forgotError.message || 'Request failed';
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      const msg = 'If an account exists for this email, a reset link has been sent.';
      setMessage(msg);
      toast.info(msg);
      setSubmitting(false);
    } catch {
      const msg = 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white">
        <h1 className="text-2xl font-semibold mb-2">Reset your password</h1>
        <p className="text-sm text-white/60 mb-6">
          Enter the email associated with your account and we&apos;ll send you a reset link.
        </p>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            {message}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-md hover:bg-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
