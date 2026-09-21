import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, Calendar, FlaskConical, Pill, Activity,
  Ambulance, Shield, Stethoscope
} from 'lucide-react';

interface ServiceItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  badge?: string;
}

const servicesData: ServiceItem[] = [
  {
    icon: Video,
    title: 'Telemedicine',
    desc: 'Video consults with top doctors from home',
    href: '/telemedicine',
    badge: 'Instant',
  },
  {
    icon: Calendar,
    title: 'Book Appointment',
    desc: 'Schedule in-person visits at top hospitals',
    href: '/appointments',
    badge: 'Verified',
  },
  {
    icon: FlaskConical,
    title: 'Lab Tests',
    desc: '500+ tests with home sample collection',
    href: '/labs',
    badge: 'Home Pickup',
  },
  {
    icon: Pill,
    title: 'Order Medicines',
    desc: 'Genuine medicines delivered in 24 hours',
    href: '/medicines',
    badge: '20% OFF',
  },
  {
    icon: Activity,
    title: 'AI Symptom Check',
    desc: 'Smart health guidance powered by AI',
    href: '/telemedicine',
    badge: 'AI Powered',
  },
  {
    icon: Ambulance,
    title: 'Emergency SOS',
    desc: '24/7 ambulance with real-time GPS tracking',
    href: '/emergency',
    badge: '5 Min Avg',
  },
  {
    icon: Shield,
    title: 'Health Insurance',
    desc: 'Cashless claims at 5,000+ network hospitals',
    href: '/about',
    badge: 'Cashless',
  },
  {
    icon: Stethoscope,
    title: 'Second Opinion',
    desc: 'Expert reviews from senior specialist doctors',
    href: '/doctors',
    badge: 'Top Faculty',
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
      className="service-3d-card group relative bg-white/95 rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-shadow duration-300 overflow-hidden block"
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Radial cursor-following glow pseudo element representation */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: 'radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(14, 165, 233, 0.12), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-4">
        {/* Floating icon tile at translateZ(34px) */}
        <div
          className="w-13 h-13 p-3 bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100/80 rounded-2xl flex items-center justify-center text-[#0369a1] group-hover:scale-105 group-hover:border-sky-300 transition-all shadow-sm"
          style={{
            transform: 'translateZ(34px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <Icon size={24} strokeWidth={1.8} className="text-[#0369a1]" />
        </div>

        {item.badge && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
            {item.badge}
          </span>
        )}
      </div>

      {/* Floating title at translateZ(20px) */}
      <h3
        className="font-bold text-slate-900 text-base mb-1.5 font-sora group-hover:text-sky-600 transition-colors"
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {item.title}
      </h3>

      <p className="text-slate-500 text-xs leading-relaxed font-normal">
        {item.desc}
      </p>

      <div className="mt-4 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
        Explore service →
      </div>
    </Link>
  );
}

export default function ServicesTiltGrid() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
            Everything Healthcare
          </p>
          <h2 className="section-heading">Our Services</h2>
          <p className="section-subheading mx-auto">
            From routine video consultations to emergency ambulance response — comprehensive care at every step.
          </p>
        </div>

        {/* Grid with perspective: 1000px */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
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
