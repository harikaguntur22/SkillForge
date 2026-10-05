import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Lightbulb } from 'lucide-react';

export const PageHeader = ({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  breadcrumbs = [],
  actions,
  studentTip,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Breadcrumbs navigation */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="hover:text-brand-300 transition-colors focus:outline-none focus:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-300 font-medium" aria-current="page">
                  {crumb.label}
                </span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold">
              {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />}
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons Slot */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Student Onboarding / Quick Tip Banner */}
      {studentTip && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-brand-500/20 text-xs text-slate-300">
          <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-brand-300 mr-1.5">Tip for Students:</span>
            <span>{studentTip}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
