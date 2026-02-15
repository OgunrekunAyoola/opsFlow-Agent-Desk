import { Bell, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

export function TopBar() {
  const [userName, setUserName] = useState('User');
  const [tenantName, setTenantName] = useState('');
  const logout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };
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
    <header className="h-20 flex items-center justify-between px-6 md:px-8 mb-8 border-b border-slate-800/70 bg-slate-950/90 backdrop-blur-xl rounded-2xl mx-4 mt-4 shadow-[0_18px_45px_rgba(15,23,42,0.85)] text-slate-100">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-300">OF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-heading font-semibold text-slate-50">OpsFlow</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">AI Agent Desk</span>
          </div>
        </Link>
        <div className="pl-4 border-l border-slate-800">
          <h1 className="text-2xl font-heading font-bold text-slate-50">Tickets</h1>
          <p className="text-sm text-slate-400">Your AI robot is ready to help.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            className="h-10 pl-10 pr-4 rounded-full bg-slate-900/80 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-primary/40 w-64"
          />
        </div>

        <button className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-50">{userName}</p>
            <p className="text-xs text-slate-400">{tenantName}</p>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-grad-soft p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-accent-primary">
              <User size={20} />
            </div>
          </Link>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-full bg-slate-900/80 border border-slate-700 text-sm text-slate-300 hover:text-white"
            title="Log out"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
