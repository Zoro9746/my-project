import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-indigo-100 shadow-sm my-4">
      <div className="p-4 rounded-full bg-purple-50 text-purple-600 mb-3 border border-purple-100">
        {icon || <Inbox className="w-8 h-8 text-purple-600" />}
      </div>
      <h4 className="text-base font-bold text-indigo-950 mb-1">{title}</h4>
      <p className="text-sm text-indigo-600/80 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
