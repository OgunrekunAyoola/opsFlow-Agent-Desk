import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const toast = useToast();

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        toast.success('Email verified successfully!');
      } catch (err) {
        console.error(err);
        setStatus('error');
        toast.error('Failed to verify email. Token might be invalid or expired.');
      }
    };

    verify();
  }, [token, toast]);

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Verifying Email...
            </h2>
            <p className="text-text-muted">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Email Verified!
            </h2>
            <p className="text-text-muted mb-6">
              Your email has been successfully verified. You can now access your dashboard.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Verification Failed
            </h2>
            <p className="text-text-muted mb-6">The verification link is invalid or has expired.</p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" onClick={() => navigate('/login')} className="flex-1">
                Back to Login
              </Button>
              <Button onClick={() => navigate('/signup')} className="flex-1">
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
