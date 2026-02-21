'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';
import { authClient } from '../../lib/auth-client';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-16 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white">
            <h1 className="text-2xl font-semibold mb-2">Choose a new password</h1>
            <p className="text-sm text-white/60">Preparing reset form…</p>
          </div>
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    if (!token) {
      const msg = 'Missing reset token.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
      });
      if (resetError) {
        const msg = resetError.message || 'Reset failed';
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      const msg = 'Password updated. You can now log in.';
      setMessage(msg);
      toast.success(msg);
      setSubmitting(false);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
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
        <h1 className="text-2xl font-semibold mb-2">Choose a new password</h1>
        <p className="text-sm text-white/60 mb-6">Enter a new password for your OpsFlow account.</p>
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
            <label className="text-xs font-medium text-white/70" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <p className="text-[11px] text-white/50">
              At least 8 characters, including a number, uppercase letter, and symbol.
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-md hover:bg-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
