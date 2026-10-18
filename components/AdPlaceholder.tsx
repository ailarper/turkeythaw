import React from 'react';

interface AdPlaceholderProps {
  variant: 'banner' | 'rectangle';
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ variant, className = '' }) => {
  const minHeightClass = variant === 'banner' ? 'min-h-[90px]' : 'min-h-[250px]';

  return (
    <aside
      aria-label="Advertisement slot"
      className={`w-full ${minHeightClass} flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-100/70 p-4 text-center transition-colors ${className}`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-stone-600">
        Advertisement
      </span>
      <div className="mt-2 flex items-center justify-center gap-2 text-stone-600">
        <span className="text-xs">Reserved Display Space ({variant === 'banner' ? '728x90 Leaderboard' : '300x250 Medium Rectangle'})</span>
      </div>
    </aside>
  );
};
