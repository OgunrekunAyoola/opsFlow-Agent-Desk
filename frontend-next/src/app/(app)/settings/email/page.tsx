'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw, Save, Copy, Check } from 'lucide-react';
import { fetchWithAccess } from '../../../../lib/auth-client';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../../components/ui/Card';

interface EmailConfig {
  inboundAddress: string;
  inboundSecret: string;
  supportEmail?: string;
}

export default function EmailSettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const res = await fetchWithAccess<EmailConfig>('/settings/email-config');
      if (res.ok && res.data) {
        setConfig(res.data);
      } else {
        setError('Failed to load email configuration');
      }
    } catch (err) {
      setError('An error occurred while loading settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    try {
      const res = await fetchWithAccess('/settings/email-config', {
        method: 'POST',
        body: JSON.stringify({
          supportEmail: config.supportEmail,
        }),
      });

      if (res.ok) {
        // success
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading email settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Email Settings</h1>
        <p className="text-slate-400">Configure inbound email processing and support address.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            Inbound Configuration
          </CardTitle>
          <CardDescription>
            Forward emails to this address to automatically create tickets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Inbound Address</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm font-mono text-slate-300 break-all">
                {config?.inboundAddress || 'Not configured'}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => config?.inboundAddress && copyToClipboard(config.inboundAddress)}
                disabled={!config?.inboundAddress}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Set up auto-forwarding from your support email to this address.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Webhook Secret</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm font-mono text-slate-300 break-all">
                {config?.inboundSecret || 'Not generated'}
              </code>
            </div>
            <p className="text-xs text-slate-500">
              Used to verify the authenticity of inbound webhooks if you configure them manually.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support Email</CardTitle>
          <CardDescription>
            The email address your customers send support requests to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Support Email Address</label>
              <Input
                type="email"
                placeholder="support@yourcompany.com"
                value={config?.supportEmail || ''}
                onChange={(e) =>
                  setConfig((prev) => (prev ? { ...prev, supportEmail: e.target.value } : null))
                }
              />
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
