import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import { Badge } from './Badge';
import { ArrowRight } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg = 'bg-brand-500/10 border-brand-500/20 text-brand-400',
  badgeText,
  badgeVariant = 'brand',
  actionLabel,
  actionTo,
  onClick,
  className = '',
}) => {
  const content = (
    <Card className={`p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-700/80 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80 mt-1">
        {subtext && <span className="text-slate-400 truncate">{subtext}</span>}
        {badgeText && <Badge variant={badgeVariant} size="xs">{badgeText}</Badge>}
        {actionLabel && (
          <span className="inline-flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300 ml-auto transition-colors">
            {actionLabel}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </Card>
  );

  if (actionTo) {
    return (
      <Link to={actionTo} className="block group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-2xl">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left w-full focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-2xl">
        {content}
      </button>
    );
  }

  return content;
};

export default StatCard;
