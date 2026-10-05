import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700/60',
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
