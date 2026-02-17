import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';

function formatLastEmailStatus(lastInboundAt?: string | null) {
  if (!lastInboundAt) {
    return 'No emails received yet';
  }
  const date = new Date(lastInboundAt);
  if (Number.isNaN(date.getTime())) {
    return 'Last email received: unknown time';
  }
  const diffMs = Date.now() - date.getTime();
  if (diffMs <= 0) {
    return 'Last email received: just now';
  }
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) {
    return 'Last email received: just now';
  }
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minute' : 'minutes';
    return `Last email received: ${diffMinutes} ${unit} ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hour' : 'hours';
    return `Last email received: ${diffHours} ${unit} ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  const unit = diffDays === 1 ? 'day' : 'days';
  return `Last email received: ${diffDays} ${unit} ago`;
}

export function EmailSettings() {
  const [supportEmail, setSupportEmail] = useState<string>('');
  const [inboundAddress, setInboundAddress] = useState<string>('');
  const [lastInboundAt, setLastInboundAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSavingSupportEmail, setIsSavingSupportEmail] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get('/auth/me');
        const tenant = res.data?.tenant;
        const addr = tenant?.inboundAddress || res.data?.inbound?.address || '';
        setInboundAddress(addr);
        if (tenant?.supportEmail) {
          setSupportEmail(tenant.supportEmail);
        }
        if (tenant?.lastInboundAt) {
          setLastInboundAt(tenant.lastInboundAt);
        }
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Failed to load email settings';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveSupportEmail = async () => {
    if (!supportEmail.trim()) {
      toast.error('Support email is required');
      return;
    }
    setIsSavingSupportEmail(true);
    try {
      await api.patch('/auth/tenant-settings', {
        supportEmail: supportEmail.trim(),
      });
      toast.success('Support email saved');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save support email';
      toast.error(msg);
    } finally {
      setIsSavingSupportEmail(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!inboundAddress) {
      toast.error('Inbound address is not provisioned yet');
      return;
    }
    setIsSendingTest(true);
    try {
      await api.post('/email/inbound', {
        to: inboundAddress,
        from: 'test@opsflow.test',
        subject: 'OpsFlow test email',
        text: 'This is a test email from the email settings page.',
        messageId: `settings-test-${Date.now()}`,
      });
      toast.success('Test email sent. Check Tickets for a new inbound ticket.');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to send test email';
      toast.error(msg);
    } finally {
      setIsSendingTest(false);
    }
  };

  const statusText = formatLastEmailStatus(lastInboundAt);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-bold text-text-primary">Email forwarding</h2>
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        {isLoading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-3 w-52 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {!isLoading && !error && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg">Primary support email</h3>
              <div className="text-sm text-text-muted">
                This is the address your customers email today, for example support@agency.com.
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary"
                  placeholder="support@agency.com"
                />
                <Button size="sm" onClick={handleSaveSupportEmail} isLoading={isSavingSupportEmail}>
                  Save
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg">Inbound email address</h3>
              <div className="text-sm text-text-muted">
                Forward your support inbox to this address so every email becomes a ticket.
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary">
                {inboundAddress || 'Not provisioned'}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-text-primary">Forwarding status</div>
                  <div className="text-xs text-text-muted">{statusText}</div>
                </div>
                <Button size="sm" onClick={handleSendTestEmail} isLoading={isSendingTest}>
                  Send test email
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-sm font-medium text-text-primary">Need help configuring?</div>
              <div className="text-xs text-text-muted">
                Follow the step-by-step guide for Gmail, Outlook, and custom domains in the{' '}
                <Link to="/docs#email-forwarding" className="text-accent-primary underline">
                  email forwarding docs
                </Link>
                .
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
