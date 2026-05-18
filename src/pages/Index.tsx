import { useState, useEffect } from 'react';
import type { ElementType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, Clock, Shield, Video, Activity, Search, Calendar,
  FlaskConical, Pill, ChevronDown, Award, Users, Stethoscope, Heart,
  CheckCircle, Ambulance, Phone, Brain, Bone, Baby, Ear, ScanLine,
  Syringe, Eye, Wind, Ribbon, Sparkles
} from 'lucide-react';
import { doctors, specializations } from '@/data/doctors';
import { testimonials, faqData } from '@/data/mockData';
import { healthPackages } from '@/data/labTests';
import DoctorCard from '@/components/features/DoctorCard';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';
import heroImg from '@/assets/hero-bg.jpg';
import telemedicineImg from '@/assets/telemedicine-bg.jpg';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginFeature, setLoginFeature] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [animStats, setAnimStats] = useState({ patients: 0, doctors: 0, hospitals: 0, satisfaction: 0 });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const featuredDoctors = doctors.slice(0, 6);
  const specialtyIcons: Record<string, ElementType> = {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimStats(prev => ({
        patients: Math.min(prev.patients + 420, 5000000),
        doctors: Math.min(prev.doctors + 12, 15000),
        hospitals: Math.min(prev.hospitals + 5, 2000),
        satisfaction: Math.min(prev.satisfaction + 2, 98),
      }));
    }, 30);
    return () => clearInterval(interval);
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

  const services = [
    { icon: <Video size={24} />, title: 'Telemedicine', desc: 'Video consults with top doctors from home', color: 'bg-sky-50 text-sky-600', href: '/telemedicine' },
    { icon: <Calendar size={24} />, title: 'Book Appointment', desc: 'Schedule in-person visits at top hospitals', color: 'bg-indigo-50 text-indigo-600', href: '/appointments' },
    { icon: <FlaskConical size={24} />, title: 'Lab Tests', desc: 'Book 500+ tests with home sample collection', color: 'bg-purple-50 text-purple-600', href: '/labs' },
    { icon: <Pill size={24} />, title: 'Order Medicines', desc: 'Genuine medicines delivered in 24 hours', color: 'bg-emerald-50 text-emerald-600', href: '/medicines' },
    { icon: <Activity size={24} />, title: 'AI Symptom Check', desc: 'Smart health guidance powered by AI', color: 'bg-cyan-50 text-cyan-600', href: '/telemedicine' },
    { icon: <Ambulance size={24} />, title: 'Emergency SOS', desc: '24/7 ambulance with real-time tracking', color: 'bg-red-50 text-red-600', href: '/emergency' },
    { icon: <Shield size={24} />, title: 'Health Insurance', desc: 'Compare & buy health insurance plans', color: 'bg-amber-50 text-amber-600', href: '/about' },
    { icon: <Stethoscope size={24} />, title: 'Second Opinion', desc: 'Expert reviews from specialist doctors', color: 'bg-rose-50 text-rose-600', href: '/doctors' },
  ];

  return (
    <div className="min-h-screen">
      {/* SECTION 1: Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Healthcare" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-10 w-56 h-56 bg-cyan-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                India's #1 Healthcare Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight font-sora">
                Your Health,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                  Our Priority
                </span>
              </h1>
              <p className="text-slate-300 text-lg mt-6 leading-relaxed">
                Connect with 15,000+ verified doctors, book lab tests, order medicines, and access emergency care — all in one platform. Healthcare made simple, fast, and affordable.
              </p>

              <div className="mt-8 flex gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, specialties, conditions..."
                    className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && navigate(`/doctors?q=${searchQuery}`)}
                  />
                </div>
                <button onClick={() => navigate(`/doctors?q=${searchQuery}`)} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm transition-colors">
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {['Cardiologist', 'Dermatologist', 'Pediatrician', 'Gynaecologist', 'Neurologist'].map(s => (
                  <button key={s} onClick={() => navigate(`/doctors?q=${s}`)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 text-xs rounded-full transition-colors">
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button onClick={() => navigate('/doctors')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-sky-500/30">
                  Find a Doctor
                  <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/emergency')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-lg">
                  <Ambulance size={18} />
                  Emergency SOS
                </button>
              </div>
            </div>

            {/* Stats panel */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-500/30 rounded-xl flex items-center justify-center">
                    <Activity size={20} className="text-sky-300" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Live Consultations</p>
                    <p className="text-emerald-400 text-sm">1,248 ongoing right now</p>
                  </div>
                </div>
                <div className="h-16 flex items-end gap-1">
                  {[40, 65, 45, 70, 55, 80, 60, 90, 75, 95, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-sky-400/30 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              {[
                { label: 'Patients Served', value: `${(animStats.patients / 1000000).toFixed(1)}M+`, icon: Users, color: 'text-sky-400' },
                { label: 'Verified Doctors', value: `${(animStats.doctors / 1000).toFixed(0)}K+`, icon: Stethoscope, color: 'text-cyan-400' },
                { label: 'Partner Hospitals', value: `${animStats.hospitals}+`, icon: Award, color: 'text-emerald-400' },
                { label: 'Satisfaction Rate', value: `${animStats.satisfaction}%`, icon: Heart, color: 'text-rose-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
                  <stat.icon size={24} className={`${stat.color} mx-auto mb-2`} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-wider mb-2">Everything Healthcare</p>
            <h2 className="section-heading">Our Services</h2>
            <p className="section-subheading mx-auto">From routine consultations to emergency care — we've got you covered at every step of your health journey.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map(service => (
              <Link key={service.title} to={service.href}
                className="medical-card p-5 text-center group hover:scale-105 transition-transform">
                <div className={`w-12 h-12 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{service.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{service.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Featured Doctors */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sky-600 font-semibold text-sm uppercase tracking-wider mb-2">Top Specialists</p>
              <h2 className="section-heading">Featured Doctors</h2>
              <p className="text-slate-500 mt-2">Highly rated and experienced specialists ready to help you.</p>
            </div>
            <Link to="/doctors" className="flex items-center gap-1 text-sky-600 font-medium text-sm hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} onBook={handleDoctorBook} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Specializations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-wider mb-2">Browse by Specialty</p>
            <h2 className="section-heading">Medical Specializations</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {specializations.map(spec => {
              const Icon = specialtyIcons[spec.name] || Stethoscope;
              return (
              <Link key={spec.id} to={`/doctors?specialty=${spec.name}`}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                <span className={`w-12 h-12 ${spec.color} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon size={24} />
                </span>
                <span className="font-medium text-slate-700 text-sm text-center leading-tight">{spec.name}</span>
                <span className="text-xs text-slate-400">{spec.count} doctors</span>
              </Link>
            );})}
          </div>
        </div>
      </section>

      {/* SECTION 5: Telemedicine */}
      <section className="py-20 bg-gradient-to-br from-sky-900 via-sky-800 to-sky-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={telemedicineImg} alt="Telemedicine" className="w-full h-full object-cover opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 text-xs font-medium mb-6">
                <Video size={12} />
                Real-time Video Consultations
              </div>
              <h2 className="text-4xl font-bold text-white font-sora leading-tight">
                Doctor Consultation
                <span className="block text-sky-300">From Your Home</span>
              </h2>
              <p className="text-sky-100 mt-4 leading-relaxed">
                Connect face-to-face with specialist doctors via HD video call. Share reports, get prescriptions, and receive expert medical advice — without leaving your home.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: <Activity size={18} className="text-sky-300" />, title: 'Instant Connect', desc: 'Available within 15 minutes' },
                  { icon: <Shield size={18} className="text-sky-300" />, title: 'Fully Private', desc: 'End-to-end encrypted calls' },
                  { icon: <FlaskConical size={18} className="text-sky-300" />, title: 'Digital Prescription', desc: 'Sent directly to your phone' },
                  { icon: <Users size={18} className="text-sky-300" />, title: 'Multi-language', desc: 'Consult in 12+ languages' },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                    {f.icon}
                    <div>
                      <p className="text-white font-medium text-sm">{f.title}</p>
                      <p className="text-sky-300 text-xs mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/telemedicine')}
                className="mt-8 flex items-center gap-2 px-6 py-3 bg-white text-sky-700 rounded-xl font-semibold hover:bg-sky-50 transition-colors shadow-lg">
                Start Video Consultation
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Available Now</h3>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">234 online</span>
              </div>
              {doctors.filter(d => d.telemedicineEnabled).slice(0, 4).map(doc => (
                <div key={doc.id} className="flex items-center gap-3 bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors cursor-pointer mb-3" onClick={() => navigate('/telemedicine')}>
                  <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{doc.name}</p>
                    <p className="text-sky-300 text-xs">{doc.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 text-xs font-medium">Available</p>
                    <p className="text-white text-xs font-semibold">Rs.{doc.consultationFee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Health Packages */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-wider mb-2">Preventive Care</p>
            <h2 className="section-heading">Health Checkup Packages</h2>
            <p className="section-subheading mx-auto">Comprehensive health packages with home sample collection and guaranteed results.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthPackages.map(pkg => (
              <div key={pkg.id} className={`medical-card p-6 relative ${pkg.popular ? 'ring-2 ring-sky-500' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-full">Most Popular</div>
                )}
                <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-4">
                  <FlaskConical size={22} className="text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{pkg.tests} tests included • {pkg.ageGroup}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-sky-600">Rs.{pkg.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm line-through ml-2">Rs.{pkg.mrp.toLocaleString()}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">{pkg.discount}% off</span>
                </div>
                <ul className="space-y-1.5 mb-5">
                  {pkg.includes.slice(0, 4).map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className="text-emerald-500 shrink-0" />{item}
                    </li>
                  ))}
                  {pkg.includes.length > 4 && <li className="text-xs text-sky-600">+{pkg.includes.length - 4} more tests</li>}
                </ul>
                <button
                  onClick={() => requireLogin('Book Health Package', () => navigate('/labs'))}
                  className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-wider mb-2">Patient Stories</p>
            <h2 className="section-heading">What Our Patients Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="medical-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border-2 border-sky-100" />
                  <div>
                    <p className="font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.condition}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{t.comment}"</p>
                <p className="text-slate-400 text-xs mt-3">{t.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Emergency Services */}
      <section className="py-20 bg-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 opacity-80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white font-sora mb-4">
                Medical Emergency?
                <span className="block text-red-200">We Respond in Minutes</span>
              </h2>
              <p className="text-red-100 text-lg leading-relaxed mb-8">
                Our 24/7 emergency network dispatches ambulances within 5 minutes. Real-time GPS tracking keeps your family informed. Available across 200+ cities in India.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Avg Response', value: '5 min' },
                  { label: 'Ambulances', value: '5,000+' },
                  { label: 'Cities', value: '200+' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-red-200 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/emergency')}
                className="flex items-center gap-3 px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg hover:bg-red-50 transition-colors shadow-xl sos-pulse">
                <Ambulance size={22} />
                SOS — Call Ambulance
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Ambulance size={22} className="text-white" />, title: 'ICU Ambulance', desc: 'Equipped with life support systems', bg: 'bg-white/10' },
                { icon: <Users size={22} className="text-white" />, title: 'Paramedic Support', desc: 'Trained medical staff onboard', bg: 'bg-white/10' },
                { icon: <Activity size={22} className="text-white" />, title: 'Live Tracking', desc: 'Real-time GPS location sharing', bg: 'bg-white/10' },
                { icon: <Phone size={22} className="text-white" />, title: '24/7 Helpline', desc: 'Always available, never on hold', bg: 'bg-white/10' },
              ].map(f => (
                <div key={f.title} className={`${f.bg} border border-white/20 rounded-2xl p-4`}>
                  {f.icon}
                  <h4 className="text-white font-semibold text-sm mt-2">{f.title}</h4>
                  <p className="text-red-200 text-xs mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 font-semibold text-sm uppercase tracking-wider mb-2">Questions Answered</p>
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqData.map((faq, idx) => (
              <div key={idx} className="medical-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-sky-500' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: CTA */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold text-white font-sora mb-4">
            Take Control of Your Health Today
          </h2>
          <p className="text-sky-100 text-lg mb-8">
            Join 5 million+ users who trust MediWave for their healthcare needs. Get started for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-sky-600 rounded-xl font-bold text-base hover:bg-sky-50 transition-colors shadow-lg">
              Create Free Account
            </button>
            <button onClick={() => navigate('/doctors')}
              className="px-8 py-4 bg-sky-500/30 border border-white/30 text-white rounded-xl font-bold text-base hover:bg-sky-500/50 transition-colors">
              Browse Doctors
            </button>
          </div>
          <p className="text-sky-200 text-xs mt-6">No credit card required • Free for patients • HIPAA and DPDP compliant</p>
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
