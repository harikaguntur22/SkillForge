import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const FeedbackAlert = ({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  title,
  message,
  onDismiss,
  className = '',
}) => {
  if (!message && !title) return null;

  const configs = {
    success: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-300',
    },
    error: {
      bg: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
      titleColor: 'text-rose-300',
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-300',
    },
    info: {
      bg: 'bg-brand-950/40 border-brand-500/30 text-brand-200',
      icon: Info,
      iconColor: 'text-brand-400',
      titleColor: 'text-brand-300',
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md ${config.bg} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} aria-hidden="true" />
        <div className="text-xs sm:text-sm">
          {title && <p className={`font-bold ${config.titleColor} mb-0.5`}>{title}</p>}
          <p className="leading-relaxed">{message}</p>
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default FeedbackAlert;
