'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

function Toast({ id, type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgColors: Record<ToastType, string> = {
    success: 'border-emerald-400/40 bg-emerald-500/10',
    error: 'border-red-400/40 bg-red-500/10',
    info: 'border-sky-400/40 bg-sky-500/10',
  };

  const label = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info';

  return (
    <div
      className={`pointer-events-auto flex min-w-[280px] max-w-md items-start gap-3 rounded-xl border bg-slate-950/90 p-4 text-sm text-white shadow-lg backdrop-blur-sm ${bgColors[type]}`}
    >
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-[10px] font-semibold text-slate-50">
        {label[0]}
      </div>
      <p className="flex-1 leading-snug">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="px-1 text-xs text-white/60 transition-colors hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<ToastContextType>(
    () => ({
      toast: addToast,
      success: (msg: string) => addToast('success', msg),
      error: (msg: string) => addToast('error', msg),
      info: (msg: string) => addToast('info', msg),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} id={t.id} type={t.type} message={t.message} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
