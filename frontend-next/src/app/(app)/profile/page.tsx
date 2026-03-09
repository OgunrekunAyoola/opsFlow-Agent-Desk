'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAccess, getChangePasswordClient } from '../../../lib/auth-client';

interface MeResponse {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

interface UserAction {
  _id: string;
  type: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['user'] | null>(null);
  const [name, setName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [actions, setActions] = useState<UserAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      const res = await fetchWithAccess<MeResponse>('/auth/me');
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        }
        return;
      }
      const user = res.data?.user || null;
      setMe(user);
      setName(user?.name || '');
    }
    async function loadActions() {
      setActionsLoading(true);
      const res = await fetchWithAccess<{ actions?: UserAction[] }>('/actions?limit=20');
      if (cancelled) return;
      if (res.ok && res.data?.actions) {
        setActions(res.data.actions);
      }
      setActionsLoading(false);
    }
    loadMe();
    loadActions();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileMessage(null);
    const res = await fetchWithAccess<{ error?: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/login');
      } else {
        const msg = res.data && 'error' in res.data ? res.data.error : null;
        setProfileError(msg || 'Failed to update profile.');
      }
      setProfileSaving(false);
      return;
    }
    setProfileMessage('Profile updated.');
    setMe((prev) => ({ ...(prev || {}), name: name.trim() }));
    setProfileSaving(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordMessage(null);
    const client = getChangePasswordClient();
    try {
      const { error } = await client.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) {
        const msg = error.message || 'Failed to change password.';
        setPasswordError(msg);
        setPasswordSaving(false);
        return;
      }
      setPasswordMessage('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSaving(false);
    } catch {
      setPasswordError('Failed to change password.');
      setPasswordSaving(false);
    }
  }

  async function logout() {
    await fetchWithAccess('/auth/logout', {
      method: 'POST',
    });
    window.location.href = '/login';
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-white/70">Update your name, password, and session.</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          Log out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Profile details</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={me?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-3 py-2 text-sm text-white/70"
                />
              </div>
            </div>
            {profileError && <div className="text-xs text-red-300">{profileError}</div>}
            {profileMessage && <div className="text-xs text-emerald-300">{profileMessage}</div>}
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {profileSaving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
          <h2 className="text-sm font-semibold">Change password</h2>
          <form onSubmit={changePassword} className="space-y-3">
            <div>
              <label className="block text-xs text-white/60 mb-1">Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
            {passwordError && <div className="text-xs text-red-300">{passwordError}</div>}
            {passwordMessage && <div className="text-xs text-emerald-300">{passwordMessage}</div>}
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-950 hover:bg-slate-100 disabled:opacity-60"
            >
              {passwordSaving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-3">
        <h2 className="text-sm font-semibold">Recent activity</h2>
        {actionsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-8 rounded-lg bg-white/10 animate-pulse" />
            ))}
          </div>
        ) : actions.length === 0 ? (
          <p className="text-xs text-white/60">No recent account activity recorded.</p>
        ) : (
          <ul className="space-y-2 text-xs">
            {actions.map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-white/80">{a.type}</span>
                <span className="text-white/50">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
