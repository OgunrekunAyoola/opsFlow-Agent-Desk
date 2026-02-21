'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAccess } from '../../lib/auth-client';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}

interface ApiUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

type Role = 'admin' | 'member' | null;

export default function TeamPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      setIsLoading(true);
      setError(null);
      const res = await fetchWithAccess<{
        user?: { role?: string };
      }>('/auth/me');
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load current user.');
        }
        setIsLoading(false);
        return;
      }
      const r = res.data?.user?.role;
      if (r === 'admin' || r === 'member') {
        setRole(r);
      } else {
        setRole('member');
      }
      setIsLoading(false);
    }
    loadRole();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (role !== 'admin') return;
    let cancelled = false;
    async function loadUsers() {
      setIsLoading(true);
      setError(null);
      const res = await fetchWithAccess<{ users: ApiUser[] }>('/users');
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load team members.');
        }
        setIsLoading(false);
        return;
      }
      const users = res.data?.users ?? [];
      const list: TeamMember[] = users.map((u: ApiUser) => ({
        id: String(u._id || u.id),
        name: u.name || '',
        email: u.email || '',
        role: u.role === 'admin' ? 'admin' : 'member',
        createdAt: u.createdAt || '',
      }));
      setMembers(list);
      setIsLoading(false);
    }
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [role, router]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setCreateError('Name, email, and password are required.');
      return;
    }
    setIsCreating(true);
    const res = await fetchWithAccess<{
      user?: { id: string; name: string; email: string; role: string };
      error?: string;
    }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: 'member',
      }),
    });
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/login');
      } else {
        const msg = res.data && 'error' in res.data ? res.data.error : null;
        setCreateError(msg || 'Failed to create member.');
      }
      setIsCreating(false);
      return;
    }
    setCreateSuccess('Team member created.');
    setName('');
    setEmail('');
    setPassword('');
    setIsCreating(false);
    const refreshed = await fetchWithAccess<{ users: ApiUser[] }>('/users');
    if (refreshed.ok && refreshed.data) {
      const users = refreshed.data.users ?? [];
      const list: TeamMember[] = users.map((u: ApiUser) => ({
        id: String(u._id || u.id),
        name: u.name || '',
        email: u.email || '',
        role: u.role === 'admin' ? 'admin' : 'member',
        createdAt: u.createdAt || '',
      }));
      setMembers(list);
    }
  }

  if (role === 'member' && !isLoading) {
    return (
      <div className="container mx-auto px-6 py-10 text-white">
        <h1 className="text-2xl font-semibold mb-2">Team</h1>
        <p className="text-sm text-white/70 mb-4">
          You do not have permission to view team management.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team Members</h1>
          <p className="text-sm text-white/70">Manage your support team and permissions.</p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-slate-950/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase text-white/60 tracking-wide">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-6">
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-10 rounded-lg bg-white/10 animate-pulse" />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-white/60">
                    No team members found.
                  </td>
                </tr>
              ) : (
                members.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/80">
                          {user.name?.charAt(0).toUpperCase() ||
                            user.email?.charAt(0).toUpperCase() ||
                            'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-xs text-white/60">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                            : 'bg-blue-500/20 text-blue-200 border border-blue-500/40'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-xs text-white/60">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {role === 'admin' && (
        <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Invite member</h2>
          <p className="text-xs text-white/70">
            Create a new user in this workspace. They will receive an email when you share
            credentials.
          </p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Agent name"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="agent@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Temporary password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Set a temporary password"
                />
              </div>
            </div>
            {createError && <div className="text-xs text-red-300">{createError}</div>}
            {createSuccess && <div className="text-xs text-emerald-300">{createSuccess}</div>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
              >
                {isCreating ? 'Creating...' : 'Create member'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
