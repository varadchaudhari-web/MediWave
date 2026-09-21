import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '@/types';
import { Star, MapPin, Award, Video, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from './Modal';

import AvatarWithFallback from '@/components/ui/AvatarWithFallback';
import TiltCard3D from '@/components/ui/TiltCard3D';

interface DoctorCardProps {
  doctor: Doctor;
  onBook?: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleBook = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (onBook) onBook(doctor);
    else navigate(`/doctors/${doctor.id}`);
  };

  return (
    <>
      <TiltCard3D
        className="medical-card p-6 cursor-pointer rounded-3xl"
        maxTilt={8}
        translateZ={10}
        onClick={() => navigate(`/doctors/${doctor.id}`)}
      >
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <AvatarWithFallback
              src={doctor.avatar}
              alt={doctor.name}
              fallbackName={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 group-hover:border-sky-100 transition-colors"
              fallbackClassName="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm border-2 border-slate-100"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-sky-600 transition-colors">
                  {doctor.name}
                </h3>
                <p className="text-sky-600 text-sm font-medium mt-0.5">{doctor.specialty}</p>
                <p className="text-slate-400 text-xs mt-0.5">{doctor.qualification}</p>
              </div>
              <div className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${
                doctor.available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {doctor.available ? '● Available' : '○ Busy'}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-slate-700">{doctor.rating}</span>
                <span className="text-xs text-slate-400">({doctor.reviewCount.toLocaleString()})</span>
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Award size={12} className="text-sky-400" />
                {doctor.experience} yrs exp
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} className="text-slate-400" />
                {doctor.location.split(',')[0]}
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {doctor.tags.slice(0, 3).map(tag => (
                <span key={tag} className="badge-primary">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock size={12} className="text-emerald-500" />
              <span className="text-emerald-600 font-medium">{doctor.nextAvailable}</span>
            </div>
            <p className="font-bold text-slate-800 text-base mt-1">
              ₹{doctor.consultationFee}
              <span className="text-slate-400 text-xs font-normal"> / consult</span>
            </p>
          </div>

          <div className="flex gap-2">
            {doctor.telemedicineEnabled && (
              <button
                onClick={(e) => { e.stopPropagation(); handleBook(); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-medium hover:bg-sky-100 transition-colors border border-sky-100"
              >
                <Video size={13} />
                Video
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleBook(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700 transition-colors shadow-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </TiltCard3D>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        featureName="Book Appointment"
        description="Sign in to book appointments, view prescriptions, and manage your health records."
        onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
      />
    </>
  );
}
