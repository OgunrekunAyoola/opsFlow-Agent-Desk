import { useState, useEffect } from 'react';
import { TicketCard, type TicketProps } from '../components/tickets/TicketCard';
import { CreateTicketModal } from '../components/tickets/CreateTicketModal';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const FILTERS = ['All', 'New', 'Triaged', 'Replied', 'Closed'];

export function Tickets() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [tickets, setTickets] = useState<TicketProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, pageSize };
      if (activeFilter !== 'All') params.status = activeFilter.toLowerCase();
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
  }, [activeFilter, search, page]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
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
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus size={16} className="mr-2" /> New Ticket
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-20 text-text-muted">Loading tickets...</div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        ) : (
          <div className="text-center py-20 text-text-muted">No tickets found in this view.</div>
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
