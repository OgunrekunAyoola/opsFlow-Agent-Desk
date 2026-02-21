'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAccess } from '../../lib/auth-client';

interface TicketListItem {
  _id: string;
  subject: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  customerEmail?: string;
  customerName?: string;
  createdAt: string;
  assignee?: { name: string };
  isAiTriaged?: boolean;
}

interface TicketsResponse {
  items: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
}

const FILTERS = ['All', 'New', 'Triaged', 'Awaiting Reply', 'Closed'];

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-10 text-white">
          <h1 className="text-2xl font-semibold mb-2">Tickets</h1>
          <p className="text-sm text-white/70">Loading ticket list…</p>
        </div>
      }
    >
      <TicketsPageInner />
    </Suspense>
  );
}

function TicketsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => {
    const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
    return initialPage;
  });
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assignedToMe = searchParams.get('mine') === 'true';
  const searchValue = searchParams.get('q') || '';
  const activeFilter = (() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'new') return 'New';
    if (statusParam === 'triaged') return 'Triaged';
    if (statusParam === 'awaiting_reply') return 'Awaiting Reply';
    if (statusParam === 'closed') return 'Closed';
    return 'All';
  })();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string | number | boolean> = { page };
      if (searchValue.trim()) {
        params.q = searchValue.trim();
      }
      if (assignedToMe) {
        params.mine = true;
      }
      if (activeFilter === 'New') {
        params.status = 'new';
      } else if (activeFilter === 'Triaged') {
        params.status = 'triaged';
      } else if (activeFilter === 'Awaiting Reply') {
        params.status = 'awaiting_reply';
      } else if (activeFilter === 'Closed') {
        params.status = 'closed';
      }
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => query.set(k, String(v)));
      const res = await fetchWithAccess<TicketsResponse>(`/tickets?${query.toString()}`);
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Unable to load tickets.');
        }
        setIsLoading(false);
        return;
      }
      const data = res.data;
      if (data) {
        setTickets(data.items || []);
        setTotal(data.total || 0);
        setPageSize(data.pageSize || 20);
      } else {
        setTickets([]);
        setTotal(0);
      }
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router, page, searchValue, activeFilter, assignedToMe]);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / pageSize), 1), [total, pageSize]);

  const updateSearchParams = (next: URLSearchParams) => {
    const href = `/tickets?${next.toString()}`;
    router.push(href);
  };

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <p className="text-sm text-white/70">Search, filter, and manage your support queue.</p>
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="search"
            placeholder="Search subjects or customers"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              const next = new URLSearchParams(searchParams.toString());
              if (value.trim()) next.set('q', value.trim());
              else next.delete('q');
              next.set('page', '1');
              setPage(1);
              updateSearchParams(next);
            }}
            className="w-52 rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams.toString());
                if (filter === 'All') {
                  next.delete('status');
                } else if (filter === 'Awaiting Reply') {
                  next.set('status', 'awaiting_reply');
                } else {
                  next.set('status', filter.toLowerCase().replace(' ', '_'));
                }
                next.set('page', '1');
                setPage(1);
                updateSearchParams(next);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                activeFilter === filter
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams.toString());
            const nextValue = next.get('mine') === 'true' ? 'false' : 'true';
            if (nextValue === 'true') next.set('mine', 'true');
            else next.delete('mine');
            next.set('page', '1');
            updateSearchParams(next);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
            assignedToMe
              ? 'bg-white text-slate-950 border-white'
              : 'bg-white/5 text-white/70 border-white/20 hover:bg-white/10'
          }`}
        >
          Assigned to me
        </button>
      </div>

      <section className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-slate-950/70 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1 grid grid-cols-12 gap-4">
                    <div className="col-span-5 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="h-6 bg-white/10 rounded w-20" />
                      <div className="h-6 bg-white/10 rounded w-20" />
                      <div className="h-6 bg-white/10 rounded w-24" />
                    </div>
                    <div className="col-span-3 flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-white/70">{error}</div>
        ) : tickets.length > 0 ? (
          tickets.map((ticket) => <TicketRow key={ticket._id} ticket={ticket} />)
        ) : (
          <div className="py-16 text-center text-sm text-white/70">
            No tickets in this view yet.
          </div>
        )}
      </section>

      <footer className="flex items-center justify-between text-xs text-white/60">
        <span>
          Page {page} of {totalPages} • {total} total
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextPage = Math.max(page - 1, 1);
              setPage(nextPage);
              const next = new URLSearchParams(searchParams.toString());
              next.set('page', String(nextPage));
              updateSearchParams(next);
            }}
            disabled={page <= 1}
            className="px-3 py-1 rounded-full border border-white/20 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed text-xs bg-white/5 hover:bg-white/10"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => {
              const nextPage = Math.min(page + 1, totalPages);
              setPage(nextPage);
              const next = new URLSearchParams(searchParams.toString());
              next.set('page', String(nextPage));
              updateSearchParams(next);
            }}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-full border border-white/20 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed text-xs bg-white/5 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: TicketListItem }) {
  return (
    <Link
      href={`/tickets/${ticket._id}`}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 hover:border-cyan-400/60 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/70">
        {ticket.customerName?.charAt(0).toUpperCase() ||
          ticket.customerEmail?.charAt(0).toUpperCase() ||
          'C'}
      </div>
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-5 min-w-0">
          <p className="text-sm font-medium truncate">{ticket.subject}</p>
          <p className="text-xs text-white/60 truncate">
            {ticket.customerName || ticket.customerEmail}
          </p>
        </div>
        <div className="col-span-4 flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/20">
            {ticket.status}
          </span>
          <span className="text-xs text-white/70">{ticket.category}</span>
        </div>
        <div className="col-span-3 flex flex-col items-end gap-1">
          <span className="text-xs text-white/70">{ticket.assignee?.name || 'Unassigned'}</span>
          <span className="text-[11px] text-white/50">
            {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
