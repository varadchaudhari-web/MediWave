import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Brain, Bone, Sparkles, Baby, Activity,
  Stethoscope, Ribbon, Syringe, Eye, Wind, Ear,
  ScanLine, ArrowLeft, ArrowRight
} from 'lucide-react';
import { specializations } from '@/data/doctors';

const specialtyIcons: Record<string, React.ElementType> = {
  Cardiology: Heart,
  Neurology: Brain,
  Gynecology: Heart,
  Orthopedics: Bone,
  Dermatology: Sparkles,
  Pediatrics: Baby,
  Psychiatry: Activity,
  Gastroenterology: Stethoscope,
  Oncology: Ribbon,
  Endocrinology: Syringe,
  Ophthalmology: Eye,
  Pulmonology: Wind,
  ENT: Ear,
  'General Medicine': Stethoscope,
  Radiology: ScanLine,
};

export default function SpecialtyRing3D() {
  const ringRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);

  const n = specializations.length;
  // radius formula: 130 / tan(PI / n)
  const radius = Math.round(130 / Math.tan(Math.PI / n));

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    let animId: number;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const idleSpeed = 7; // deg per sec

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
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      velocityRef.current = 0;
      ring.style.cursor = 'grabbing';
      ring.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      // Sensitivity
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
        // Ignore if pointer capture was lost
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
    <section className="py-20 bg-gradient-to-b from-white via-sky-50/40 to-white relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
          3D Interactive Specializations
        </p>
        <h2 className="section-heading">Browse Medical Specialties</h2>
        <p className="section-subheading mx-auto">
          Explore India's leading medical departments in 3D. Drag or swipe the ring to view specialists.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 font-mono">
          <span>DRAG TO ROTATE RING</span> • <span>CLICK TO EXPLORE DOCTORS</span>
        </div>
      </div>

      {/* 3D Stage with perspective: 1250px and overflow: hidden */}
      <div
        className="w-full h-[360px] relative flex items-center justify-center overflow-hidden"
        style={{ perspective: '1250px' }}
      >
        <div
          ref={ringRef}
          className="relative w-[230px] h-[260px] touch-none cursor-grab"
          style={{
            transformStyle: 'preserve-3d',
            transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {specializations.map((spec, i) => {
            const Icon = specialtyIcons[spec.name] || Stethoscope;
            const angle = (360 / n) * i;
            return (
              <div
                key={spec.id}
                className="absolute inset-0 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg p-5 flex flex-col items-center justify-between hover:border-sky-400 hover:shadow-sky-200/60 transition-colors"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className={`w-14 h-14 ${spec.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  <Icon size={28} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 text-sm font-sora leading-tight">{spec.name}</h3>
                  <p className="text-xs text-sky-600 font-medium mt-1">{spec.count} Specialist Doctors</p>
                </div>
                <Link
                  to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
                  className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-700 text-xs font-semibold rounded-xl text-center transition-colors"
                  onClick={e => {
                    // Prevent navigation if user was dragging
                    if (Math.abs(velocityRef.current) > 30) {
                      e.preventDefault();
                    }
                  }}
                >
                  View Doctors →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
