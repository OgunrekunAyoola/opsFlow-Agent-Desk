import { useState, useEffect } from 'react';
import { Plus, User, Shield, Mail, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { CreateUserModal } from '../components/team/CreateUserModal';
import api from '../lib/api';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export function Team() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error('Failed to fetch users', err);
      const msg = err.response?.data?.error || 'Failed to load team members.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Team Members</h2>
          <p className="text-sm text-text-muted">Manage your support team and permissions.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Add Member
        </Button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {error ? (
            <div className="px-6 py-8 text-center">
              <div className="text-sm font-medium text-red-600 mb-2">
                Failed to load team members.
              </div>
              <div className="text-xs text-text-muted mb-4">{error}</div>
              <Button size="sm" variant="secondary" onClick={fetchUsers}>
                Retry
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8">
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="animate-pulse h-10 rounded-lg bg-slate-100" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-text-muted">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-grad-soft p-[2px] flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-accent-primary">
                              <User size={18} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-primary">{user.name}</div>
                            <div className="text-xs text-text-muted flex items-center gap-1">
                              <Mail size={12} /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role === 'admin' && <Shield size={12} className="mr-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
