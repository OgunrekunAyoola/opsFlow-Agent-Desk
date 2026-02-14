import { useEffect, useState } from 'react';
import api from '../lib/api';

export function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const logout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get('/auth/me');
        setName(me.data?.user?.name || '');
        setEmail(me.data?.user?.email || '');
        setRole(me.data?.user?.role || '');
        const acts = await api.get('/actions?page=1&pageSize=10');
        setActions(acts.data?.items || []);
      } catch {}
    };
    load();
  }, []);

  async function saveProfile() {
    setLoading(true);
    setMessage('');
    try {
      await api.patch('/auth/profile', { name });
      setMessage('Profile updated');
    } catch {
      setMessage('Failed to update');
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(e: any) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const form = e.target;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setMessage('Password changed');
      form.reset();
    } catch {
      setMessage('Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-bold text-text-primary">Profile</h2>

      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-text-muted">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary"
            />
          </div>
          <div>
            <div className="text-xs text-text-muted">Email</div>
            <div className="mt-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary">{email}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted">Role</div>
            <div className="mt-1 px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary">{role}</div>
          </div>
        </div>
        <button
          onClick={saveProfile}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-grad-main text-white"
        >
          Save
        </button>
        <button
          onClick={logout}
          className="ml-3 px-4 py-2 rounded-xl bg-white border border-slate-200 text-text-primary"
        >
          Logout
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            name="currentPassword"
            type="password"
            placeholder="Current password"
            className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200"
          />
          <input
            name="newPassword"
            type="password"
            placeholder="New password"
            className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200"
          />
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-grad-main text-white">
            Change Password
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg">Recent Activity</h3>
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a._id} className="flex items-center justify-between px-4 py-2 rounded-xl bg-white border border-slate-200">
              <div className="text-sm text-text-primary">{a.type}</div>
              <div className="text-xs text-text-muted">{new Date(a.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {actions.length === 0 && <div className="text-sm text-text-muted">No activity</div>}
        </div>
      </div>

      {message && <div className="text-sm text-accent-primary">{message}</div>}
    </div>
  );
}
