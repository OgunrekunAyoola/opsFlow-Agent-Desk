'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../context/ToastContext';
import { authClient, fetchWithAccess } from '../../../lib/auth-client';

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-16 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white">
            <h1 className="text-2xl font-semibold mb-2">Start your trial</h1>
            <p className="text-sm text-white/60">Preparing sign up…</p>
          </div>
        </div>
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const toast = useToast();
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const passwordLabel = useMemo(() => {
    if (!password) return 'Password strength';
    if (passwordScore <= 1) return 'Weak password';
    if (passwordScore === 2) return 'Fair password';
    if (passwordScore === 3) return 'Strong password';
    return 'Very strong password';
  }, [password, passwordScore]);

  const isPasswordValid = passwordScore >= 3;
  const isConfirmValid = !!confirmPassword && confirmPassword === password;
  const canSubmit =
    tenantName.trim().length > 1 &&
    name.trim().length > 1 &&
    email.trim().length > 3 &&
    isPasswordValid &&
    isConfirmValid;

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      const res = await fetchWithAccess<unknown>('/auth/me');
      if (cancelled) return;
      if (res.ok) {
        router.replace('/dashboard');
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: signUpError } = await authClient.signUp.email(
        {
          email,
          password,
          name,
          callbackURL: '/dashboard?welcome=true',
        },
        {},
      );
      if (signUpError) {
        const msg = signUpError.message || 'Signup failed';
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      const msg = 'Account created. You can now sign in.';
      setSuccess(msg);
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
      return;
    }
  }

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
          >
            <span className="text-sm">←</span>
            <span>Back to home</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-xs text-cyan-300 hover:text-cyan-200"
          >
            Already have an account? Log in
          </button>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Start your trial</h1>
        <p className="text-sm text-white/60 mb-6">
          Create a secure workspace for your team in a few steps.
        </p>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            {success}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70" htmlFor="tenantName">
              Company or workspace name
            </label>
            <input
              id="tenantName"
              type="text"
              required
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70" htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/70" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[11px] text-cyan-300 hover:text-cyan-200"
              >
                {showPassword ? 'Hide' : 'Show'} password
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span>{passwordLabel}</span>
              <span
                className={
                  passwordScore >= 3
                    ? 'text-emerald-300'
                    : passwordScore >= 1
                      ? 'text-amber-300'
                      : ''
                }
              >
                {password && `${password.length} characters`}
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Minimum 8 characters, including an uppercase letter, a number, and a symbol.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/70" htmlFor="confirmPassword">
                Confirm password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-[11px] text-cyan-300 hover:text-cyan-200"
              >
                {showConfirmPassword ? 'Hide' : 'Show'} confirm
              </button>
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            {!isConfirmValid && confirmPassword && (
              <p className="text-[11px] text-red-300">Passwords do not match.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-md hover:bg-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creating workspace…' : 'Start free trial'}
          </button>
          <p className="text-[11px] text-white/50 text-center">
            By creating an account, you agree to OpsFlow&apos;s Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}
