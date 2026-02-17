import { AlertTriangle, Bell, Clock, Mail, Search, User, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';

type NotificationType =
  | 'ticket_assigned'
  | 'high_priority_ticket'
  | 'sla_warning'
  | 'auto_reply_sent'
  | 'team_member_joined';

type NotificationItem = {
  _id: string;
  type: NotificationType;
  message: string;
  url?: string;
  readAt?: string;
  createdAt?: string;
};

function formatTimeAgo(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff) || diff < 0) return '';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function TicketIcon() {
  return (
    <svg
      className="w-4 h-4 text-cyan-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        className="stroke-current"
        strokeWidth="1.6"
      />
      <path d="M8 10H16" className="stroke-current" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 14H12" className="stroke-current" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function iconForType(type: NotificationType) {
  if (type === 'ticket_assigned') return <TicketIcon />;
  if (type === 'high_priority_ticket') return <AlertTriangle className="w-4 h-4 text-red-500" />;
  if (type === 'sla_warning') return <Clock className="w-4 h-4 text-amber-500" />;
  if (type === 'auto_reply_sent') return <Mail className="w-4 h-4 text-emerald-500" />;
  if (type === 'team_member_joined') return <UserPlus className="w-4 h-4 text-sky-500" />;
  return <Bell className="w-4 h-4 text-slate-400" />;
}

export function TopBar() {
  const [userName, setUserName] = useState('User');
  const [tenantName, setTenantName] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const navigate = useNavigate();
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
      try {
        setIsLoadingNotifications(true);
        const res = await api.get('/notifications', { params: { limit: 10 } });
        const items = (res.data?.items || []) as NotificationItem[];
        const count = typeof res.data?.unreadCount === 'number' ? res.data.unreadCount : 0;
        setNotifications(items);
        setUnreadCount(count);
      } catch {
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    load();
  }, []);

  const handleNotificationClick = async (item: NotificationItem) => {
    const isUnread = !item.readAt;
    if (isUnread) {
      try {
        await api.post(`/notifications/${item._id}/read`);
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, readAt: now } : n)),
        );
        setUnreadCount((c) => (c > 0 ? c - 1 : 0));
      } catch {}
    }
    if (item.url) {
      navigate(item.url);
      setIsNotificationsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;
    try {
      await api.post('/notifications/mark-all-read');
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
      setUnreadCount(0);
    } catch {}
  };

  const hasNotifications = notifications.length > 0;

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

        <div className="relative">
          <button
            className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            type="button"
            aria-label="Open notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-[11px] font-semibold text-white flex items-center justify-center px-[5px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-950 shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-semibold tracking-wide text-slate-300">
                  Notifications
                </span>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={!unreadCount || isLoadingNotifications}
                  className="text-[11px] font-medium text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-default"
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {isLoadingNotifications && !hasNotifications && (
                  <div className="px-4 py-6 text-xs text-slate-400">Loading notifications...</div>
                )}
                {!isLoadingNotifications && !hasNotifications && (
                  <div className="px-4 py-6 text-xs text-slate-400">You are all caught up.</div>
                )}
                {hasNotifications &&
                  notifications.map((item) => {
                    const isUnread = !item.readAt;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left text-xs transition-colors ${
                          isUnread
                            ? 'bg-slate-900/70 hover:bg-slate-800'
                            : 'bg-slate-950 hover:bg-slate-900'
                        }`}
                      >
                        <div className="mt-[2px] flex-shrink-0 rounded-full bg-slate-900/90 p-1.5">
                          {iconForType(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] text-slate-100 leading-snug">
                              {item.message}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">
                              {formatTimeAgo(item.createdAt)}
                            </span>
                            {isUnread && (
                              <span className="inline-flex items-center rounded-full bg-blue-500/15 text-[10px] font-semibold text-blue-300 px-2 py-[2px]">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

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
