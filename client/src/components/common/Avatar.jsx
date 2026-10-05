import React, { useState } from 'react';

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fallbackUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    name
  )}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-slate-800 border border-slate-700 font-semibold text-brand-300 shrink-0 ${sizes[size]} ${className}`}
    >
      {!imageError && (src || fallbackUrl) ? (
        <img
          src={src || fallbackUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
