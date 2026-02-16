import { useState, useEffect } from 'react';
import { ArrowLeft, User, Bot, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AiPanel } from '../components/tickets/AiPanel';
import api from '../lib/api';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface TicketDetailProps {
  _id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  category: string;
  customerEmail: string;
  customerName?: string;
  createdAt: string;
  replies: any[];
  aiAnalysis?: any;
  isAiTriaged?: boolean;
}

export function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<TicketDetailProps | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('low');
  const [editCategory, setEditCategory] = useState<string>('general');
  const [users, setUsers] = useState<any[]>([]);
  const [editAssignee, setEditAssignee] = useState<string>('');
  const [isSavingProps, setIsSavingProps] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const toast = useToast();

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      setEditPriority((res.data.priority || 'low') as any);
      setEditCategory(res.data.category || 'general');
      setEditAssignee(res.data.assigneeId?._id || '');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error(err);
      const msg = err.response?.data?.error || 'Failed to load ticket details';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.users || []);
      } catch (err: any) {
        // Non-admin users may not access /users
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  const handleReply = async (text?: string) => {
    const bodyToSend = typeof text === 'string' ? text : replyBody;
    if (!bodyToSend.trim()) return;

    try {
      setIsSending(true);
      await api.post(`/tickets/${id}/reply`, { body: bodyToSend });
      setReplyBody('');
      toast.success('Reply sent successfully');
      fetchTicket(); // Refresh to see new reply
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error(err);
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const saveProperties = async () => {
    if (!ticket) return;
    try {
      setIsSavingProps(true);
      const payload: any = { priority: editPriority, category: editCategory };
      if (editAssignee) payload.assigneeId = editAssignee;
      const res = await api.patch(`/tickets/${ticket._id}`, payload);
      setTicket(res.data);
      toast.success('Ticket updated');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      toast.error('Failed to update ticket');
    } finally {
      setIsSavingProps(false);
    }
  };

  if (isLoading && !ticket) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="glass-panel rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-5 w-3/4 bg-slate-100 rounded" />
          <div className="h-4 w-1/2 bg-slate-100 rounded" />
          <div className="h-32 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (loadError && !ticket) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center">
          <h2 className="text-lg font-heading font-bold text-text-primary mb-2">
            We couldn't load this ticket
          </h2>
          <p className="text-sm text-text-muted mb-4">{loadError}</p>
          <button
            type="button"
            onClick={fetchTicket}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-grad-main text-white text-sm font-medium shadow hover:shadow-md transition-shadow"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-8 text-center text-text-muted">Ticket not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Ticket Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Back Link */}
        <Link
          to="/tickets"
          className="inline-flex items-center text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to tickets
        </Link>

        {/* Header Card */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-heading font-bold text-text-primary leading-tight">
              {ticket.subject}
            </h1>
            <span className="shrink-0 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
              {ticket.status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-text-muted bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200">
              <User size={14} />
              {ticket.customerName || ticket.customerEmail}
            </div>
            <div className="text-sm text-text-muted">
              Opened {new Date(ticket.createdAt).toLocaleString()} · ID #{ticket._id.slice(-6)}
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-text-muted mb-1">Priority</div>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-text-muted mb-1">Category</div>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 capitalize"
              >
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="bug">Bug</option>
                <option value="feature_request">Feature request</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-text-muted mb-1">Assignee</div>
              <select
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={saveProperties} isLoading={isSavingProps}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* Message Card */}
        <div className="glass-panel rounded-2xl p-6 min-h-[200px]">
          <div className="prose prose-slate max-w-none text-text-primary whitespace-pre-line">
            {ticket.body}
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-heading font-bold text-text-primary">Discussion</h3>

          {ticket.replies.map((reply) => (
            <div key={reply._id} className="flex gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0 text-white',
                  reply.authorType === 'ai' ? 'bg-grad-main' : 'bg-slate-500',
                )}
              >
                {reply.authorType === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="glass-panel rounded-2xl rounded-tl-none p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">
                    {reply.authorId?.name ||
                      (reply.authorType === 'ai' ? 'OpsFlow Bot' : 'Unknown')}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-text-primary whitespace-pre-line">{reply.body}</p>
              </div>
            </div>
          ))}

          {/* Reply Input */}
          <div className="glass-panel rounded-2xl p-4 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <User size={20} />
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                className="w-full min-h-[100px] bg-transparent border-none focus:ring-0 text-text-primary placeholder:text-text-muted resize-none"
                placeholder="Write a reply..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleReply()}
                  isLoading={isSending}
                  disabled={!replyBody.trim()}
                >
                  Send Reply <Send size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <AiPanel
            ticketId={ticket._id}
            onAnalysisComplete={fetchTicket}
            onApproveReply={handleReply}
            analysis={ticket.aiAnalysis}
            isTriaged={!!ticket.isAiTriaged}
            customerEmail={ticket.customerEmail}
            currentPriority={ticket.priority as any}
          />
        </div>
      </div>
    </div>
  );
}
