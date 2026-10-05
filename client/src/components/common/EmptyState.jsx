import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  actionTo,
  secondaryAction,
  compact = false,
  className = '',
}) => {
  return (
    <div
      className={`glass-card text-center flex flex-col items-center justify-center border-dashed border-slate-800/80 ${
        compact ? 'p-6 sm:p-8' : 'p-8 sm:p-12'
      } ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500/10 to-indigo-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 shadow-inner">
          <Icon className="w-7 h-7" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-6">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && (onAction || actionTo) && (
          <Button
            variant="primary"
            size="sm"
            icon={ActionIcon}
            onClick={onAction}
            to={actionTo}
          >
            {actionLabel}
          </Button>
        )}

        {secondaryAction && secondaryAction}
      </div>
    </div>
  );
};

export default EmptyState;
