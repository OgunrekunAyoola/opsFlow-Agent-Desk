'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';
import { authClient } from '../../lib/auth-client';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-16 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white text-center">
            <h1 className="text-2xl font-semibold mb-3">Verify your email</h1>
            <p className="text-sm text-white/70">Verifying your email address…</p>
          </div>
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    token ? 'pending' : 'error',
  );
  const [message, setMessage] = useState<string | null>(
    token ? null : 'Missing verification token.',
  );

  useEffect(() => {
    if (!token) {
      return;
    }
    async function run() {
      try {
        const { error } = await (authClient as any).emailOtp.verifyEmail({
          token,
        });
        if (error) {
          const msg = error.message || 'Verification failed.';
          setStatus('error');
          setMessage(msg);
          toast.error(msg);
          return;
        }
        const msg = 'Email verified. You can now log in.';
        setStatus('success');
        setMessage(msg);
        toast.success(msg);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } catch {
        const msg = 'Something went wrong. Please try again.';
        setStatus('error');
        setMessage(msg);
        toast.error(msg);
      }
    }
    run();
  }, [token, router, toast]);

  return (
    <div className="container mx-auto px-6 py-16 flex justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-white text-center">
        <h1 className="text-2xl font-semibold mb-3">Verify your email</h1>
        {status === 'pending' && (
          <p className="text-sm text-white/70">
            Verifying your email address. This will only take a moment.
          </p>
        )}
        {status !== 'pending' && message && <p className="text-sm text-white/70">{message}</p>}
      </div>
    </div>
  );
}
