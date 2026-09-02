import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An Error Occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-950/20 rounded-2xl border border-rose-500/30 my-4">
      <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 mb-3">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-rose-200 mb-1">{title}</h4>
      <p className="text-sm text-rose-300/80 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={<RefreshCw />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
