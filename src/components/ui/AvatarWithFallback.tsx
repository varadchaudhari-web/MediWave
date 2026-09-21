import React, { useState } from 'react';

interface AvatarWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackName?: string;
  className?: string;
  fallbackClassName?: string;
}

export default function AvatarWithFallback({
  src,
  alt = 'Avatar',
  fallbackName,
  className = 'w-10 h-10 rounded-full object-cover',
  fallbackClassName = 'w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-semibold flex items-center justify-center text-xs border border-sky-200',
  ...props
}: AvatarWithFallbackProps) {
  const [hasError, setHasError] = useState(!src);

  const getInitials = (name?: string) => {
    if (!name) return 'MW';
    const parts = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (hasError || !src) {
    return (
      <div className={fallbackClassName} title={alt} aria-label={alt}>
        {getInitials(fallbackName || alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
    />
  );
}
