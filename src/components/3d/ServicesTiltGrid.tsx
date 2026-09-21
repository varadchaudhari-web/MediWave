import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, Calendar, FlaskConical, Pill, Bot, Ambulance
} from 'lucide-react';

interface ServiceItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
}

const servicesData: ServiceItem[] = [
  {
    icon: Video,
    title: 'Telemedicine',
    desc: 'Video consults with top doctors from home',
    href: '/telemedicine',
  },
  {
    icon: Calendar,
    title: 'Book Appointment',
    desc: 'Schedule in-person visits at top hospitals',
    href: '/appointments',
  },
  {
    icon: FlaskConical,
    title: 'Lab Tests',
    desc: '500+ tests with home sample collection',
    href: '/labs',
  },
  {
    icon: Pill,
    title: 'Order Medicines',
    desc: 'Genuine medicines delivered in 24 hours',
    href: '/medicines',
  },
  {
    icon: Bot,
    title: 'AI Symptom Check',
    desc: 'Smart health guidance powered by AI',
    href: '/telemedicine',
  },
  {
    icon: Ambulance,
    title: 'Emergency SOS',
    desc: '24/7 ambulance with real-time tracking',
    href: '/emergency',
  },
];

function TiltCard({ item }: { item: ServiceItem }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const Icon = item.icon;

  const handlePointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    // Disable on touch devices
    if (e.pointerType === 'touch') return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    // Calculate rotation and translation
    const rotY = (px - 0.5) * 11;
    const rotX = (0.5 - py) * 11;

    card.style.transition = 'none';
    card.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(14px)`;

    // Cursor-following glow via CSS variables
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    // Reset with 0.5s cubic-bezier(0.16, 1, 0.3, 1) transition
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';

    // Clear inline transition after duration
    setTimeout(() => {
      if (card) {
        card.style.transition = '';
      }
    }, 500);
  };

  return (
    <Link
      ref={cardRef}
      to={item.href}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative bg-white rounded-3xl p-8 border border-[#d9e8f7] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.12)] hover:border-sky-300 transition-shadow duration-300 overflow-hidden block"
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Radial cursor-following glow pseudo element */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: 'radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(14, 165, 233, 0.09), transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Floating icon tile at translateZ(34px) */}
      <div
        className="w-13 h-13 p-3.5 bg-[#f0f9ff] border border-sky-100 rounded-2xl inline-flex items-center justify-center text-[#0ea5e9] group-hover:scale-105 group-hover:bg-[#e0f2fe] transition-all shadow-sm mb-5"
        style={{
          transform: 'translateZ(34px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <Icon size={24} strokeWidth={1.8} className="text-[#0ea5e9]" />
      </div>

      {/* Floating title at translateZ(20px) */}
      <h3
        className="font-bold text-[#0c2136] text-xl mb-2 font-sora group-hover:text-[#0ea5e9] transition-colors"
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {item.title}
      </h3>

      <p className="text-[#5b7392] text-sm leading-relaxed">
        {item.desc}
      </p>
    </Link>
  );
}

export default function ServicesTiltGrid() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-left md:text-left mb-14">
          <p className="text-[#0ea5e9] font-bold text-xs uppercase tracking-widest mb-2.5">
            EVERYTHING HEALTHCARE
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0c2136] font-sora tracking-tight">
            Our Services
          </h2>
          <p className="text-[#5b7392] text-base mt-2">
            Every card lifts in 3D — icon floats forward, card tilts toward cursor.
          </p>
        </div>

        {/* 3x2 Grid with perspective: 1000px */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
          style={{ perspective: '1000px' }}
        >
          {servicesData.map(service => (
            <TiltCard key={service.title} item={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
