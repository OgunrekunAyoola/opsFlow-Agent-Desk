'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAccess } from '../../lib/auth-client';

type CategoryKey = 'billing' | 'bug' | 'feature';

interface AutoReplySettings {
  autoReplyEnabled: boolean;
  autoReplyConfidenceThreshold: number;
  autoReplySafeCategories: CategoryKey[];
}

interface MeResponse {
  user?: { role?: string };
  tenant?: {
    supportEmail?: string;
    autoReplyEnabled?: boolean;
    autoReplyConfidenceThreshold?: number;
    autoReplySafeCategories?: string[];
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [supportEmail, setSupportEmail] = useState('');
  const [autoReply, setAutoReply] = useState<AutoReplySettings>({
    autoReplyEnabled: false,
    autoReplyConfidenceThreshold: 0.8,
    autoReplySafeCategories: ['billing', 'bug'],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [rotatingKey, setRotatingKey] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      setLoading(true);
      setError(null);
      const res = await fetchWithAccess<MeResponse>('/auth/me');
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load settings.');
        }
        setLoading(false);
        return;
      }
      const me = res.data;
      const r = me?.user?.role || null;
      setRole(r);
      if (me?.tenant) {
        setSupportEmail(me.tenant.supportEmail || '');
        setAutoReply({
          autoReplyEnabled: !!me.tenant.autoReplyEnabled,
          autoReplyConfidenceThreshold: me.tenant.autoReplyConfidenceThreshold ?? 0.8,
          autoReplySafeCategories: Array.isArray(me.tenant.autoReplySafeCategories)
            ? (me.tenant.autoReplySafeCategories.filter(
                (x) => x === 'billing' || x === 'bug' || x === 'feature',
              ) as CategoryKey[])
            : ['billing', 'bug'],
        });
      }
      const keyRes = await fetchWithAccess<{ apiKey: string | null }>('/settings/ingest-api-key');
      if (!cancelled && keyRes.ok) {
        setApiKey(keyRes.data?.apiKey ?? null);
      }
      setLoading(false);
    }
    loadMe();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (role !== 'admin') return;
    setSaving(true);
    setSaveMessage(null);
    setError(null);

    const payloads: Array<Promise<{ ok: boolean; status: number }>> = [];

    payloads.push(
      fetchWithAccess('/auth/auto-reply-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          enabled: autoReply.autoReplyEnabled,
          confidenceThreshold: autoReply.autoReplyConfidenceThreshold,
          safeCategories: autoReply.autoReplySafeCategories,
        }),
      }),
    );

    payloads.push(
      fetchWithAccess('/auth/tenant-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          supportEmail: supportEmail || null,
        }),
      }),
    );

    const results = await Promise.all(payloads);
    const anyError = results.find((r) => !r.ok);
    if (anyError) {
      if (anyError.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to save settings.');
      }
      setSaving(false);
      return;
    }

    setSaveMessage('Settings saved.');
    setSaving(false);
  }

  const disabled = role !== 'admin';

  if (!loading && role !== 'admin') {
    return (
      <div className="container mx-auto px-6 py-10 text-white">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-sm text-white/70">Only admins can manage workspace settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-white/70">
          Configure auto-replies, ingestion API keys, and workspace details.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={saveSettings}
        className="space-y-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6"
      >
        <fieldset className="space-y-4" disabled={disabled}>
          <legend className="text-sm font-semibold">Auto-reply</legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setAutoReply((s) => ({
                  ...s,
                  autoReplyEnabled: !s.autoReplyEnabled,
                }))
              }
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                autoReply.autoReplyEnabled
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white/5 text-white border-white/20'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {autoReply.autoReplyEnabled ? 'Enabled' : 'Disabled'}
            </button>
            <p className="text-xs text-white/60">Auto-send replies for safe tickets.</p>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Confidence threshold</label>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.05}
              value={autoReply.autoReplyConfidenceThreshold}
              onChange={(e) =>
                setAutoReply((s) => ({
                  ...s,
                  autoReplyConfidenceThreshold: Number(e.target.value),
                }))
              }
              className="w-full"
            />
            <div className="text-xs text-white/60 mt-1">
              {Math.round(autoReply.autoReplyConfidenceThreshold * 100)}% model confidence required.
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-2">Safe categories</label>
            <div className="flex flex-wrap gap-2">
              {(['billing', 'bug', 'feature'] as CategoryKey[]).map((key) => {
                const active = autoReply.autoReplySafeCategories.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setAutoReply((s) => {
                        const exists = s.autoReplySafeCategories.includes(key);
                        return {
                          ...s,
                          autoReplySafeCategories: exists
                            ? s.autoReplySafeCategories.filter((k) => k !== key)
                            : [...s.autoReplySafeCategories, key],
                        };
                      })
                    }
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                      active
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-white/5 text-white border-white/20'
                    } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        </fieldset>

        <fieldset disabled={disabled} className="space-y-4">
          <legend className="text-sm font-semibold">Support email address</legend>
          <p className="text-xs text-white/60">
            Optionally set a from-address for replies sent from OpsFlow.
          </p>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            placeholder="support@yourcompany.com"
          />
        </fieldset>

        <fieldset disabled={disabled} className="space-y-4">
          <legend className="text-sm font-semibold">Ingestion API key</legend>
          <p className="text-xs text-white/60">
            Use this key to authenticate calls to the ticket ingestion API. Rotate it if you suspect
            it has been exposed.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-xs font-mono text-white/80 overflow-x-auto">
                {apiKey || 'No key generated yet'}
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (disabled) return;
                setRotatingKey(true);
                setError(null);
                try {
                  const res = await fetchWithAccess<{ apiKey: string }>(
                    '/settings/ingest-api-key/rotate',
                    {
                      method: 'POST',
                    },
                  );
                  if (!res.ok) {
                    if (res.status === 401) {
                      router.push('/login');
                    } else {
                      setError('Failed to rotate API key.');
                    }
                  } else {
                    setApiKey(res.data?.apiKey ?? null);
                    setSaveMessage('API key rotated.');
                  }
                } finally {
                  setRotatingKey(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-60"
              disabled={disabled || rotatingKey}
            >
              {rotatingKey ? 'Rotating...' : apiKey ? 'Rotate key' : 'Generate key'}
            </button>
          </div>
          <p className="text-[11px] text-white/60">
            Updating the key will invalidate the previous one. Make sure any clients using the
            ingestion API update their configuration.
          </p>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={disabled || saving}
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {saveMessage && <span className="text-xs text-emerald-300">{saveMessage}</span>}
        </div>
      </form>
    </div>
  );
}
