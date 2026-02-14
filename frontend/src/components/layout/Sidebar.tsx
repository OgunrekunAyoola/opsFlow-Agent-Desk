import { LayoutDashboard, Ticket, Users, Settings, Bot, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Ticket, label: 'Tickets', href: '/tickets' },
  { icon: Building2, label: 'Clients', href: '/clients' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 glass-panel rounded-2xl flex flex-col p-4 z-20 hidden md:flex">
      <div className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="w-10 h-10 bg-grad-main rounded-xl flex items-center justify-center text-white shadow-lg">
          <Bot size={24} />
        </div>
        <span className="font-heading font-bold text-xl text-text-primary">OpsFlow</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-grad-main text-white shadow-md shadow-blue-500/20'
                  : 'text-text-muted hover:bg-white/50 hover:text-text-primary',
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-accent-primary">
            <Bot size={16} />
            <span className="text-xs font-bold uppercase">AI Status</span>
          </div>
          <p className="text-xs text-text-muted">Robot is ready to triage tickets.</p>
        </div>
      </div>
    </aside>
  );
}
