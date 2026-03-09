'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAccess } from '../../../../../lib/auth-client';
import { Suspense } from 'react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('provider');
    const state = searchParams.get('state');

    if (submitting.current) return;

    if (!code || !provider) {
      // Defer state update to avoid sync setState in effect warning
      setTimeout(() => {
        setStatus('error');
        setError('Invalid callback parameters: code or provider missing');
      }, 0);
      return;
    }

    submitting.current = true;

    // Call backend to exchange code
    fetchWithAccess(`/integrations/${provider}/callback`, {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    }).then((res) => {
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push('/settings/integrations');
        }, 1500);
      } else {
        setStatus('error');
        setError('Failed to connect integration');
        submitting.current = false; // Allow retry?
      }
    });
  }, [searchParams, router]);

  return (
    <div className="text-center">
      {status === 'processing' && (
        <>
          <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Connecting integration...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <p>Connected successfully! Redirecting...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-red-500 text-4xl mb-4">✗</div>
          <p>{error || 'Something went wrong'}</p>
          <button
            onClick={() => router.push('/settings/integrations')}
            className="mt-4 px-4 py-2 bg-slate-800 rounded hover:bg-slate-700"
          >
            Back to Integrations
          </button>
        </>
      )}
    </div>
  );
}

export default function IntegrationCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
