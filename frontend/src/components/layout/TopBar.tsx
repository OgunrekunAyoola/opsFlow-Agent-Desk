import { Bell, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

export function TopBar() {
  const [userName, setUserName] = useState('User');
  const [tenantName, setTenantName] = useState('');
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        const u = res.data?.user;
        const t = res.data?.tenant;
        if (u?.name) setUserName(u.name);
        if (t?.name) setTenantName(t.name);
      } catch {}
    };
    load();
  }, []);
  return (
    <header className="h-20 flex items-center justify-between px-8 mb-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">Tickets</h1>
        <p className="text-sm text-text-muted">Your AI robot is ready to help.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            className="h-10 pl-10 pr-4 rounded-full bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 w-64"
          />
        </div>

        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{userName}</p>
            <p className="text-xs text-text-muted">{tenantName}</p>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-grad-soft p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-accent-primary">
              <User size={20} />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
