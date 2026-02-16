import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TicketCard, type TicketProps } from '../components/tickets/TicketCard';
import { CreateTicketModal } from '../components/tickets/CreateTicketModal';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const FILTERS = ['All', 'Unassigned', 'New', 'Triaged', 'Awaiting Reply', 'Replied', 'Closed'];

export function Tickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') || '').toLowerCase();
  const initialQueue = searchParams.get('queue');
  const [activeFilter, setActiveFilter] = useState(
    initialQueue === 'unassigned'
      ? 'Unassigned'
      : initialStatus
        ? initialStatus === 'awaiting_reply'
          ? 'Awaiting Reply'
          : initialStatus.charAt(0).toUpperCase() + initialStatus.slice(1)
        : 'All',
  );
  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [assignedToMe, setAssignedToMe] = useState(searchParams.get('mine') === 'true');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, pageSize };
      if (assignedToMe && currentUserId) {
        params.assigneeId = currentUserId;
      } else if (activeFilter === 'Unassigned') {
        params.assigneeId = 'unassigned';
      } else if (activeFilter !== 'All') {
        params.status =
          activeFilter === 'Awaiting Reply' ? 'awaiting_reply' : activeFilter.toLowerCase();
      }
      const qpPriority = searchParams.get('priority');
      if (qpPriority) params.priority = qpPriority;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/tickets', { params });
      const data = Array.isArray(res.data)
        ? { items: res.data, total: res.data.length, page: 1, pageSize: res.data.length }
        : res.data;
      setTotal(data.total || 0);
      const mappedTickets = (data.items || []).map((t: any) => ({
        id: t._id,
        subject: t.subject,
        customer: t.clientId?.name || t.customerEmail,
        status: t.status,
        priority: t.priority,
        category: t.category,
        assignee: t.assigneeId ? { name: t.assigneeId.name } : undefined,
        createdAt: new Date(t.createdAt).toLocaleDateString(), // Simple formatting
        isAiTriaged: !!t.isAiTriaged,
      }));
      setTickets(mappedTickets);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error('Failed to fetch tickets', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, search, page, searchParams, assignedToMe, currentUserId]);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get('/auth/me');
        const id = res.data?.user?.id || res.data?.user?._id || null;
        setCurrentUserId(id);
      } catch {
        setCurrentUserId(null);
      }
    };
    loadMe();
  }, []);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                const next = new URLSearchParams(searchParams);
                let statusParam: string | null = null;
                let queueParam: string | null = null;

                if (filter === 'All') {
                  statusParam = null;
                  queueParam = null;
                } else if (filter === 'Unassigned') {
                  queueParam = 'unassigned';
                } else if (filter === 'Awaiting Reply') {
                  statusParam = 'awaiting_reply';
                } else {
                  statusParam = filter.toLowerCase();
                }

                if (statusParam) next.set('status', statusParam);
                else next.delete('status');
                if (queueParam) next.set('queue', queueParam);
                else next.delete('queue');
                next.delete('priority');
                setSearchParams(next);
                setPage(1);
              }}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeFilter === filter
                  ? 'bg-text-primary text-white shadow-md'
                  : 'bg-white text-text-muted hover:bg-slate-50 border border-slate-200',
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search tickets..."
            className="hidden md:block w-64 rounded-full border border-slate-200 px-3 py-2 focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none"
          />
          <Button
            size="sm"
            variant={assignedToMe ? 'primary' : 'secondary'}
            onClick={() => {
              const nextValue = !assignedToMe;
              const next = new URLSearchParams(searchParams);
              if (nextValue) next.set('mine', 'true');
              else next.delete('mine');
              setSearchParams(next);
              setAssignedToMe(nextValue);
              setPage(1);
            }}
          >
            Assigned to me
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus size={16} className="mr-2" /> New Ticket
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white/80 border border-slate-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100" />
                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-5 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="h-6 bg-slate-100 rounded w-20" />
                      <div className="h-6 bg-slate-100 rounded w-20" />
                      <div className="h-6 bg-slate-100 rounded w-24" />
                    </div>
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Plus />
            </div>
            <div className="text-text-primary font-bold mb-1">No results found</div>
            <div className="text-text-muted text-sm">
              {search.trim()
                ? `We couldn’t find any tickets matching “${search.trim()}”.`
                : 'No tickets in this view yet.'}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-muted">
          Page {page} of {totalPages} • {total} total
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTickets}
      />
    </div>
  );
}
