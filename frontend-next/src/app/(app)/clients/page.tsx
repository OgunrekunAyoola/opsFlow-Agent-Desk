'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAccess } from '../../../lib/auth-client';

interface ClientItem {
  id: string;
  name: string;
  domain?: string;
}

interface ClientApi {
  _id?: string;
  id?: string;
  name?: string;
  domain?: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadClients() {
      setError(null);
      const res = await fetchWithAccess<{ clients?: ClientApi[] }>('/clients');
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load clients.');
        }
        setIsInitialLoading(false);
        return;
      }
      const list =
        res.data?.clients?.map((c: ClientApi) => ({
          id: String(c._id || c.id),
          name: c.name || 'Unnamed client',
          domain: c.domain,
        })) || [];
      setClients(list);
      setIsInitialLoading(false);
    }
    loadClients();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    setIsSaving(true);
    const res = await fetchWithAccess<{
      error?: string;
      client?: ClientApi;
    }>('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        domain: domain || undefined,
      }),
    });
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/login');
        setIsSaving(false);
        return;
      }
      const msg = res.data && 'error' in res.data ? res.data.error : null;
      setError(msg || 'Failed to create client.');
      setIsSaving(false);
      return;
    }
    setMessage('Client created.');
    setName('');
    setDomain('');
    setIsSaving(false);
    const refreshed = await fetchWithAccess<{ clients?: ClientApi[] }>('/clients');
    if (refreshed.ok && refreshed.data) {
      const list =
        refreshed.data.clients?.map((c: ClientApi) => ({
          id: String(c._id || c.id),
          name: c.name || 'Unnamed client',
          domain: c.domain,
        })) || [];
      setClients(list);
    }
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
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
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold mb-4">Client list</h2>
          {error && !isInitialLoading && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {isInitialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-12 rounded-xl bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-white/60">No clients yet.</p>
          ) : (
            <div className="space-y-3">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-white/60">{c.domain || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Add client</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Domain (optional)</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="acme.com"
              />
            </div>
            {message && <div className="text-xs text-emerald-300">{message}</div>}
            {error && <div className="text-xs text-red-300">{error}</div>}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {isSaving ? 'Creating...' : 'Create client'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
