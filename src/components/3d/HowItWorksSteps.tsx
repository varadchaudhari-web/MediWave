import React, { useEffect, useRef } from 'react';
import { Search, CalendarCheck, Video, HeartPulse } from 'lucide-react';
import { easeOutCubic } from '@/components/features/StatCounter';

interface StepData {
  number: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  badge: string;
}

const steps: StepData[] = [
  {
    number: '01',
    title: 'Find Your Specialist',
    desc: 'Search 15,000+ verified doctors by symptom, specialty, language, or hospital.',
    icon: Search,
    badge: 'Smart Discovery',
  },
  {
    number: '02',
    title: 'Instant Booking',
    desc: 'Choose a convenient time slot for video consultation or in-person clinic visit.',
    icon: CalendarCheck,
    badge: 'Real-time Slots',
  },
  {
    number: '03',
    title: 'Consult Seamlessly',
    desc: 'Join encrypted HD video consultation and discuss diagnosis with digital prescription.',
    icon: Video,
    badge: '100% Secure',
  },
  {
    number: '04',
    title: 'Follow-up & Medicines',
    desc: 'Get medicines delivered in 24 hours and track continuous health vitals.',
    icon: HeartPulse,
    badge: 'Complete Care',
  },
];

export default function HowItWorksSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        if (!container) return;

        if (isReduced) {
          cardRefs.current.forEach(card => {
            if (card) {
              card.style.transform = 'none';
              card.style.opacity = '1';
            }
          });
          return;
        }

        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight || 800;

        // Progress of section entering and moving through viewport: 0 when entering bottom, 1 when at center
        const totalTravel = windowHeight + rect.height;
        const currentPos = windowHeight - rect.top;
        const progress = Math.max(0, Math.min(1, currentPos / (totalTravel * 0.75)));

        const count = steps.length;
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const localRaw = Math.max(0, Math.min(1, progress * (count + 0.8) - index));
          const e = easeOutCubic(localRaw);

          const translateY = (1 - e) * 46;
          const translateZ = (e - 1) * 130;
          const rotateX = (1 - e) * 16;
          const opacity = 0.15 + e * 0.85;

          card.style.transform = `translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg)`;
          card.style.opacity = `${opacity}`;
        });
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
            Simple 4-Step Journey
          </p>
          <h2 className="section-heading">How MediWave Works</h2>
          <p className="section-subheading mx-auto">
            From discovering doctors to post-care prescriptions, access quality medical care in minutes.
          </p>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ perspective: '1100px' }}
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                ref={el => (cardRefs.current[idx] = el)}
                className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between relative group"
                style={{
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-extrabold font-sora text-slate-200 group-hover:text-sky-400 transition-colors">
                      {step.number}
                    </span>
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-100">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-400 text-white rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-sky-500/20 group-hover:scale-110 transition-transform">
                    <Icon size={26} strokeWidth={2} />
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg font-sora mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
                  Learn more →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
