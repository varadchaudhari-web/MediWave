import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, Shield, Activity, Search,
  Ambulance, CheckCircle, ChevronDown, Award, Users,
  Stethoscope, Heart, FlaskConical, Sparkles
} from 'lucide-react';
import { doctors } from '@/data/doctors';
import { testimonials, faqData } from '@/data/mockData';
import { healthPackages } from '@/data/labTests';
import DoctorCard from '@/components/features/DoctorCard';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';
import heroImg from '@/assets/hero-bg.jpg';
import telemedicineImg from '@/assets/telemedicine-bg.jpg';
import { sanitizeSearch } from '@/lib/validation';

import HeroHelix from '@/components/3d/HeroHelix';
import LiveECG from '@/components/3d/LiveECG';
import StatCounter from '@/components/features/StatCounter';
import ServicesTiltGrid from '@/components/3d/ServicesTiltGrid';
import SpecialtyRing3D from '@/components/3d/SpecialtyRing3D';
import HowItWorksSteps from '@/components/3d/HowItWorksSteps';
import TrustMarquee from '@/components/ui/TrustMarquee';
import AvatarWithFallback from '@/components/ui/AvatarWithFallback';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginFeature, setLoginFeature] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLElement>(null);
  const span1Ref = useRef<HTMLSpanElement>(null);
  const span2Ref = useRef<HTMLSpanElement>(null);
  const statsPanelRef = useRef<HTMLDivElement>(null);

  const featuredDoctors = doctors.slice(0, 6);

  // Hero Depth Parallax and Tilt
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    let targetRx = 0;
    let targetRy = 0;
    let curRx = 0;
    let curRy = 0;
    let animId: number;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = hero.getBoundingClientRect();
      targetRx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetRy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const updateParallax = () => {
      curRx += (targetRx - curRx) * 0.08;
      curRy += (targetRy - curRy) * 0.08;

      if (span1Ref.current) {
        const depth1 = 1.4;
        span1Ref.current.style.transform = `translate3d(${-curRx * depth1 * 9}px, ${-curRy * depth1 * 5}px, 0)`;
      }
      if (span2Ref.current) {
        const depth2 = 2.4;
        span2Ref.current.style.transform = `translate3d(${-curRx * depth2 * 9}px, ${-curRy * depth2 * 5}px, 0)`;
      }
      if (statsPanelRef.current) {
        statsPanelRef.current.style.transform = `perspective(900px) rotateY(${-curRx * 7}deg) rotateX(${curRy * 6}deg)`;
      }

      animId = requestAnimationFrame(updateParallax);
    };

    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    animId = requestAnimationFrame(updateParallax);

    return () => {
      hero.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleDoctorBook = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingOpen(true);
  };

  const requireLogin = (feature: string, action: () => void) => {
    if (!isAuthenticated) {
      setLoginFeature(feature);
      setLoginModalOpen(true);
    } else {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-[#0c2136] selection:bg-sky-500 selection:text-white">
      {/* SECTION 1: Hero with 3D DNA Wave */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center overflow-hidden hero-gradient pt-24 pb-14"
        style={{ zIndex: 1 }}
      >
        {/* Background photo at opacity 0.40 with WCAG AA gradient scrim */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={heroImg}
            alt="Medical background"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C1C2E]/90 via-[#0F2D4A]/80 to-[#0284C7]/70" />
        </div>

        {/* 3D Parametric DNA Helix Wave Canvas */}
        <HeroHelix />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 right-10 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/4 left-10 w-64 h-64 bg-teal-400/15 rounded-full blur-2xl animate-float pointer-events-none"
          style={{ animationDelay: '1.2s' }}
        />

        {/* Hero Content on z-index: 2 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading & Search */}
            <div className="lg:col-span-7">
              {/* India's #1 Healthcare Platform Pill with Heartbeat-pulsing dot */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sky-200 text-xs sm:text-sm font-medium mb-6 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                India's #1 Healthcare Platform
              </div>

              {/* Parallax H1 Title with data-depth block spans */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] font-sora tracking-tight">
                <span
                  ref={span1Ref}
                  data-depth="1.4"
                  className="block will-change-transform"
                >
                  Your Health,
                </span>
                <span
                  ref={span2Ref}
                  data-depth="2.4"
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-200 will-change-transform"
                >
                  Our Priority
                </span>
              </h1>

              <p className="text-slate-200 text-base sm:text-lg mt-5 leading-relaxed max-w-xl">
                Connect with 15,000+ verified doctors, book lab tests, order medicines, and access 24/7 emergency care — all on one platform.
              </p>

              {/* Search Bar */}
              <div className="mt-8 flex gap-2 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-2 max-w-xl shadow-2xl">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search size={20} className="text-sky-200 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(sanitizeSearch(e.target.value))}
                    placeholder="Search doctors, specialties, conditions..."
                    className="flex-1 bg-transparent text-white placeholder-slate-300 text-sm focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && navigate(`/doctors?q=${searchQuery}`)}
                  />
                </div>
                <button
                  onClick={() => navigate(`/doctors?q=${searchQuery}`)}
                  className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0369a1] text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
                >
                  Search
                </button>
              </div>

              {/* Quick Specialty Pills */}
              <div className="flex flex-wrap gap-2 mt-4 max-w-xl">
                {['Cardiologist', 'Dermatologist', 'Pediatrician', 'Gynaecologist', 'Neurologist'].map(s => (
                  <button
                    key={s}
                    onClick={() => navigate(`/doctors?q=${s}`)}
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs font-medium rounded-full transition-all backdrop-blur-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Hero CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/doctors')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0EA5E9] hover:bg-sky-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/30 active:scale-95"
                >
                  Find a Doctor
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/emergency')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#EF4444] hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/30 sos-pulse active:scale-95"
                >
                  <Ambulance size={18} />
                  Emergency SOS
                </button>
              </div>
            </div>

            {/* Right Column: 3D Tilting Stats & ECG Panel */}
            <div className="lg:col-span-5">
              <div
                ref={statsPanelRef}
                className="space-y-4 will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Live ECG Waveform Card */}
                <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl p-5 shadow-2xl">
                  <LiveECG height={72} />
                </div>

                {/* 2x2 Fast Stat Counters (IntersectionObserver, 1.4s duration, cubic ease-out) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 text-left shadow-lg">
                    <div className="w-9 h-9 bg-sky-500/20 rounded-xl flex items-center justify-center mb-2.5">
                      <Users size={18} className="text-sky-300" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white font-sora">
                      <StatCounter finalValue={2.0} suffix="M+" decimals={1} />
                    </p>
                    <p className="text-slate-200 text-xs mt-1 font-medium">Patients Served</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 text-left shadow-lg">
                    <div className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center mb-2.5">
                      <Stethoscope size={18} className="text-teal-300" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white font-sora">
                      <StatCounter finalValue={15} suffix="K+" />
                    </p>
                    <p className="text-slate-200 text-xs mt-1 font-medium">Verified Doctors</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 text-left shadow-lg">
                    <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-2.5">
                      <Award size={18} className="text-emerald-300" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white font-sora">
                      <StatCounter finalValue={2000} suffix="+" formatNumber={true} />
                    </p>
                    <p className="text-slate-200 text-xs mt-1 font-medium">Partner Hospitals</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl p-4 text-left shadow-lg">
                    <div className="w-9 h-9 bg-rose-500/20 rounded-xl flex items-center justify-center mb-2.5">
                      <Heart size={18} className="text-rose-300" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-white font-sora">
                      <StatCounter finalValue={98} suffix="%" />
                    </p>
                    <p className="text-slate-200 text-xs mt-1 font-medium">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtle scroll helper */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 text-sky-200/70 text-[11px] font-mono tracking-widest uppercase">
          <span>SCROLL • MOVE YOUR CURSOR</span>
        </div>
      </section>

      {/* Trust Marquee Bar */}
      <TrustMarquee />

      {/* SECTION 2: 3D Tilting Service Cards */}
      <ServicesTiltGrid />

      {/* SECTION 3: 3D Speciality Ring Carousel */}
      <SpecialtyRing3D />

      {/* SECTION 4: 3D Scroll-Driven How It Works Steps */}
      <HowItWorksSteps />

      {/* SECTION 5: Featured Doctors */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
                Top Specialists
              </p>
              <h2 className="section-heading">Featured Doctors</h2>
              <p className="text-slate-500 mt-2 text-sm">
                Highly rated and experienced specialists ready to help you today.
              </p>
            </div>
            <Link to="/doctors" className="flex items-center gap-1.5 text-sky-600 font-semibold text-sm hover:text-sky-700 transition-colors">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} onBook={handleDoctorBook} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Telemedicine Spotlight */}
      <section className="py-20 bg-gradient-to-br from-[#0C2136] via-[#0F2D4A] to-[#0369a1] relative overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <img src={telemedicineImg} alt="Telemedicine background" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C2136] via-[#0F2D4A]/90 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 text-xs font-medium mb-6">
                <Activity size={14} />
                Real-time Video Consultations
              </div>
              <h2 className="text-4xl font-bold font-sora leading-tight">
                Doctor Consultation
                <span className="block text-sky-300">From Your Home</span>
              </h2>
              <p className="text-sky-100 mt-4 leading-relaxed text-base">
                Connect face-to-face with specialist doctors via encrypted HD video calls. Share reports, receive digital prescriptions, and get continuous healthcare support.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: <Activity size={18} className="text-sky-300" />, title: 'Instant Connect', desc: 'Available within 15 minutes' },
                  { icon: <Shield size={18} className="text-sky-300" />, title: 'Fully Private', desc: 'End-to-end encrypted calls' },
                  { icon: <FlaskConical size={18} className="text-sky-300" />, title: 'Digital Prescription', desc: 'Sent directly to your app' },
                  { icon: <Users size={18} className="text-sky-300" />, title: 'Multi-language', desc: 'Consult in 12+ Indian languages' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="shrink-0 mt-0.5">{f.icon}</div>
                    <div>
                      <p className="text-white font-semibold text-sm">{f.title}</p>
                      <p className="text-sky-200/80 text-xs mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/telemedicine')}
                className="mt-8 flex items-center gap-2 px-7 py-3.5 bg-white text-sky-800 rounded-xl font-bold hover:bg-sky-50 transition-colors shadow-lg active:scale-95"
              >
                Start Video Consultation
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Doctors Available Now */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold font-sora">Doctors Available Now</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  234 online
                </span>
              </div>
              {doctors.filter(d => d.telemedicineEnabled).slice(0, 4).map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-3.5 transition-colors cursor-pointer mb-3"
                  onClick={() => navigate('/telemedicine')}
                >
                  <AvatarWithFallback
                    src={doc.avatar}
                    alt={doc.name}
                    fallbackName={doc.name}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
                    fallbackClassName="w-12 h-12 rounded-xl bg-sky-800 text-white font-bold flex items-center justify-center text-xs border border-emerald-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{doc.name}</p>
                    <p className="text-sky-200 text-xs">{doc.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-300 text-xs font-semibold">Available</p>
                    <p className="text-white text-xs font-bold mt-0.5">₹{doc.consultationFee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Health Packages */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
              Preventive Care
            </p>
            <h2 className="section-heading">Health Checkup Packages</h2>
            <p className="section-subheading mx-auto">
              Comprehensive medical packages with free home sample collection and verified lab reports.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthPackages.map(pkg => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative shadow-sm hover:shadow-xl ${
                  pkg.popular ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200/80'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-4">
                  <FlaskConical size={22} className="text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-800 font-sora mb-1">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{pkg.tests} tests included • {pkg.ageGroup}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-sky-600">₹{pkg.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm line-through ml-2">₹{pkg.mrp.toLocaleString()}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2 border border-emerald-100">
                    {pkg.discount}% off
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.includes.slice(0, 4).map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {pkg.includes.length > 4 && (
                    <li className="text-xs text-sky-600 font-medium">+{pkg.includes.length - 4} more tests</li>
                  )}
                </ul>
                <button
                  onClick={() => requireLogin('Book Health Package', () => navigate('/labs'))}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Book Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Patient Testimonials with onError Fallbacks */}
      <section className="py-20 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
              Patient Stories
            </p>
            <h2 className="section-heading">What Our Patients Say</h2>
            <p className="section-subheading mx-auto">
              Real feedback from individuals and families who rely on MediWave for everyday health.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3.5 mb-4">
                  <AvatarWithFallback
                    src={t.avatar}
                    alt={t.name}
                    fallbackName={t.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-sky-100"
                    fallbackClassName="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm border border-sky-100"
                  />
                  <div>
                    <p className="font-bold text-slate-800 text-sm font-sora">{t.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{t.condition}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.comment}"</p>
                <p className="text-slate-400 text-xs mt-4 font-mono">{t.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: 24/7 Emergency Services */}
      <section className="py-20 bg-[#EF4444] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 opacity-90 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Emergency Hotline
              </div>
              <h2 className="text-4xl font-bold font-sora mb-4 leading-tight">
                Medical Emergency?
                <span className="block text-red-200">We Respond in Minutes</span>
              </h2>
              <p className="text-red-100 text-base leading-relaxed mb-8">
                Our 24/7 emergency ambulance dispatch network reaches you within minutes. GPS live-tracking keeps loved ones informed every second.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Avg Response', value: '5 min' },
                  { label: 'Ambulances', value: '5,000+' },
                  { label: 'Cities Covered', value: '200+' },
                ].map(stat => (
                  <div key={stat.label} className="text-center bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/15">
                    <p className="text-2xl font-bold font-sora text-white">{stat.value}</p>
                    <p className="text-red-100 text-xs mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/emergency')}
                className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-base hover:bg-red-50 transition-colors shadow-2xl active:scale-95"
              >
                <Ambulance size={22} />
                SOS — Call Ambulance Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Ambulance size={22} />, title: 'ICU Ambulance', desc: 'Equipped with life support systems' },
                { icon: <Users size={22} />, title: 'Paramedic Support', desc: 'Trained medical staff onboard' },
                { icon: <Activity size={22} />, title: 'Live GPS Tracking', desc: 'Real-time location sharing link' },
                { icon: <Shield size={22} />, title: '24/7 Helpline', desc: 'Zero wait time emergency call' },
              ].map(f => (
                <div key={f.title} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                  <div className="text-white mb-2">{f.icon}</div>
                  <h4 className="text-white font-bold text-sm font-sora">{f.title}</h4>
                  <p className="text-red-100 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-xs uppercase tracking-widest mb-2">
              Questions Answered
            </p>
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqData.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-800 pr-4 text-sm">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-3">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: Call to Action */}
      <section className="py-20 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sora mb-4 tracking-tight">
            Take Control of Your Health Today
          </h2>
          <p className="text-sky-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
            Join 5 million+ patients across India who trust MediWave for doctor appointments, lab tests, and 24/7 care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-sky-700 rounded-xl font-bold text-base hover:bg-sky-50 transition-all shadow-xl active:scale-95"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="px-8 py-4 bg-sky-700/40 border border-white/30 text-white rounded-xl font-bold text-base hover:bg-sky-700/60 transition-all backdrop-blur-sm active:scale-95"
            >
              Browse Doctors
            </button>
          </div>
          <p className="text-sky-200 text-xs mt-6 font-medium">
            No credit card required • Free for patients • HIPAA & DPDP Compliant
          </p>
        </div>
      </section>

      <BookingModal doctor={selectedDoctor} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        featureName={loginFeature}
        description="Please log in to access this feature."
        onLogin={() => { setLoginModalOpen(false); navigate('/login'); }}
      />
    </div>
  );
}
