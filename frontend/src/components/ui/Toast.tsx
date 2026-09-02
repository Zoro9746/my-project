import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-slate-900/90 text-emerald-100',
    error: 'border-rose-500/40 bg-slate-900/90 text-rose-100',
    warning: 'border-amber-500/40 bg-slate-900/90 text-amber-100',
    info: 'border-sky-500/40 bg-slate-900/90 text-sky-100',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border glass-panel shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${borders[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
