import { useEffect, useState } from 'react';
import api from '../lib/api';
// import { useToast } from '../context/ToastContext';

export function Settings() {
  const [inboundAddress, setInboundAddress] = useState<string>('');
  // const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        const addr = res.data?.tenant?.inboundAddress || res.data?.inbound?.address || '';
        setInboundAddress(addr);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-bold text-text-primary">Settings</h2>
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading font-bold text-lg mb-4">Email</h3>
        <div className="space-y-2">
          <div className="text-sm text-text-muted">Inbound Address</div>
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary">
            {inboundAddress || 'Not provisioned'}
          </div>
          <div className="text-xs text-text-muted">
            Configure your provider to forward inbound emails to this address or send webhook with
            x-inbound-secret.
          </div>
        </div>
      </div>
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="font-heading font-bold text-lg mb-4">Connectors</h3>
        <p className="text-sm text-text-muted">Jira, GitHub, Zendesk — coming soon.</p>
      </div>
    </div>
  );
}
