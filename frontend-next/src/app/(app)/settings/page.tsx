'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAccess } from '../../../lib/auth-client';
import { useToast } from '../../../context/ToastContext';

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
    autoTriageOnInbound?: boolean;
    autoReplyEnabled?: boolean;
    autoReplyConfidenceThreshold?: number;
    autoReplySafeCategories?: string[];
    aiDraftEnabled?: boolean;
    aiUsePastTickets?: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState<string | null>(null);
  const [supportEmail, setSupportEmail] = useState('');
  const [autoTriageOnInbound, setAutoTriageOnInbound] = useState(false);
  const [autoReply, setAutoReply] = useState<AutoReplySettings>({
    autoReplyEnabled: false,
    autoReplyConfidenceThreshold: 0.8,
    autoReplySafeCategories: ['billing', 'bug'],
  });
  const [aiDraftEnabled, setAiDraftEnabled] = useState(true);
  const [aiUsePastTickets, setAiUsePastTickets] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [rotatingKey, setRotatingKey] = useState(false);

  const [inboundAddress, setInboundAddress] = useState<string | null>(null);
  const [inboundSecret, setInboundSecret] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      setLoading(true);
      setError(null);

      // Load basic user info
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

      // Load configs from dedicated endpoints for completeness
      try {
        const [emailRes, aiRes, keyRes] = await Promise.all([
          fetchWithAccess<{
            inboundAddress?: string;
            inboundSecret?: string;
            supportEmail?: string;
          }>('/settings/email-config'),
          fetchWithAccess<{
            autoTriageOnInbound: boolean;
            autoReplyEnabled: boolean;
            autoReplyConfidenceThreshold: number;
            autoReplySafeCategories: string[];
            aiDraftEnabled: boolean;
            aiUsePastTickets: boolean;
          }>('/settings/ai-config'),
          fetchWithAccess<{ apiKey: string | null }>('/settings/ingest-api-key'),
        ]);

        if (cancelled) return;

        if (emailRes.ok && emailRes.data) {
          setSupportEmail(emailRes.data.supportEmail || '');
          setInboundAddress(emailRes.data.inboundAddress || null);
          setInboundSecret(emailRes.data.inboundSecret || null);
        }

        if (aiRes.ok && aiRes.data) {
          setAutoTriageOnInbound(!!aiRes.data.autoTriageOnInbound);
          setAutoReply({
            autoReplyEnabled: aiRes.data.autoReplyEnabled,
            autoReplyConfidenceThreshold: aiRes.data.autoReplyConfidenceThreshold,
            autoReplySafeCategories: (aiRes.data.autoReplySafeCategories as CategoryKey[]) || [],
          });
          setAiDraftEnabled(aiRes.data.aiDraftEnabled);
          setAiUsePastTickets(aiRes.data.aiUsePastTickets);
        } else if (me?.tenant) {
          // Fallback to /me data if specific endpoint fails (or not deployed yet)
          if (me.tenant.supportEmail) setSupportEmail(me.tenant.supportEmail);
          setAutoTriageOnInbound(!!me.tenant.autoTriageOnInbound);
          setAutoReply({
            autoReplyEnabled: !!me.tenant.autoReplyEnabled,
            autoReplyConfidenceThreshold: me.tenant.autoReplyConfidenceThreshold ?? 0.8,
            autoReplySafeCategories: Array.isArray(me.tenant.autoReplySafeCategories)
              ? (me.tenant.autoReplySafeCategories.filter(
                  (x) => x === 'billing' || x === 'bug' || x === 'feature',
                ) as CategoryKey[])
              : ['billing', 'bug'],
          });
          setAiDraftEnabled(
            typeof me.tenant.aiDraftEnabled === 'boolean' ? me.tenant.aiDraftEnabled : true,
          );
          setAiUsePastTickets(
            typeof me.tenant.aiUsePastTickets === 'boolean' ? me.tenant.aiUsePastTickets : true,
          );
        }

        if (keyRes.ok) {
          setApiKey(keyRes.data?.apiKey ?? null);
        }
      } catch (err) {
        console.error('Error loading settings details', err);
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

    // Save AI Config
    payloads.push(
      fetchWithAccess('/settings/ai-config', {
        method: 'POST',
        body: JSON.stringify({
          autoTriageOnInbound,
          autoReplyEnabled: autoReply.autoReplyEnabled,
          autoReplyConfidenceThreshold: autoReply.autoReplyConfidenceThreshold,
          autoReplySafeCategories: autoReply.autoReplySafeCategories,
          aiDraftEnabled,
          aiUsePastTickets,
        }),
      }),
    );

    // Save Email Config
    payloads.push(
      fetchWithAccess('/settings/email-config', {
        method: 'POST',
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
        toast.error('Failed to save settings');
      }
      setSaving(false);
      return;
    }

    setSaveMessage('Settings saved.');
    toast.success('Settings saved');
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
        <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-white/60">
          <Link
            href="/dashboard"
            className="px-2 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
          >
            ← Dashboard
          </Link>
          <Link
            href="/dashboard/metrics"
            className="px-2 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
          >
            Metrics
          </Link>
          <Link
            href="/tickets"
            className="px-2 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
          >
            Tickets
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Link
        href="/settings/integrations"
        className="block w-full text-center px-4 py-3 rounded-lg bg-cyan-500/10 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-colors mb-4"
      >
        Manage Integrations
      </Link>

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

        <fieldset className="space-y-4" disabled={disabled}>
          <legend className="text-sm font-semibold">AI assistant controls</legend>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAutoTriageOnInbound((v) => !v)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                autoTriageOnInbound
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white/5 text-white border-white/20'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {autoTriageOnInbound ? 'Auto triage on inbound: On' : 'Auto triage on inbound: Off'}
            </button>
            <p className="text-xs text-white/60">
              Run triage automatically when tickets are ingested.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAiDraftEnabled((v) => !v)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                aiDraftEnabled
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-white/5 text-white border-white/20'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {aiDraftEnabled ? 'Drafting enabled' : 'Drafting disabled'}
            </button>
            <p className="text-xs text-white/60">Control whether AI can draft replies.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAiUsePastTickets((v) => !v)}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                aiUsePastTickets
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-white/5 text-white border-white/20'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {aiUsePastTickets ? 'Past tickets on' : 'Past tickets off'}
            </button>
            <p className="text-xs text-white/60">
              When off, AI only uses official knowledge base docs.
            </p>
          </div>
        </fieldset>

        <fieldset disabled={true} className="space-y-4">
          <legend className="text-sm font-semibold">Inbound email address</legend>
          <p className="text-xs text-white/60">
            Forward your support emails to this address to create tickets automatically.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white font-mono">
              {inboundAddress || 'Generating...'}
            </div>
            <button
              type="button"
              onClick={() => {
                if (inboundAddress) {
                  navigator.clipboard.writeText(inboundAddress);
                  setSaveMessage('Copied to clipboard');
                  setTimeout(() => setSaveMessage(null), 2000);
                }
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Copy"
            >
              📋
            </button>
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
                      toast.error('Failed to rotate API key');
                    }
                  } else {
                    setApiKey(res.data?.apiKey ?? null);
                    setSaveMessage('API key rotated.');
                    toast.success('API key rotated');
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

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold">Integrations</legend>
          <p className="text-xs text-white/60">
            Connect external tools (Helpdesk, CRM, etc.) to sync data.
          </p>
          <Link
            href="/settings/integrations"
            className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
          >
            Manage Integrations →
          </Link>
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
