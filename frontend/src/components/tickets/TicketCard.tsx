import { Link } from 'react-router-dom';
import { Bot, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TicketProps {
  id: string;
  subject: string;
  customer: string;
  status: 'new' | 'triaged' | 'awaiting_reply' | 'replied' | 'closed' | 'auto_resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignee?: { name: string; avatar?: string };
  isAiTriaged?: boolean;
  createdAt: string;
}

const statusColors: Record<TicketProps['status'], string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  triaged: 'bg-purple-100 text-purple-700 border-purple-200',
  awaiting_reply: 'bg-amber-100 text-amber-700 border-amber-200',
  replied: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
  auto_resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const priorityColors = {
  low: 'text-slate-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500 font-bold',
};

export function TicketCard({ ticket }: { ticket: TicketProps }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block group relative bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-[2px] hover:border-accent-primary/30 cursor-pointer"
    >
      {/* Hover Gradient Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-grad-main rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            ticket.status === 'new'
              ? 'bg-blue-50 text-blue-500'
              : ticket.status === 'triaged'
                ? 'bg-purple-50 text-purple-500'
                : ticket.status === 'awaiting_reply'
                  ? 'bg-amber-50 text-amber-500'
                  : ticket.status === 'replied' || ticket.status === 'auto_resolved'
                    ? 'bg-green-50 text-green-500'
                    : 'bg-slate-50 text-slate-400',
          )}
        >
          {ticket.status === 'new' && <AlertCircle size={20} />}
          {ticket.status === 'triaged' && <Bot size={20} />}
          {ticket.status === 'awaiting_reply' && <Bot size={20} />}
          {(ticket.status === 'replied' || ticket.status === 'auto_resolved') && (
            <CheckCircle size={20} />
          )}
          {ticket.status === 'closed' && <Clock size={20} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
          {/* Subject & Customer */}
          <div className="col-span-5">
            <h3 className="font-heading font-bold text-text-primary truncate">{ticket.subject}</h3>
            <p className="text-sm text-text-muted truncate">{ticket.customer}</p>
          </div>

          {/* Tags */}
          <div className="col-span-4 flex items-center gap-2">
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border',
                statusColors[ticket.status],
              )}
            >
              {ticket.status.toUpperCase()}
            </span>
            <span
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium border bg-white border-slate-200',
                priorityColors[ticket.priority],
              )}
            >
              {ticket.priority.toUpperCase()}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-white border-slate-200 text-text-muted">
              {ticket.category}
            </span>
          </div>

          {/* Assignee & AI Badge */}
          <div className="col-span-3 flex items-center justify-end gap-3">
            {ticket.isAiTriaged && (
              <div className="flex items-center gap-1 text-xs font-medium text-accent-primary bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                <Bot size={14} />
                <span>AI Triaged</span>
              </div>
            )}

            {ticket.assignee ? (
              <div className="flex items-center gap-2" title={ticket.assignee.name}>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border-2 border-white shadow-sm">
                  {ticket.assignee.name.charAt(0)}
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <User size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
