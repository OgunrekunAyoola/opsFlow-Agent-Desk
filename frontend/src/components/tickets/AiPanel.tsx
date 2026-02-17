import { useState, useEffect } from 'react';
import { Bot, Sparkles, Tag, AlertTriangle, Check, History } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { WorkflowHistory } from './WorkflowHistory';

interface AiPanelProps {
  ticketId: string;
  onAnalysisComplete: () => void;
  onApproveReply: (text: string) => Promise<void>;
  analysis?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    priorityScore?: number;
    suggestedCategory?: string;
    summary?: string;
    suggestedReply?: string;
  };
  aiDraft?: {
    body?: string;
    confidence?: number;
  };
  isTriaged: boolean;
  customerEmail?: string;
  currentPriority?: 'low' | 'medium' | 'high' | 'urgent';
}

export function AiPanel({
  ticketId,
  onAnalysisComplete,
  onApproveReply,
  analysis,
  aiDraft,
  isTriaged,
  customerEmail,
  currentPriority,
}: AiPanelProps) {
  const [status, setStatus] = useState<'initial' | 'loading' | 'completed' | 'failed'>('initial');
  const [isApproving, setIsApproving] = useState(false);
  const [view, setView] = useState<'copilot' | 'history'>('copilot');
  const toast = useToast();

  useEffect(() => {
    if (isTriaged && analysis) {
      setStatus('completed');
    } else {
      setStatus('initial');
    }
  }, [isTriaged, analysis]);

  const runTriage = async () => {
    setStatus('loading');
    try {
      await api.post(`/tickets/${ticketId}/workflows/triage`);
      onAnalysisComplete();
      toast.success('AI analysis completed');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.error(err);
      setStatus('failed');
      toast.error('AI triage failed. Please try again.');
    }
  };

  const handleApprove = async () => {
    if (!analysis?.suggestedReply) return;
    try {
      setIsApproving(true);
      await onApproveReply(analysis.suggestedReply);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-0 overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-grad-main flex items-center justify-center text-white shadow-md relative">
            <Bot size={18} />
            {status === 'loading' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            )}
          </div>
          <h3 className="font-heading font-bold text-text-primary">AI Copilot</h3>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setView('copilot')}
            className={cn(
              'p-1.5 rounded-md transition-all',
              view === 'copilot'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-500 hover:text-slate-700',
            )}
            title="Copilot View"
          >
            <Bot size={16} />
          </button>
          <button
            onClick={() => setView('history')}
            className={cn(
              'p-1.5 rounded-md transition-all',
              view === 'history'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-slate-500 hover:text-slate-700',
            )}
            title="Workflow History"
          >
            <History size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {view === 'history' ? (
          <WorkflowHistory ticketId={ticketId} />
        ) : (
          <>
            {/* Initial State */}
            {status === 'initial' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto flex items-center justify-center text-blue-200 mb-4">
                  <Bot size={48} />
                </div>
                <h4 className="font-bold text-text-primary">Ready to help!</h4>
                <p className="text-sm text-text-muted">
                  I can read this ticket, categorize it, and draft a reply for you.
                </p>
                <Button onClick={runTriage} className="w-full">
                  <Sparkles size={16} className="mr-2" /> Run AI Triage
                </Button>
              </div>
            )}

            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center py-12 space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                  <Bot size={32} className="text-slate-400 animate-bounce" />
                </div>
                <p className="text-sm text-text-muted font-medium">Reading ticket context...</p>
                <div className="space-y-2 max-w-[200px] mx-auto">
                  <div className="h-2 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-3/4 mx-auto" />
                </div>
              </div>
            )}

            {/* Failed State */}
            {status === 'failed' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-24 h-24 bg-red-50 rounded-full mx-auto flex items-center justify-center text-red-300 mb-4">
                  <AlertTriangle size={48} />
                </div>
                <h4 className="font-bold text-text-primary">AI triage failed</h4>
                <p className="text-sm text-text-muted">
                  The AI couldn’t process this ticket. You can retry or reply manually.
                </p>
                <Button onClick={runTriage} className="w-full">
                  <Sparkles size={16} className="mr-2" /> Retry AI Triage
                </Button>
              </div>
            )}

            {/* Completed State */}
            {status === 'completed' && analysis && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                {/* Classification Card */}
                <div className="bg-white/60 rounded-xl p-3 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <Tag size={12} /> Category
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary capitalize">
                      {analysis.suggestedCategory?.replace('_', ' ')}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      AI Suggested
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2 border-t border-slate-100 pt-2">
                    {analysis.summary}
                  </p>
                </div>

                {/* Priority Card */}
                <div className="bg-white/60 rounded-xl p-3 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <AlertTriangle size={12} /> Priority
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-bold',
                        currentPriority === 'urgent'
                          ? 'text-red-600'
                          : currentPriority === 'high'
                            ? 'text-red-500'
                            : currentPriority === 'medium'
                              ? 'text-orange-500'
                              : 'text-green-500',
                      )}
                    >
                      {(currentPriority || 'low').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Suggested Reply + Confidence */}
                <div className="bg-white/60 rounded-xl p-3 border border-slate-100 shadow-sm ring-1 ring-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-wider">
                      <Bot size={12} /> Draft Reply
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      {typeof aiDraft?.confidence === 'number' && (
                        <>
                          <span className="text-text-muted">Confidence</span>
                          <span className="font-semibold text-text-primary">
                            {Math.round(aiDraft.confidence * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {typeof aiDraft?.confidence === 'number' && (
                    <div className="mb-3 space-y-1">
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            aiDraft.confidence > 0.8
                              ? 'bg-emerald-500'
                              : aiDraft.confidence >= 0.6
                                ? 'bg-amber-400'
                                : 'bg-red-500',
                          )}
                          style={{
                            width: `${Math.min(Math.max(aiDraft.confidence * 100, 0), 100)}%`,
                          }}
                        />
                      </div>
                      {aiDraft.confidence < 0.7 && (
                        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Low confidence - review recommended
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-text-primary bg-white p-2 rounded border border-slate-100 whitespace-pre-line max-h-40 overflow-y-auto">
                    {analysis.suggestedReply}
                  </p>
                  <p className="text-[11px] text-text-muted mt-2">
                    Review before sending. AI replies may contain inaccuracies. This will email{' '}
                    <span className="font-medium text-text-primary">
                      {customerEmail || 'the customer'}
                    </span>
                    .
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleApprove}
                      isLoading={isApproving}
                      disabled={
                        typeof aiDraft?.confidence === 'number' && aiDraft.confidence <= 0.8
                      }
                    >
                      <Check size={14} className="mr-2" /> Send as-is
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        if (analysis?.suggestedReply) {
                          onApproveReply(analysis.suggestedReply);
                        }
                      }}
                    >
                      Edit and send
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={onAnalysisComplete}
                    >
                      Discard draft
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
