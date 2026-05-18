import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Smartphone } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Footer() {
  const [storeModal, setStoreModal] = useState<'ios' | 'android' | null>(null);
  const links = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Help Center', href: '/help' },
    { label: 'Find Doctors', href: '/doctors' },
    { label: 'Book Lab Test', href: '/labs' },
    { label: 'Medicines', href: '/medicines' },
    { label: 'Insurance', href: '/dashboard/patient' },
    { label: 'Emergency', href: '/emergency' },
    { label: 'Careers', href: '/careers' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-[1.2fr_2fr] gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="MediWave" className="w-9 h-9 rounded-xl object-contain bg-white" />
              <span className="font-bold text-xl text-white font-sora">
                Medi<span className="text-sky-400">Wave</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              India's most trusted healthcare platform. Connecting patients with the best doctors, labs, and hospitals.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone size={14} className="text-sky-400 shrink-0" />
                1800-MED-WAVE (Toll Free)
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={14} className="text-sky-400 shrink-0" />
                care@mediwave.health
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin size={14} className="text-sky-400 shrink-0" />
                MediWave HQ, Bangalore 560001
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Important Links</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-6">
              {links.map(link => (
                <Link key={link.label} to={link.href} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 MediWave Health Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-slate-500 hover:text-sky-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-slate-500 hover:text-sky-400 transition-colors">Terms</Link>
            <Link to="/help" className="text-xs text-slate-500 hover:text-sky-400 transition-colors">Help</Link>
          </div>
          {/* App Store Buttons */}
          <div className="flex items-center gap-3">
            <button onClick={() => setStoreModal('ios')} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-3 py-2 transition-colors text-left">
              <Smartphone size={18} className="text-sky-400" />
              <div>
                <p className="text-xs text-slate-400 leading-none">Download on the</p>
                <p className="text-sm font-semibold leading-tight">App Store</p>
              </div>
            </button>
            <button onClick={() => setStoreModal('android')} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-3 py-2 transition-colors text-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400">
                <path d="M3.18 23.76a2 2 0 0 1-2.17-2.04V2.28A2 2 0 0 1 3.18.24l11.16 11.7L3.18 23.76zm14.4-7.62L5.28 22.8l9.18-9.6 3.12 2.94zm2.46-4.14c.54.3.54 1.14 0 1.44l-2.46 1.44-3.42-3.6 3.42-3.6 2.46 1.32zm-2.46-5.76L5.28 1.2l12.3 6.66-3.12 2.94-9.18-9.6"/>
              </svg>
              <div>
                <p className="text-xs text-slate-400 leading-none">Get it on</p>
                <p className="text-sm font-semibold leading-tight">Google Play</p>
              </div>
            </button>
          </div>
        </div>
      </div>
      {storeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70" onClick={() => setStoreModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-slate-800" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">MediWave Mobile App</h3>
            <p className="text-sm text-slate-500 mt-2">
              The {storeModal === 'ios' ? 'App Store' : 'Google Play'} listing is available in this demo as a preview modal. A production build would link to the live store page.
            </p>
            <div className="mt-4 rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-700">
              Release channel: MediWave Patient App v2.6.0
            </div>
            <button onClick={() => setStoreModal(null)} className="mt-5 w-full py-2.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">Done</button>
          </div>
        </div>
      )}
    </footer>
  );
}
