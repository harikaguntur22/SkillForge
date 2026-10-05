import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`w-full bg-slate-900/90 border rounded-xl py-2.5 text-sm text-slate-100 
            placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${
              error
                ? 'border-rose-500/80 focus:ring-rose-500/30 focus:border-rose-500'
                : 'border-slate-800 focus:ring-brand-500/30 focus:border-brand-500'
            }
            ${className}`}
          {...props}
        />
      </div>

      {error && <p className="text-xs text-rose-400 font-medium pl-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-slate-400 pl-1">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
