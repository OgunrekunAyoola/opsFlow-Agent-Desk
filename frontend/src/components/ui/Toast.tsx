import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border ${bgColors[type]} animate-in slide-in-from-right-full transition-all duration-300 pointer-events-auto min-w-[300px] max-w-md`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <p className="text-sm font-medium text-text-primary flex-1 leading-tight">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="text-text-muted hover:text-text-primary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
