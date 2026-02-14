import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Activity } from 'lucide-react';
import api from '../../lib/api';

interface WorkflowStep {
  stepType: string;
  inputSnapshot: any;
  outputSnapshot: any;
  createdAt: string;
}

interface WorkflowRun {
  _id: string;
  status: 'running' | 'succeeded' | 'failed';
  startedAt: string;
  steps: WorkflowStep[];
}

interface WorkflowHistoryProps {
  ticketId: string;
}

export function WorkflowHistory({ ticketId }: WorkflowHistoryProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/tickets/${ticketId}/workflows`);
        setRuns(res.data);
      } catch (err) {
        console.error('Failed to fetch workflow history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [ticketId]);

  if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading workflow history...</div>;

  if (runs.length === 0) return <div className="text-sm text-gray-400 italic text-center py-4">No AI workflows run yet.</div>;

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {runs.map((run) => (
        <div key={run._id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              <span className="font-semibold text-xs text-slate-700">AI Triage Run</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{new Date(run.startedAt).toLocaleString()}</span>
              {run.status === 'succeeded' ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <XCircle size={14} className="text-red-500" />
              )}
            </div>
          </div>
          
          <div className="space-y-3 pl-2 border-l border-slate-200 ml-1">
            {run.steps.map((step, idx) => (
              <div key={idx} className="relative pl-4">
                <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-slate-200 border-2 border-white"></div>
                <div className="text-xs font-medium text-slate-600 capitalize mb-1">{step.stepType.replace(/_/g, ' ')}</div>
                <div className="bg-white p-2 rounded border border-slate-100 font-mono text-[10px] text-slate-500 overflow-x-auto whitespace-pre-wrap">
                   {JSON.stringify(step.outputSnapshot, null, 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
