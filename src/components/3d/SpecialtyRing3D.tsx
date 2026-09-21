import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  Brain,
  Users,
  Bone,
  Sparkles,
  Baby,
  Smile,
  Flame,
  Activity,
  Dna,
  Eye,
  Wind,
  LucideIcon,
} from 'lucide-react';
import { specializations } from '@/data/doctors';

const specialtyIconMap: Record<
  string,
  { icon: LucideIcon; color: string; bg: string; border: string }
> = {
  Cardiology: {
    icon: HeartPulse,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  Neurology: {
    icon: Brain,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  Gynecology: {
    icon: Users,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
  },
  Orthopedics: {
    icon: Bone,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  Dermatology: {
    icon: Sparkles,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  Pediatrics: {
    icon: Baby,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  Psychiatry: {
    icon: Smile,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  Gastroenterology: {
    icon: Flame,
    color: 'text-teal-500',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  Oncology: {
    icon: Activity,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  Endocrinology: {
    icon: Dna,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  Ophthalmology: {
    icon: Eye,
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
  },
  Pulmonology: {
    icon: Wind,
    color: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

export default function SpecialtyRing3D() {
  const ringRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);

  const n = specializations.length;
  // radius formula: 125 / tan(PI / n) ~ 466px
  const radius = Math.round(125 / Math.tan(Math.PI / n));

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    let animId: number;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const idleSpeed = 6; // deg per sec

    const update = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (!isDraggingRef.current && !isReduced) {
        // Ease velocity towards idle speed
        velocityRef.current += (idleSpeed - velocityRef.current) * 0.04;
        currentAngleRef.current += velocityRef.current * dt;
      }

      ring.style.transform = `rotateY(${-currentAngleRef.current}deg)`;

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
      velocityRef.current = 0;
      ring.style.cursor = 'grabbing';
      ring.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      currentAngleRef.current -= deltaX * 0.35;
      velocityRef.current = -deltaX * 15;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      ring.style.cursor = 'grab';
      try {
        ring.releasePointerCapture?.(e.pointerId);
      } catch {
        // Ignore if pointer capture lost
      }
    };

    ring.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      ring.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [n]);

  return (
    <section className="pt-24 pb-32 bg-[#f4f9ff] relative overflow-hidden select-none border-t border-[#d9e8f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 text-left">
        <p className="text-[#0ea5e9] font-bold text-xs uppercase tracking-widest mb-2.5">
          BROWSE BY SPECIALITY
        </p>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0c2136] font-sora tracking-tight">
          Medical Specializations
        </h2>
        <p className="text-[#5b7392] text-base mt-2">
          3D carousel — auto-rotates, drag to rotate.
        </p>
      </div>

      {/* 3D Stage with proper vertical clearance and perspective */}
      <div
        className="w-full h-[360px] relative flex items-center justify-center my-4 overflow-visible"
        style={{ perspective: '1300px' }}
      >
        <div
          ref={ringRef}
          className="relative w-[210px] h-[210px] touch-none cursor-grab"
          style={{
            transformStyle: 'preserve-3d',
            transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {specializations.map((spec, i) => {
            const angle = (360 / n) * i;
            const iconConfig = specialtyIconMap[spec.name] || {
              icon: HeartPulse,
              color: 'text-sky-500',
              bg: 'bg-sky-50',
              border: 'border-sky-100',
            };
            const Icon = iconConfig.icon;

            return (
              <Link
                key={spec.id}
                to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
                onClick={e => {
                  if (Math.abs(velocityRef.current) > 25) {
                    e.preventDefault();
                  }
                }}
                className="absolute inset-0 rounded-3xl bg-white border border-[#d9e8f7] shadow-[0_10px_30px_-5px_rgba(12,33,54,0.08)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.18)] p-5 flex flex-col items-center justify-center hover:border-sky-400 transition-all text-center group"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Floating Icon Badge with dynamic theme color */}
                <div
                  className={`w-13 h-13 p-3.5 ${iconConfig.bg} ${iconConfig.border} border rounded-2xl flex items-center justify-center ${iconConfig.color} group-hover:scale-110 transition-transform duration-300 shadow-sm mb-3.5`}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>

                {/* Specialization Name */}
                <h3 className="font-bold text-[#0c2136] text-lg font-sora mb-1 group-hover:text-[#0ea5e9] transition-colors leading-tight">
                  {spec.name}
                </h3>

                {/* Doctor Count */}
                <p className="text-xs text-[#5b7392] font-medium">
                  {spec.count * 5 + 40} doctors
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

