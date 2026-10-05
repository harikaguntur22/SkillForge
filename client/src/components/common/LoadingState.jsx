import React from 'react';

export const LoadingState = ({
  message = 'Loading data...',
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`} aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
        <div className="space-y-2 flex-1 max-w-sm">
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-800/60 rounded w-full" />
            <div className="h-3 bg-slate-800/40 rounded w-4/5" />
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-slate-800 rounded-full" />
              <div className="h-6 w-16 bg-slate-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingState;
