'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { fetchWithAccess } from '../../../lib/auth-client';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { io, Socket } from 'socket.io-client';
import { authClient } from '../../../lib/auth-client';

interface Ticket {
  _id: string;
  subject: string;
  status: string;
  priority: string;
  customerName?: string;
  customerEmail?: string;
  assigneeId?: { _id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  aiDraft?: {
    body?: string;
    confidence?: number;
  };
  slaBreached?: boolean;
}

interface TicketResponse {
  items: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  // Real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';
    const newSocket = io(API_BASE, {
      query: { userId: currentUser.id },
    });

    setSocket(newSocket);

    newSocket.on('ticket:created', (newTicket: Ticket) => {
      setTickets((prev) => [newTicket, ...prev]);
    });

    newSocket.on('ticket:updated', (updatedTicket: Ticket) => {
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (statusFilter) params.set('status', statusFilter);

        const res = await fetchWithAccess<TicketResponse>(`/tickets?${params.toString()}`);
        if (res.ok && res.data) {
          setTickets(res.data.items);
        } else if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load tickets');
        }
      } catch (err) {
        setError('An error occurred while loading tickets');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debouncedSearch, statusFilter, router]);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    triaged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    awaiting_reply: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    replied: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Tickets</h1>
          <p className="text-slate-400 mt-1">Manage and respond to support requests.</p>
        </div>
        <Link href="/tickets/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Button>
        </Link>
      </div>

      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-slate-800/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search tickets..."
                className="pl-9 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 w-32 rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-sm text-slate-200 outline-none focus:border-blue-500/50"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="waiting_on_customer">Waiting</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 text-slate-400 hover:text-slate-200"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-red-400">
              <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
              <p>{error}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-1">No tickets found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                {debouncedSearch
                  ? `No tickets match "${debouncedSearch}"`
                  : 'Get started by creating your first support ticket.'}
              </p>
              {!debouncedSearch && (
                <Link href="/tickets/new">
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                    Create Ticket
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  href={`/tickets/${ticket._id}`}
                  className="block hover:bg-slate-800/30 transition-colors"
                >
                  <div className="p-4 sm:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          ticket.status === 'new'
                            ? 'bg-blue-500'
                            : ticket.status === 'urgent'
                              ? 'bg-red-500'
                              : 'bg-slate-600'
                        }`}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200 truncate block">
                            {ticket.subject}
                          </span>
                          <span className="text-xs text-slate-500 shrink-0">
                            #{ticket._id.slice(-6)}
                          </span>
                          {ticket.aiDraft?.body &&
                            ticket.status !== 'replied' &&
                            ticket.status !== 'closed' && (
                              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] px-1.5 py-0 h-5">
                                AI Draft
                              </Badge>
                            )}
                          {ticket.slaBreached && (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0 h-5">
                              SLA Breached
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.customerName || ticket.customerEmail || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          {ticket.assigneeId && (
                            <span className="flex items-center gap-1 text-slate-400 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500/50" />
                              {ticket.assigneeId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`px-2 py-0.5 text-xs capitalize ${statusColors[ticket.status] || 'bg-slate-500/10'}`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-xs capitalize ${priorityColors[ticket.priority] || ''}`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-600">
                        {new Date(ticket.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
