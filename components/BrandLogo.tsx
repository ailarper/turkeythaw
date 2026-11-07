import { Sparkles } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export function BrandLogo({ className = '', theme = 'light' }: BrandLogoProps) {
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#111111]';

  return (
    <a
      href="#top"
      className={`inline-flex select-none items-center gap-2.5 no-underline ${className}`}
      aria-label="TurkeyThaw home"
    >
      {/* Cloche + four-point star mark */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[30px] w-[30px] shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M16 2.5L16.7 5.5C17 6.6 17.9 7.5 19 7.8L22 8.5L19 9.2C17.9 9.5 17 10.4 16.7 11.5L16 14.5L15.3 11.5C15 10.4 14.1 9.5 13 9.2L10 8.5L13 7.8C14.1 7.5 15 6.6 15.3 5.5L16 2.5Z"
          fill="#EA580C"
        />
        <path
          d="M6.5 21.5C6.5 15.1487 10.7533 10 16 10C21.2467 10 25.5 15.1487 25.5 21.5H6.5Z"
          fill="#EA580C"
        />
        <rect x="4" y="22.5" width="24" height="2.5" rx="1.25" fill="#EA580C" />
      </svg>

      <span className={`text-[18px] font-bold leading-none tracking-[-0.03em] ${textColor}`}>
        Turkey<span className="font-extrabold">Thaw</span>
      </span>
      <Sparkles className="hidden h-3 w-3 text-[#EA580C] sm:block" aria-hidden="true" />
    </a>
  );
}
