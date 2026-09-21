import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Search, Star, Clock, Filter, Activity, AlertTriangle } from 'lucide-react';
import { doctors } from '@/data/doctors';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';
import VideoCallInterface from '@/components/features/VideoCallInterface';
import SymptomChecker from '@/components/features/SymptomChecker';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { sanitizeSearch } from '@/lib/validation';

export default function Telemedicine() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'consult' | 'symptom'>('consult');
  const [callDoctor, setCallDoctor] = useState<Doctor | null>(null);
  const [loginModal, setLoginModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableDoctors = doctors.filter(d => d.telemedicineEnabled);
  const filtered = availableDoctors.filter(d =>
    !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startCall = (doctor: Doctor) => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    setCallDoctor(doctor);
  };

  const bookDoctor = (doctor: Doctor) => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    setBookingDoctor(doctor);
    setBookingOpen(true);
  };

  if (callDoctor) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col" style={{ top: 0 }}>
        <div className="flex-1 p-4 flex items-center justify-center" style={{ paddingTop: '1rem' }}>
          <div className="w-full max-w-5xl" style={{ height: '90vh' }}>
            <VideoCallInterface
              doctorName={callDoctor.name}
              doctorAvatar={callDoctor.avatar}
              doctorSpecialty={callDoctor.specialty}
              onEnd={() => setCallDoctor(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white font-sora mb-2">Telemedicine</h1>
          <p className="text-sky-200 mb-6">Consult top doctors via HD video call from the comfort of your home</p>

          <div className="flex gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-1.5 w-fit mb-6">
            {[
              { id: 'consult', label: 'Video Consult' },
              { id: 'symptom', label: 'AI Symptom Check' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'consult' | 'symptom')}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white text-sky-700' : 'text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'consult' ? (
          <>
            {/* How it works */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { step: '1', icon: null, title: 'Choose Doctor', desc: 'Find your specialist' },
                { step: '2', icon: null, title: 'Book Slot', desc: 'Pick date & time' },
                { step: '3', icon: null, title: 'Pay Securely', desc: 'Multiple options' },
                { step: '4', icon: null, title: 'Video Call', desc: 'Start consultation' },
              ].map(step => (
                <div key={step.step} className="medical-card p-4 text-center">
                  <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{step.step}</div>
                  <p className="font-semibold text-slate-800 text-xs mt-1">{step.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(sanitizeSearch(e.target.value))}
                  placeholder="Search doctors by name or specialty..."
                  className="flex-1 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(doctor => (
                <div key={doctor.id} className="medical-card p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative">
                      <img src={doctor.avatar} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100" />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${doctor.available ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">{doctor.name}</h3>
                      <p className="text-sky-600 text-xs">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium text-slate-700">{doctor.rating}</span>
                        </div>
                        <span className="text-slate-200 text-xs">•</span>
                        <span className="text-xs text-slate-400">{doctor.experience} yrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-slate-800">₹{doctor.consultationFee}</span>
                      <span className="text-slate-400 text-xs ml-1">/ consult</span>
                    </div>
                    <div className={`text-xs font-medium flex items-center gap-1 ${doctor.available ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <Clock size={11} />
                      {doctor.available ? 'Avail Now' : 'Avail Later'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startCall(doctor)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors"
                    >
                      <Video size={13} />
                      Start Call
                    </button>
                    <button
                      onClick={() => bookDoctor(doctor)}
                      className="flex-1 py-2.5 border border-sky-200 text-sky-600 rounded-xl text-xs font-semibold hover:bg-sky-50 transition-colors"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                This AI Symptom Checker is for informational purposes only and is NOT a substitute for professional medical diagnosis. Always consult a qualified healthcare professional for medical advice.
              </p>
            </div>
            <SymptomChecker />
          </div>
        )}
      </div>

      <BookingModal doctor={bookingDoctor} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LoginRequiredModal
        isOpen={loginModal}
        onClose={() => setLoginModal(false)}
        featureName="Telemedicine"
        description="Log in to start a video consultation with a doctor."
        onLogin={() => { setLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
}
