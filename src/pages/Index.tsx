import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, Shield, Activity, Search,
  Ambulance, CheckCircle, ChevronDown, Award, Users,
  Stethoscope, Heart, FlaskConical
} from 'lucide-react';
import { doctors } from '@/data/doctors';
import { testimonials, faqData } from '@/data/mockData';
import { healthPackages } from '@/data/labTests';
import DoctorCard from '@/components/features/DoctorCard';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';
import { sanitizeSearch } from '@/lib/validation';

import HeroHelix from '@/components/3d/HeroHelix';
import LiveECG from '@/components/3d/LiveECG';
import StatCounter from '@/components/features/StatCounter';
import ServicesTiltGrid from '@/components/3d/ServicesTiltGrid';
import SpecialtyRing3D from '@/components/3d/SpecialtyRing3D';
import HowItWorksSteps from '@/components/3d/HowItWorksSteps';
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
    <div className="min-h-screen bg-[#f4f9ff] text-[#0c2136] selection:bg-sky-500 selection:text-white">
      {/* SECTION 1: Light Theme Hero matching Screenshot 1 */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center overflow-hidden hero-light-bg pt-28 pb-16"
        style={{ zIndex: 1 }}
      >
        {/* Subtle light ambient glow circles */}
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute bottom-1/4 left-10 w-80 h-80 bg-teal-100/60 rounded-full blur-3xl pointer-events-none"
          style={{ animationDelay: '1.2s' }}
        />

        {/* 3D Parametric DNA Helix Wave Canvas */}
        <HeroHelix />

        {/* Hero Content on z-index: 2 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Heading & Search */}
            <div className="lg:col-span-7">
              {/* India's #1 Healthcare Platform Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#d9e8f7] rounded-full text-[#0369a1] text-xs sm:text-sm font-semibold mb-6 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c9a8]" />
                India's #1 Healthcare Platform
              </div>

              {/* Parallax H1 Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-[#0c2136] leading-[1.12] font-sora tracking-tight">
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
                  className="block text-[#0ea5e9] will-change-transform"
                >
                  Our Priority
                </span>
              </h1>

              <p className="text-[#5b7392] text-base sm:text-lg mt-5 leading-relaxed max-w-xl">
                15,000+ verified doctors, lab tests, medicines and 24/7 emergency care — all on one platform.
              </p>

              {/* Clean White Search Bar */}
              <div className="mt-8 flex gap-2 bg-white border border-[#d9e8f7] rounded-2xl p-2 max-w-xl shadow-[0_10px_30px_-5px_rgba(14,165,233,0.08)]">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search size={20} className="text-[#5b7392] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(sanitizeSearch(e.target.value))}
                    placeholder="Search doctors, specialties, conditions..."
                    className="flex-1 bg-transparent text-[#0c2136] placeholder-[#5b7392] text-sm focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && navigate(`/doctors?q=${searchQuery}`)}
                  />
                </div>
                <button
                  onClick={() => navigate(`/doctors?q=${searchQuery}`)}
                  className="px-6 py-3 bg-[#0ea5e9] hover:bg-[#0369a1] text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95"
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
                    className="px-3.5 py-1.5 bg-white hover:bg-sky-50 border border-[#d9e8f7] text-[#5b7392] hover:text-[#0ea5e9] text-xs font-medium rounded-full transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Hero CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => navigate('/doctors')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0ea5e9] hover:bg-[#0369a1] text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/25 active:scale-95"
                >
                  Find a Doctor
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/emergency')}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#ef4444] hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/25 active:scale-95"
                >
                  <Ambulance size={18} />
                  Emergency SOS
                </button>
              </div>
            </div>

            {/* Right Column: Clean White 3D Tilting Stats & ECG Panel */}
            <div className="lg:col-span-5">
              <div
                ref={statsPanelRef}
                className="space-y-4 will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Live ECG Waveform Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#d9e8f7] shadow-[0_10px_30px_-5px_rgba(14,165,233,0.08)]">
                  <LiveECG height={74} />
                </div>

                {/* 2x2 Fast Stat Counters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-[#d9e8f7] text-left shadow-[0_10px_30px_-5px_rgba(14,165,233,0.06)]">
                    <p className="text-3xl font-extrabold text-[#0369a1] font-sora">
                      <StatCounter finalValue={2.0} suffix="M+" decimals={1} />
                    </p>
                    <p className="text-[#5b7392] text-xs font-medium mt-1">Patients Served</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#d9e8f7] text-left shadow-[0_10px_30px_-5px_rgba(14,165,233,0.06)]">
                    <p className="text-3xl font-extrabold text-[#0369a1] font-sora">
                      <StatCounter finalValue={15} suffix="K+" />
                    </p>
                    <p className="text-[#5b7392] text-xs font-medium mt-1">Verified Doctors</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#d9e8f7] text-left shadow-[0_10px_30px_-5px_rgba(14,165,233,0.06)]">
                    <p className="text-3xl font-extrabold text-[#0369a1] font-sora">
                      <StatCounter finalValue={2000} suffix="+" formatNumber={true} />
                    </p>
                    <p className="text-[#5b7392] text-xs font-medium mt-1">Partner Hospitals</p>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[#d9e8f7] text-left shadow-[0_10px_30px_-5px_rgba(14,165,233,0.06)]">
                    <p className="text-3xl font-extrabold text-[#0369a1] font-sora">
                      <StatCounter finalValue={98} suffix="%" />
                    </p>
                    <p className="text-[#5b7392] text-xs font-medium mt-1">Satisfaction Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Pill over DNA wave */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
          <div className="px-4 py-1.5 bg-white/90 backdrop-blur-md border border-[#d9e8f7] rounded-full text-[#5b7392] text-xs font-mono tracking-widest uppercase shadow-sm">
            SCROLL • MOVE YOUR CURSOR
          </div>
        </div>
      </section>

      {/* SECTION 2: 3D Tilting Service Cards matching Screenshot 3 */}
      <ServicesTiltGrid />

      {/* SECTION 3: 3D Speciality Ring Carousel matching Screenshot 4 */}
      <SpecialtyRing3D />

      {/* SECTION 4: 3D Scroll-Driven How It Works Steps */}
      <HowItWorksSteps />

      {/* SECTION 5: Featured Doctors */}
      <section className="py-24 bg-white border-t border-[#d9e8f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#0ea5e9] font-bold text-xs uppercase tracking-widest mb-2">
                Top Specialists
              </p>
              <h2 className="section-heading">Featured Doctors</h2>
              <p className="section-subheading">
                Highly rated and experienced specialists ready to help you today.
              </p>
            </div>
            <Link to="/doctors" className="flex items-center gap-1.5 text-[#0ea5e9] font-semibold text-sm hover:text-[#0369a1] transition-colors">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} onBook={handleDoctorBook} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Health Packages */}
      <section className="py-24 bg-[#f4f9ff] border-t border-[#d9e8f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-12">
            <p className="text-[#0ea5e9] font-bold text-xs uppercase tracking-widest mb-2">
              Preventive Care
            </p>
            <h2 className="section-heading">Health Checkup Packages</h2>
            <p className="section-subheading">
              Comprehensive medical packages with free home sample collection and verified lab reports.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthPackages.map(pkg => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 relative shadow-sm hover:shadow-xl ${
                  pkg.popular ? 'border-[#0ea5e9] ring-2 ring-sky-500/20' : 'border-[#d9e8f7]'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0ea5e9] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-4">
                  <FlaskConical size={22} className="text-[#0ea5e9]" />
                </div>
                <h3 className="font-bold text-[#0c2136] font-sora mb-1">{pkg.name}</h3>
                <p className="text-xs text-[#5b7392] mb-3">{pkg.tests} tests included • {pkg.ageGroup}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-[#0ea5e9]">₹{pkg.price.toLocaleString()}</span>
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
                    <li className="text-xs text-[#0ea5e9] font-medium">+{pkg.includes.length - 4} more tests</li>
                  )}
                </ul>
                <button
                  onClick={() => requireLogin('Book Health Package', () => navigate('/labs'))}
                  className="w-full py-2.5 bg-[#0ea5e9] hover:bg-[#0369a1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Book Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Patient Testimonials */}
      <section className="py-24 bg-white border-t border-[#d9e8f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-left mb-12">
            <p className="text-[#0ea5e9] font-bold text-xs uppercase tracking-widest mb-2">
              Patient Stories
            </p>
            <h2 className="section-heading">What Our Patients Say</h2>
            <p className="section-subheading">
              Real feedback from individuals and families who rely on MediWave for everyday health.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white rounded-3xl p-6 border border-[#d9e8f7] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3.5 mb-4">
                  <AvatarWithFallback
                    src={t.avatar}
                    alt={t.name}
                    fallbackName={t.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-sky-100"
                    fallbackClassName="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm border border-sky-100"
                  />
                  <div>
                    <p className="font-bold text-[#0c2136] text-sm font-sora">{t.name}</p>
                    <p className="text-xs text-[#5b7392] font-medium mt-0.5">{t.condition}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.comment}"</p>
                <p className="text-[#5b7392] text-xs mt-4 font-mono">{t.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: 24/7 Emergency SOS */}
      <section className="py-20 bg-[#ef4444] relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-90 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Emergency Hotline
              </div>
              <h2 className="text-4xl font-bold font-sora mb-4 leading-tight">
                Medical Emergency?
                <span className="block text-red-100">We Respond in Minutes</span>
              </h2>
              <p className="text-red-50 text-base leading-relaxed mb-8">
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

      {/* SECTION 9: FAQ */}
      <section className="py-24 bg-[#f4f9ff] border-t border-[#d9e8f7]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#0ea5e9] font-bold text-xs uppercase tracking-widest mb-2">
              Questions Answered
            </p>
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqData.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#d9e8f7] overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="font-semibold text-[#0c2136] pr-4 text-sm">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#5b7392] shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-[#0ea5e9]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-3">
                    <p className="text-[#5b7392] text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#0ea5e9] to-[#0369a1] text-white relative overflow-hidden">
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
              className="px-8 py-4 bg-white text-[#0369a1] rounded-xl font-bold text-base hover:bg-sky-50 transition-all shadow-xl active:scale-95"
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
