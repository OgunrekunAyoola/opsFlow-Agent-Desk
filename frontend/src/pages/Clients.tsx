import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ClientItem {
  id: string;
  name: string;
  domain?: string;
}

export function Clients() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchClients = async () => {
    try {
      if (isInitialLoading) {
        setError(null);
      }
      const res = await api.get('/clients');
      const list = (res.data.clients || []).map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
        domain: c.domain,
      }));
      setClients(list);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to load clients';
      setError(msg);
      toast.error(msg);
    }
    setIsInitialLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await api.post('/clients', { name, domain: domain || undefined });
      setName('');
      setDomain('');
      toast.success('Client created');
      fetchClients();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to create client';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-text-primary">Clients</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-heading font-bold text-lg mb-4">Client List</h3>
          {error ? (
            <div className="space-y-3 text-center">
              <div className="text-sm font-medium text-red-600">Failed to load clients.</div>
              <div className="text-xs text-text-muted">{error}</div>
              <Button size="sm" variant="secondary" onClick={fetchClients}>
                Retry
              </Button>
            </div>
          ) : isInitialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse h-12 rounded-xl bg-slate-100 border border-slate-200"
                />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <p className="text-text-muted text-sm">No clients yet.</p>
          ) : (
            <div className="space-y-3">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-text-primary">{c.name}</div>
                    <div className="text-xs text-text-muted">{c.domain || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Add Client</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                placeholder="Acme Inc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Domain (optional)
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                placeholder="acme.com"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              <Plus size={16} className="mr-2" /> Create
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
