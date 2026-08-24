import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-4), { id, type, title, description, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, description?: string) => showToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => showToast({ type: 'error', title, description }),
    info: (title: string, description?: string) => showToast({ type: 'info', title, description }),
    warning: (title: string, description?: string) => showToast({ type: 'warning', title, description }),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end px-4 py-6 sm:p-6 gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 animate-in slide-in-from-top-2 sm:slide-in-from-right-5 fade-in-50',
              t.type === 'success' && 'bg-emerald-950/90 text-emerald-100 border-emerald-800 dark:bg-emerald-950 dark:border-emerald-800',
              t.type === 'error' && 'bg-rose-950/90 text-rose-100 border-rose-800 dark:bg-rose-950 dark:border-rose-800',
              t.type === 'info' && 'bg-slate-900/95 text-slate-100 border-slate-700 dark:bg-slate-900 dark:border-slate-800',
              t.type === 'warning' && 'bg-amber-950/90 text-amber-100 border-amber-800 dark:bg-amber-950 dark:border-amber-800'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <p className="font-semibold text-sm leading-tight">{t.title}</p>
              {t.description && <p className="mt-1 opacity-90 leading-normal">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="inline-flex shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
