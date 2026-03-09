'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../context/ToastContext';
import { authClient, getSocialSignInClient, fetchWithAccess } from '../../../lib/auth-client';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-16 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white">
            <h1 className="text-2xl font-semibold mb-2">Log in</h1>
            <p className="text-sm text-white/60">Loading sign-in form…</p>
          </div>
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = useMemo(() => email.trim().length > 3 && email.includes('@'), [email]);

  useEffect(() => {
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      toast.error('Session expired. Please sign in again.');
    }
  }, [searchParams, toast]);

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
    setSubmitting(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: '/dashboard',
          rememberMe: true,
        },
        {},
      );
      if (signInError) {
        const msg = signInError.message || 'Invalid email or password';
        setError(msg);
        toast.error(msg);
        setSubmitting(false);
        return;
      }
      toast.success('Welcome back.');
      const next = searchParams.get('next');
      const nextPath = next && next.startsWith('/') ? next : '/dashboard';
      router.push(nextPath);
    } catch {
      const msg = 'Something went wrong. Please try again.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError(null);
    const client = getSocialSignInClient();
    try {
      await client.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch {
      const msg = 'Unable to start Google sign in. Please try again.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
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
            onClick={() => router.push('/signup')}
            className="text-xs text-cyan-300 hover:text-cyan-200"
          >
            New here? Create an account
          </button>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-sm text-white/60 mb-6">
          Secure access to your OpsFlow workspace for your entire team.
        </p>
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white text-slate-900 px-4 py-2.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            <span className="h-4 w-4 rounded-sm bg-gradient-to-br from-yellow-400 via-red-500 to-blue-500" />
            <span>Continue with Google</span>
          </button>
          <div className="flex items-center gap-3 text-[11px] text-white/50">
            <div className="h-px flex-1 bg-white/10" />
            <span>or sign in with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <a href="/forgot-password" className="text-cyan-300 hover:text-cyan-200">
              Forgot password?
            </a>
            <span className="hidden sm:inline text-white/50">
              SSO and enterprise options available on request.
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting || !isEmailValid || !password}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-md hover:bg-cyan-400 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
          <p className="text-[11px] text-white/50 text-center">
            By continuing you agree to OpsFlow&apos;s Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}
