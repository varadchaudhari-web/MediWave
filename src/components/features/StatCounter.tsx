import React, { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  finalValue: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  formatNumber?: boolean;
  className?: string;
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export default function StatCounter({
  finalValue,
  suffix = '',
  prefix = '',
  decimals = 0,
  formatNumber = false,
  className = '',
}: StatCounterProps) {
  // Never show 0 as resting state if offscreen; render finalValue by default
  const [displayValue, setDisplayValue] = useState<number>(finalValue);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || hasAnimatedRef.current) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(finalValue);
      hasAnimatedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.unobserve(el);

          const duration = 1400; // 1.4s total duration
          const startTime = performance.now();
          const startVal = 0;

          const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const currentVal = startVal + (finalValue - startVal) * easedProgress;

            if (progress < 1) {
              setDisplayValue(currentVal);
              requestAnimationFrame(step);
            } else {
              setDisplayValue(finalValue); // Snap to exact final value on last frame
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [finalValue]);

  const formattedNumber = () => {
    let valStr: string;
    if (decimals > 0) {
      valStr = displayValue.toFixed(decimals);
    } else {
      valStr = Math.round(displayValue).toString();
    }

    if (formatNumber) {
      const parts = valStr.split('.');
      parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
      valStr = parts.join('.');
    }
    return `${prefix}${valStr}${suffix}`;
  };

  return (
    <span ref={elementRef} className={className}>
      {formattedNumber()}
    </span>
  );
}
