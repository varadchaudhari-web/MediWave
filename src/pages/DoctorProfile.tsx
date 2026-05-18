
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctors } from '@/data/doctors';
import { Star, MapPin, Award, Video, Clock, Users, CheckCircle, ArrowLeft, Phone, Calendar, Globe, GraduationCap, Stethoscope } from 'lucide-react';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const doctor = doctors.find(d => d.id === id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'availability'>('overview');

  if (!doctor) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope size={56} className="text-sky-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Doctor not found</h2>
          <button onClick={() => navigate('/doctors')} className="mt-4 text-sky-600 hover:underline">Browse all doctors</button>
        </div>
      </div>
    );
  }

  const handleBook = () => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    setBookingOpen(true);
  };

  const mockReviews = [
    { name: 'Sunita Patel', rating: 5, date: '2 weeks ago', comment: 'Absolutely brilliant doctor. Very thorough and took time to explain everything clearly. Highly recommend!' },
    { name: 'Ravi Kumar', rating: 5, date: '1 month ago', comment: 'One of the best specialists I have consulted. The video call was seamless and the diagnosis was accurate.' },
    { name: 'Anita Singh', rating: 4, date: '2 months ago', comment: 'Very knowledgeable and patient. Had to wait slightly for the call but overall a great experience.' },
    { name: 'Manoj Verma', rating: 5, date: '3 months ago', comment: 'Dr. is excellent! Thorough examination and provided a detailed treatment plan. Follow-ups are timely.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <button onClick={() => navigate('/doctors')} className="flex items-center gap-1.5 text-sky-200 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft size={16} />
            Back to Doctors
          </button>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img src={doctor.avatar} alt={doctor.name} className="w-28 h-28 rounded-3xl object-cover border-4 border-white/30 shadow-xl" />
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-white font-sora">{doctor.name}</h1>
                  <p className="text-sky-200 text-lg mt-1">{doctor.specialty}</p>
                  {doctor.subSpecialty && <p className="text-sky-300 text-sm">{doctor.subSpecialty}</p>}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${doctor.available ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-500/20 text-slate-300'}`}>
                  {doctor.available ? '● Available Today' : '○ Available Tomorrow'}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-white">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-sky-300 text-sm">({doctor.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-200 text-sm">
                  <Award size={14} />
                  {doctor.experience} years experience
                </div>
                <div className="flex items-center gap-1.5 text-sky-200 text-sm">
                  <Users size={14} />
                  {doctor.patients.toLocaleString()} patients
                </div>
                <div className="flex items-center gap-1.5 text-sky-200 text-sm">
                  <MapPin size={14} />
                  {doctor.location}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100">
                {(['overview', 'reviews', 'availability'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-sm font-medium capitalize transition-colors ${
                      activeTab === tab ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">About Dr. {doctor.name.split(' ').slice(1).join(' ')}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{doctor.bio}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {doctor.tags.map(tag => (
                          <span key={tag} className="badge-primary py-1">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Education & Qualifications</h3>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <GraduationCap size={16} className="text-sky-500" />
                        {doctor.qualification}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 ml-6">Registration: {doctor.registrationNo}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Languages</h3>
                      <div className="flex gap-2">
                        {doctor.languages.map(lang => (
                          <span key={lang} className="flex items-center gap-1 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                            <Globe size={12} className="text-slate-400" />
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 mb-3">Hospital Affiliations</h3>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 font-bold shrink-0">H</div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{doctor.hospital}</p>
                          <p className="text-xs text-slate-500">{doctor.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-sky-50 rounded-2xl">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-sky-600">{doctor.rating}</p>
                        <div className="flex gap-0.5 justify-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={i < Math.round(doctor.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{doctor.reviewCount} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-4">{stars}</span>
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${stars === 5 ? 78 : stars === 4 ? 14 : stars === 3 ? 5 : stars === 2 ? 2 : 1}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {mockReviews.map((review, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-xs">
                              {review.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{review.name}</p>
                              <p className="text-xs text-slate-400">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-4">Available Slots This Week</h3>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className={`text-center p-2 rounded-xl text-xs ${idx < 5 ? 'bg-sky-50 text-sky-700 font-medium' : 'bg-slate-50 text-slate-400'}`}>
                          <p>{day}</p>
                          <p className="mt-0.5 font-bold">{18 + idx}</p>
                          {idx < 5 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1" />}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-600">Today's Slots</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {doctor.availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={handleBook}
                            className="py-2.5 border-2 border-sky-200 text-sky-600 rounded-xl text-xs font-medium hover:bg-sky-50 hover:border-sky-400 transition-all"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-sky-600">₹{doctor.consultationFee}</p>
                  <p className="text-xs text-slate-400">per consultation</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                  <Clock size={12} />
                  {doctor.nextAvailable}
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {[
                  { icon: '✅', text: '30 min consultation' },
                  { icon: '📋', text: 'Digital prescription' },
                  { icon: '🔁', text: 'Free follow-up (48 hrs)' },
                  { icon: '🔒', text: 'Secure & private' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-2 text-xs text-slate-600">
                    <span>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>

              {doctor.telemedicineEnabled && (
                <button onClick={handleBook} className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors mb-2 flex items-center justify-center gap-2">
                  <Video size={16} />
                  Video Consultation
                </button>
              )}
              <button onClick={handleBook} className="w-full py-3 border-2 border-sky-200 text-sky-600 rounded-xl font-semibold hover:bg-sky-50 transition-colors">
                Book In-Person Visit
              </button>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm">Quick Information</h4>
              {[
                { label: 'Hospital', value: doctor.hospital },
                { label: 'Location', value: doctor.location },
                { label: 'Patients', value: `${doctor.patients.toLocaleString()}+` },
                { label: 'Reg. No.', value: doctor.registrationNo },
              ].map(info => (
                <div key={info.label} className="flex justify-between text-xs">
                  <span className="text-slate-400">{info.label}</span>
                  <span className="text-slate-700 font-medium text-right max-w-[60%]">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookingModal doctor={doctor} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LoginRequiredModal
        isOpen={loginModal}
        onClose={() => setLoginModal(false)}
        featureName="Book Appointment"
        onLogin={() => { setLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
}
