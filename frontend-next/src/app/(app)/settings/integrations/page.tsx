'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Plug,
  RefreshCw,
  Trash2,
  Key,
  ExternalLink,
} from 'lucide-react';
import { fetchWithAccess } from '../../../../lib/auth-client';
import { Button } from '../../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Skeleton } from '../../../../components/ui/Skeleton';

interface IntegrationProfile {
  email?: string;
  name?: string;
  maskedKey?: string;
  [key: string]: unknown;
}

interface IntegrationProvider {
  name: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  authType: 'oauth2' | 'api_key';
  connection: {
    id: string;
    status: 'active' | 'error' | 'disconnected';
    lastSyncAt?: string;
    profile?: IntegrationProfile;
  } | null;
}

export default function IntegrationsPage() {
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // API Key Modal State
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAccess<{ providers: IntegrationProvider[] }>('/integrations');
      if (res.ok && res.data) {
        setProviders(res.data.providers);
      } else {
        setError('Failed to load integrations');
      }
    } catch (err) {
      setError('An error occurred while loading integrations.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider: IntegrationProvider) {
    if (provider.authType === 'api_key') {
      setSelectedProvider(provider);
      setApiKeyInput('');
      setApiKeyModalOpen(true);
      return;
    }

    // OAuth2 Flow
    setActionLoading(provider.name);
    try {
      const res = await fetchWithAccess<{ url: string }>(`/integrations/${provider.name}/connect`, {
        method: 'POST',
      });

      if (res.ok && res.data?.url) {
        window.location.assign(res.data.url);
      } else {
        // ideally show toast
        alert('Failed to start connection');
        setActionLoading(null);
      }
    } catch (err) {
      alert('Failed to start connection');
      setActionLoading(null);
    }
  }

  async function submitApiKey() {
    if (!selectedProvider || !apiKeyInput) return;

    const providerName = selectedProvider.name;
    setActionLoading(providerName);
    setApiKeyModalOpen(false);

    try {
      const res = await fetchWithAccess(`/integrations/${providerName}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput }),
      });

      if (res.ok) {
        // toast success
        await loadIntegrations();
      } else {
        const err = res.data as { error?: string };
        alert(`Failed to connect: ${err?.error || 'Unknown error'}`);
      }
    } catch (_e) {
      alert('Connection failed');
    }
    setActionLoading(null);
    setSelectedProvider(null);
  }

  async function handleSync(connectionId: string) {
    setActionLoading(connectionId);
    try {
      const res = await fetchWithAccess<{ message: string }>(`/integrations/${connectionId}/sync`, {
        method: 'POST',
      });

      if (res.ok) {
        await loadIntegrations();
      } else {
        alert('Failed to start sync');
      }
    } catch (err) {
      alert('Failed to start sync');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDisconnect(connectionId: string) {
    if (!confirm('Are you sure you want to disconnect?')) return;

    setActionLoading(connectionId);
    try {
      const res = await fetchWithAccess(`/integrations/${connectionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadIntegrations();
      } else {
        alert('Failed to disconnect');
      }
    } catch (err) {
      alert('Failed to disconnect');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading && providers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Integrations</h1>
          <p className="text-slate-400 mt-2">
            Connect your tools to OpsFlow AI to sync tickets and data.
          </p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3 text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card
            key={provider.name}
            className="flex flex-col border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all duration-300"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm">
                  {provider.iconUrl ? (
                    <img src={provider.iconUrl} alt={provider.name} className="h-7 w-7" />
                  ) : (
                    <Plug className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                {provider.connection && (
                  <Badge
                    variant="outline"
                    className={
                      provider.connection.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }
                  >
                    {provider.connection.status === 'active' ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" /> Error
                      </span>
                    )}
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4 text-lg">{provider.displayName}</CardTitle>
              <CardDescription className="line-clamp-2 h-10">
                {provider.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto pt-0 space-y-4">
              {provider.connection?.profile && (
                <div className="bg-slate-950/50 rounded-lg p-3 text-xs border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Connected as:</span>
                    {provider.connection.lastSyncAt && (
                      <span
                        title={`Synced: ${new Date(provider.connection.lastSyncAt).toLocaleString()}`}
                      >
                        Synced {new Date(provider.connection.lastSyncAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-slate-200 truncate flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {provider.connection.profile.email ||
                      provider.connection.profile.name ||
                      provider.connection.profile.maskedKey ||
                      'Unknown User'}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                {provider.connection ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-700 hover:bg-slate-800 hover:text-slate-200"
                      onClick={() => handleSync(provider.connection!.id)}
                      disabled={actionLoading === provider.connection!.id}
                    >
                      {actionLoading === provider.connection!.id ? (
                        <>
                          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Syncing
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-3.5 w-3.5" /> Sync
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                      onClick={() => handleDisconnect(provider.connection!.id)}
                      disabled={actionLoading === provider.connection!.id}
                    >
                      {actionLoading === provider.connection!.id ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                    onClick={() => handleConnect(provider)}
                    disabled={actionLoading === provider.name}
                  >
                    {actionLoading === provider.name ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        {provider.authType === 'api_key' ? (
                          <Key className="mr-2 h-4 w-4" />
                        ) : (
                          <ExternalLink className="mr-2 h-4 w-4" />
                        )}
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Key Modal Overlay */}
      {apiKeyModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl">
            <CardHeader>
              <CardTitle>Connect {selectedProvider.displayName}</CardTitle>
              <CardDescription>Enter your API Key to connect this integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  API Key
                </label>
                <Input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk_..."
                  className="font-mono"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setApiKeyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-500"
                  onClick={submitApiKey}
                  disabled={!apiKeyInput || actionLoading === selectedProvider.name}
                >
                  {actionLoading === selectedProvider.name ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
