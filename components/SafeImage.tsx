'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LucideIcon, Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackIcon?: LucideIcon;
  fallbackLabel?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallbackIcon: FallbackIcon = ImageIcon,
  fallbackLabel,
  priority = false,
  style,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-amber-50 border border-amber-200/60 rounded-2xl flex flex-col items-center justify-center p-3 text-center transition-all ${
          fill ? 'absolute inset-0 w-full h-full' : 'w-full h-full min-h-[90px]'
        } ${className}`}
        style={width && height && !fill ? { aspectRatio: `${width} / ${height}`, ...style } : style}
        aria-label={alt}
      >
        <FallbackIcon className="w-7 h-7 text-[#EA580C] mb-1.5 shrink-0" />
        <span className="text-[11px] font-semibold text-neutral-800 leading-snug line-clamp-2">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        unoptimized
        onError={() => setHasError(true)}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 200}
      height={height ?? 200}
      priority={priority}
      unoptimized
      onError={() => setHasError(true)}
      className={className}
      style={style}
    />
  );
}
