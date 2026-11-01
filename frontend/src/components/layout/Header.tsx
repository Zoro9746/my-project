import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-indigo-100 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm font-medium text-indigo-600/80 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
