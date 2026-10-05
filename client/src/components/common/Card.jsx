import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`glass-card p-6 ${
        hoverEffect ? 'hover:border-slate-700/80 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
