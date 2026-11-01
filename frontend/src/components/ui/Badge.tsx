import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple_pill';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  if (variant === 'purple_pill') {
    return (
      <span className="inline-flex items-center rounded-md bg-purple-600 text-white font-mono font-extrabold text-xs px-2.5 py-1 shadow-sm">
        {children}
      </span>
    );
  }

  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200/80 font-bold',
    warning: 'bg-amber-100 text-amber-800 border-amber-200/80 font-bold',
    danger: 'bg-rose-100 text-rose-800 border-rose-200/80 font-bold',
    info: 'bg-indigo-100 text-indigo-800 border-indigo-200/80 font-bold',
    neutral: 'bg-purple-50 text-purple-800 border-purple-200 font-bold',
    purple_pill: 'bg-purple-600 text-white font-mono font-extrabold',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
