import React, { useEffect, useRef, useState } from 'react';

/**
 * Hand-written ECG heartbeat waveform normalized to period 0..1
 * Returns value in -1..1 range
 */
export function ecgBeat(p: number): number {
  // Normalize p to [0, 1)
  const t = ((p % 1) + 1) % 1;

  // Isoelectric baseline before P
  if (t < 0.15) {
    return 0;
  }
  // P wave: gentle small bump (at ~0.20)
  if (t >= 0.15 && t < 0.28) {
    const pt = (t - 0.15) / 0.13;
    return Math.sin(pt * Math.PI) * 0.18;
  }
  // PR segment
  if (t >= 0.28 && t < 0.38) {
    return 0;
  }
  // Q dip: slight negative dip
  if (t >= 0.38 && t < 0.42) {
    const qt = (t - 0.38) / 0.04;
    return -Math.sin(qt * Math.PI) * 0.14;
  }
  // R spike: tall sharp positive spike
  if (t >= 0.42 && t < 0.48) {
    const rt = (t - 0.42) / 0.06;
    return Math.sin(rt * Math.PI) * 1.0;
  }
  // S dip: sharp deep negative dip
  if (t >= 0.48 && t < 0.54) {
    const st = (t - 0.48) / 0.06;
    return -Math.sin(st * Math.PI) * 0.35;
  }
  // ST segment
  if (t >= 0.54 && t < 0.62) {
    return 0;
  }
  // T wave: medium smooth bump
  if (t >= 0.62 && t < 0.80) {
    const tt = (t - 0.62) / 0.18;
    return Math.sin(tt * Math.PI) * 0.32;
  }
  // U wave / isoelectric baseline until next beat
  return 0;
}

export interface LiveECGProps {
  className?: string;
  height?: number;
}

export default function LiveECG({ className = '', height = 70 }: LiveECGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCount, setActiveCount] = useState<number>(1248);

  // Drift counter realistically every ~2.6s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return Math.max(1235, Math.min(1265, next));
      });
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let canvasHeight = height;
    const PERIOD = 170; // px
    const BEATS_PER_SEC = 0.72;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(rect.width, 200);
      canvasHeight = height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) {
      ro.observe(canvas.parentElement);
    }

    let startTime = performance.now();

    const render = (time: number) => {
      if (!ctx || width === 0) return;

      const elapsed = isReducedMotion ? 0 : (time - startTime) / 1000;
      const phaseOffset = elapsed * BEATS_PER_SEC * PERIOD;

      ctx.clearRect(0, 0, width, canvasHeight);

      const midY = canvasHeight * 0.52;
      const amp = canvasHeight * 0.38;

      // 1. Draw faint baseline grid line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      // 2. Draw full continuous waveform
      ctx.beginPath();
      const numPoints = Math.ceil(width);
      for (let x = 0; x <= numPoints; x++) {
        // x represents coordinate, phase flows left to right
        const samplePos = (x + phaseOffset) / PERIOD;
        const val = ecgBeat(samplePos);
        const y = midY - val * amp;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Stroke gradient: --blue (25% alpha) -> --blue (85%) -> --mint (#22c9a8)
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, 'rgba(14, 165, 233, 0.25)');
      grad.addColorStop(0.65, 'rgba(14, 165, 233, 0.85)');
      grad.addColorStop(1, '#22c9a8');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // 3. Leading dot with glowing halo at the right edge
      const leadingVal = ecgBeat((width + phaseOffset) / PERIOD);
      const leadingY = midY - leadingVal * amp;

      // Glow halo
      const glow = ctx.createRadialGradient(width - 2, leadingY, 1, width - 2, leadingY, 9);
      glow.addColorStop(0, 'rgba(34, 201, 168, 0.9)');
      glow.addColorStop(0.5, 'rgba(34, 201, 168, 0.35)');
      glow.addColorStop(1, 'rgba(34, 201, 168, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(width - 2, leadingY, 9, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width - 2, leadingY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#22c9a8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (!isReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [height]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold text-sm">Live Consultations</span>
        </div>
        <span className="text-sky-300 font-medium text-xs font-mono">
          <span className="text-emerald-400 font-bold">{activeCount.toLocaleString()}</span> ongoing right now
        </span>
      </div>
      <div className="w-full relative overflow-hidden rounded-xl bg-sky-950/40 p-1 border border-white/10">
        <canvas ref={canvasRef} className="block w-full" />
      </div>
    </div>
  );
}
