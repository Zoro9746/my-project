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
      className={`bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm ${
        hoverable ? 'hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-200' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 border-b border-indigo-50/80 mb-4">
          <div>
            {title && <h3 className="text-lg font-black text-indigo-950">{title}</h3>}
            {subtitle && <p className="text-xs font-semibold text-indigo-600/70 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
