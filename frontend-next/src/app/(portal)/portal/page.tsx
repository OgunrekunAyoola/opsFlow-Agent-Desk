'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Textarea } from '../../../components/ui/Textarea';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Loader2, ArrowRight, Clock, Star, MessageSquare, Send, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function PortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    }>
      <PortalInner />
    </Suspense>
  );
}

function PortalInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ ticket: any; replies: any[] } | null>(null);
  
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [submittingCsat, setSubmittingCsat] = useState(false);
  const [csatDone, setCsatDone] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  async function loadData() {
    if (!token) {
      setError('No token provided.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/portal/${token}`);
      if (!res.ok) throw new Error('Failed to load ticket');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('Could not load ticket. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  const handleReply = async () => {
    if (!replyText.trim() || !token) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/portal/${token}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyText })
      });
      if (!res.ok) throw new Error('Reply failed');
      
      setReplyText('');
      toast.success('Reply sent successfully');
      await loadData(); // Reload to get the new reply and open status
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleCsat = async (score: number) => {
    if (!token) return;
    setRating(score);
    setSubmittingCsat(true);
    try {
      const res = await fetch(`${API_BASE}/csat/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: score })
      });
      if (res.ok) {
        setCsatDone(true);
        toast.success('Thank you for your feedback!');
      } else {
        toast.error('Failed to submit rating');
        setRating(null);
      }
    } catch {
      toast.error('Failed to submit rating');
      setRating(null);
    } finally {
      setSubmittingCsat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 space-y-4">
        <Skeleton className="h-12 w-3/4 max-w-lg mb-8" />
        <Skeleton className="h-64 w-full max-w-3xl" />
        <Skeleton className="h-32 w-full max-w-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-4 shadow-xl">
          <div className="mx-auto h-12 w-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Access Denied</h1>
          <p className="text-slate-400">{error || 'Unable to access portal'}</p>
        </div>
      </div>
    );
  }

  const { ticket, replies } = data;
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved' || ticket.status === 'auto_resolved';

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    triaged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    awaiting_reply: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    waiting_on_customer: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    open: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    auto_resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {ticket.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Created {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  Ticket #{ticket._id.slice(-6)}
                </span>
              </div>
            </div>
            
            <Badge className={`px-3 py-1 text-sm capitalize whitespace-nowrap ${statusColors[ticket.status] || 'bg-slate-800'}`}>
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* CSAT Widget for closed tickets */}
        {isClosed && !csatDone && (
          <Card className="border-emerald-500/30 bg-emerald-950/10 shadow-lg shadow-emerald-500/5 overflow-hidden animate-in slide-in-from-top-4">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-300">How did we do?</h3>
                <p className="text-sm text-emerald-500/70">Rate your experience to help us improve.</p>
              </div>
              <div className="flex justify-center gap-2 sm:gap-4 pt-2">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    onClick={() => handleCsat(score)}
                    disabled={submittingCsat}
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all border-2
                      ${rating === score ? 'bg-emerald-500 border-emerald-500 text-slate-900 scale-110 shadow-lg shadow-emerald-500/50' : 
                        'bg-slate-900 border-slate-700 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400 hover:scale-105'
                      }
                      ${submittingCsat && rating !== score ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {score === 1 ? '1' : score === 2 ? '2' : score === 3 ? '3' : score === 4 ? '4' : '5'}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isClosed && csatDone && (
          <Card className="border-emerald-500/20 bg-emerald-950/20">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Thank you for your feedback!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:bg-slate-800 before:w-0.5 before:h-full">
          {/* Initial Ticket Body is typically the first message, but portal groups it in replies if it exists, 
              if not we can just show the replies list. In our schema, the initial body is just ticket.body. We'll show it first. */}
          
          <div className="relative pl-14">
            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-950 text-slate-300">
               <User className="h-5 w-5" />
            </div>
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
              <CardHeader className="py-3 px-5 border-b border-slate-800/50 bg-slate-900/30 flex flex-row items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-200">You</span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </CardHeader>
              <CardContent className="py-4 px-5">
                <div className="whitespace-pre-line text-sm text-slate-300 leading-relaxed">
                  {ticket.body}
                </div>
              </CardContent>
            </Card>
          </div>

          {replies.map((reply: any) => {
             const isAi = reply.authorType === 'ai';
             const isCustomer = reply.authorType === 'customer' || typeof reply.authorName === 'undefined' && reply.authorType !== 'human';
             // "human" in our system is usually agent. customer reply comes in via email mapped to agent/ai or handleCustomerReply which creates it as customer.
             const isAgent = !isAi && reply.authorType === 'human';

             return (
               <div key={reply._id} className="relative pl-14 group">
                 <div className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 z-10 transition-colors
                   ${isAi ? 'bg-purple-900/50 text-purple-400' : 
                     isAgent ? 'bg-blue-900/50 text-blue-400' : 
                     'bg-slate-800 text-slate-300'
                   }
                 `}>
                   {isAi ? <Sparkles className="h-5 w-5" /> : 
                    isAgent ? <MessageSquare className="h-5 w-5" /> : 
                    <User className="h-5 w-5" />}
                 </div>
                 <Card className={`backdrop-blur-sm transition-colors
                   ${isAi ? 'bg-purple-950/10 border-purple-500/20 hover:border-purple-500/30' : 
                     isAgent ? 'bg-blue-950/10 border-blue-500/20 hover:border-blue-500/30' : 
                     'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                   }
                 `}>
                   <CardHeader className={`py-3 px-5 border-b flex flex-row items-center justify-between space-y-0
                     ${isAi ? 'border-purple-500/10 bg-purple-900/5' : 
                       isAgent ? 'border-blue-500/10 bg-blue-900/5' : 
                       'border-slate-800/50 bg-slate-900/30'
                     }
                   `}>
                     <div className="flex items-center gap-2">
                       <span className={`text-sm font-semibold
                         ${isAi ? 'text-purple-300' : 
                           isAgent ? 'text-blue-300' : 
                           'text-slate-200'
                         }
                       `}>
                         {isAi ? 'Support AI' : isAgent ? (reply.authorName || 'Support Team') : 'You'}
                       </span>
                     </div>
                     <span className="text-xs text-slate-500 font-medium">
                       {new Date(reply.createdAt).toLocaleString()}
                     </span>
                   </CardHeader>
                   <CardContent className="py-4 px-5">
                     <div className="whitespace-pre-line text-sm text-slate-300 leading-relaxed">
                       {reply.body}
                     </div>
                   </CardContent>
                 </Card>
               </div>
             );
          })}

          {/* Reply Form */}
          <div className="relative pl-14 pt-4">
             <div className="absolute left-0 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 border-2 border-slate-950 text-white z-10">
               <Send className="h-4 w-4 -ml-0.5" />
             </div>
             <Card className="bg-slate-900 border-slate-700 shadow-xl shadow-slate-950">
               <CardContent className="p-4 space-y-3">
                  <Textarea 
                    placeholder="Reply to this ticket..."
                    value={replyText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                    className="min-h-[120px] resize-y bg-slate-950/50 border-slate-800 focus:border-cyan-500/50"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isClosed ? 'Replying will reopen this ticket.' : ''}
                    </span>
                    <Button 
                      onClick={handleReply} 
                      disabled={!replyText.trim() || sending}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                      {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Send Reply
                    </Button>
                  </div>
               </CardContent>
             </Card>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-slate-600">
            Powered by <span className="font-semibold text-slate-500">OpsFlow AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}
