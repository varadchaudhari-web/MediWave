import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  light?: boolean;
}

export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MediWave Logo Icon"
    >
      <rect width="40" height="40" rx="10" fill="currentColor" fillOpacity="0.08" />
      {/* Medical Wave line */}
      <path
        d="M6 20C9.5 20 11.5 13 14.5 13C17.5 13 19 27 22 27C25 27 26.5 7 29.5 7C32.5 7 34 20 37 20"
        stroke="#0EA5E9"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse nodes */}
      <circle cx="29.5" cy="7" r="2.8" fill="#22C9A8" />
      <circle cx="14.5" cy="13" r="2.2" fill="#0369A1" />
    </svg>
  );
}

export default function Logo({ size = 32, showText = true, light = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} className={light ? 'text-white' : 'text-sky-600'} />
      {showText && (
        <span className={`font-bold font-sora tracking-tight text-xl ${light ? 'text-white' : 'text-[#0C2136]'}`}>
          Medi<span className="text-[#0EA5E9]">Wave</span>
        </span>
      )}
    </div>
  );
}
