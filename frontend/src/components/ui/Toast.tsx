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
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-purple-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-emerald-950 shadow-emerald-500/10',
    error: 'border-rose-200 bg-white text-rose-950 shadow-rose-500/10',
    warning: 'border-amber-200 bg-white text-amber-950 shadow-amber-500/10',
    info: 'border-purple-200 bg-white text-indigo-950 shadow-purple-500/10',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${borders[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-semibold leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-indigo-400 hover:text-indigo-950 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
