import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { specializations } from '@/data/doctors';

export default function SpecialtyRing3D() {
  const ringRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef(0);

  const n = specializations.length;
  // radius formula: 130 / tan(PI / n)
  const radius = Math.round(150 / Math.tan(Math.PI / n));

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
    <section className="py-24 bg-[#f4f9ff] relative overflow-hidden select-none border-t border-[#d9e8f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-14 text-left">
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

      {/* 3D Stage with perspective: 1250px and overflow: hidden */}
      <div
        className="w-full h-[320px] relative flex items-center justify-center overflow-hidden"
        style={{ perspective: '1250px' }}
      >
        <div
          ref={ringRef}
          className="relative w-[240px] h-[200px] touch-none cursor-grab"
          style={{
            transformStyle: 'preserve-3d',
            transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          {specializations.map((spec, i) => {
            const angle = (360 / n) * i;
            return (
              <Link
                key={spec.id}
                to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
                onClick={e => {
                  if (Math.abs(velocityRef.current) > 25) {
                    e.preventDefault();
                  }
                }}
                className="absolute inset-0 rounded-3xl bg-white border border-[#d9e8f7] shadow-[0_10px_30px_-5px_rgba(12,33,54,0.06)] p-7 flex flex-col items-center justify-center hover:border-sky-400 hover:shadow-sky-200/50 transition-all text-center group"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <h3 className="font-bold text-[#0c2136] text-xl font-sora mb-2 group-hover:text-[#0ea5e9] transition-colors">
                  {spec.name}
                </h3>
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
