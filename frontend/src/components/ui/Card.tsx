import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  hoverable = false,
}) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 shadow-xl ${
        hoverable ? 'glass-card-hover' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 mb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
