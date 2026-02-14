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
  const toast = useToast();

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error(err);
      toast.error('Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

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

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading ticket...</div>;
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
          />
        </div>
      </div>
    </div>
  );
}
