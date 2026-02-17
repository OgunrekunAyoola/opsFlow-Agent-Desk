import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';

const ALL_SAFE_CATEGORIES = ['general', 'feature_request', 'bug'];

export function Settings() {
  const [inboundAddress, setInboundAddress] = useState<string>('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.9);
  const [safeCategories, setSafeCategories] = useState<string[]>(ALL_SAFE_CATEGORIES);
  const [isSavingAutoReply, setIsSavingAutoReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get('/auth/me');
        const user = res.data?.user;
        if (!user || user.role !== 'admin') {
          setError('You do not have permission to view settings.');
          return;
        }
        const tenant = res.data?.tenant;
        const addr = tenant?.inboundAddress || res.data?.inbound?.address || '';
        setInboundAddress(addr);
        if (tenant) {
          setAutoReplyEnabled(!!tenant.autoReplyEnabled);
          if (typeof tenant.autoReplyConfidenceThreshold === 'number') {
            setConfidenceThreshold(tenant.autoReplyConfidenceThreshold);
          }
          if (Array.isArray(tenant.autoReplySafeCategories)) {
            setSafeCategories(tenant.autoReplySafeCategories);
          }
        }
      } catch (err: any) {
        console.error(err);
        const msg = err.response?.data?.error || 'Failed to load settings';
        setError(msg);
        toast.error(msg);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const toggleCategory = (category: string) => {
    setSafeCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const handleSaveAutoReply = async () => {
    setIsSavingAutoReply(true);
    try {
      await api.patch('/auth/auto-reply-settings', {
        enabled: autoReplyEnabled,
        confidenceThreshold,
        safeCategories,
      });
      toast.success('Auto-reply settings saved');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setIsSavingAutoReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-bold text-text-primary">Settings</h2>
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        {isLoading && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
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
              <h3 className="font-heading font-bold text-lg">Email</h3>
              <div className="text-sm text-text-muted">Inbound Address</div>
              <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary">
                {inboundAddress || 'Not provisioned'}
              </div>
              <div className="text-xs text-text-muted">
                Configure your provider to forward inbound emails to this address or send webhook
                with x-inbound-secret.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading font-semibold text-sm text-text-primary">
                    AI Auto-Reply
                  </div>
                  <div className="text-xs text-text-muted">
                    Automatically send AI-generated replies when confidence is high and category is
                    safe.
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Toggle AI auto-reply"
                  aria-pressed={autoReplyEnabled}
                  onClick={() => setAutoReplyEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoReplyEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      autoReplyEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">
                    Confidence threshold ({confidenceThreshold.toFixed(2)})
                  </span>
                  <span className="text-xs text-text-muted">0.70 – 1.00</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1}
                  step={0.01}
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-text-muted">Safe categories</div>
                <div className="flex flex-wrap gap-2">
                  {ALL_SAFE_CATEGORIES.map((category) => {
                    const active = safeCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-text-muted border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {category.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveAutoReply} isLoading={isSavingAutoReply}>
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading font-bold text-lg mb-4">Connectors</h3>
        <p className="text-sm text-text-muted">Jira, GitHub, Zendesk — coming soon.</p>
      </div>
    </div>
  );
}
