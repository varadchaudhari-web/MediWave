import { useState } from 'react';
import { Doctor } from '@/types';
import Modal from './Modal';
import { Calendar, Clock, Video, MapPin, Star, CheckCircle, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ doctor, isOpen, onClose }: BookingModalProps) {
  const { addAppointment } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultType, setConsultType] = useState<'telemedicine' | 'in-person'>('telemedicine');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [booked, setBooked] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });

  const handleBook = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }
    setTimeout(() => {
      const newId = `apt_${Date.now()}`;
      addAppointment({
        id: newId,
        patientId: user?.id || 'p1',
        patientName: user?.name || 'John Smith',
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date: selectedDate,
        time: selectedSlot,
        type: consultType,
        status: 'scheduled',
        symptoms,
        fee: doctor.consultationFee,
        paymentStatus: paymentMethod === 'insurance' ? 'pending' : 'paid',
      });
      setAppointmentId(newId);
      setBooked(true);
    }, 800);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedSlot('');
    setSymptoms('');
    setBooked(false);
    onClose();
  };

  if (!doctor) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" title={booked ? '' : `Book Appointment`}>
      {booked ? (
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in-up">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Appointment Confirmed!</h2>
          <p className="text-slate-500 mb-6">Your appointment has been successfully booked.</p>

          <div className="bg-slate-50 rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <img src={doctor.avatar} alt={doctor.name} className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-slate-800">{doctor.name}</p>
                <p className="text-sm text-sky-600">{doctor.specialty}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={14} className="text-sky-500" />
                {dates.find(d => d.value === selectedDate)?.label}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={14} className="text-sky-500" />
                {selectedSlot}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Video size={14} className="text-sky-500" />
                {consultType === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                ✓ Payment: ₹{doctor.consultationFee}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6">Appointment ID: {appointmentId || `MW${Date.now().toString().slice(-8)}`}</p>

          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">
              Close
            </button>
            <button onClick={() => { handleClose(); navigate('/dashboard/patient'); }} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 transition-colors">
              View Appointments
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Doctor header */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
            <img src={doctor.avatar} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover" />
            <div>
              <h3 className="font-bold text-slate-800">{doctor.name}</h3>
              <p className="text-sky-600 text-sm">{doctor.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-slate-700">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                <span className="text-xs text-slate-400">• {doctor.experience} yrs exp</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="font-bold text-sky-600 text-lg">₹{doctor.consultationFee}</p>
              <p className="text-xs text-slate-400">Consultation fee</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step === s ? 'bg-sky-600 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 transition-colors ${step > s ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Consultation Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {doctor.telemedicineEnabled && (
                    <button
                      onClick={() => setConsultType('telemedicine')}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        consultType === 'telemedicine' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-200'
                      }`}
                    >
                      <Video size={18} className={consultType === 'telemedicine' ? 'text-sky-600' : 'text-slate-400'} />
                      <p className="font-medium text-sm text-slate-800 mt-1">Video Consultation</p>
                      <p className="text-xs text-slate-500">From your home</p>
                    </button>
                  )}
                  <button
                    onClick={() => setConsultType('in-person')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      consultType === 'in-person' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-200'
                    }`}
                  >
                    <MapPin size={18} className={consultType === 'in-person' ? 'text-sky-600' : 'text-slate-400'} />
                    <p className="font-medium text-sm text-slate-800 mt-1">In-Person Visit</p>
                    <p className="text-xs text-slate-500">{doctor.hospital}</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Select Date</label>
                <div className="flex gap-2 flex-wrap">
                  {dates.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDate(d.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        selectedDate === d.value
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'border-slate-200 text-slate-600 hover:border-sky-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {doctor.availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                          selectedSlot === slot
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'border-slate-200 text-slate-600 hover:border-sky-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => selectedDate && selectedSlot && setStep(2)}
                disabled={!selectedDate || !selectedSlot}
                className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Symptoms / Reason for Visit</label>
                <textarea
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit (optional but helpful)..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5"><Paperclip size={13} /> Upload Documents (optional)</p>
                <p className="text-xs text-amber-600 mt-0.5">Share previous reports or prescriptions for better consultation</p>
                <button className="mt-2 text-xs text-amber-600 underline">+ Attach files</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <h4 className="font-semibold text-slate-800 mb-3">Order Summary</h4>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Consultation fee</span><span className="font-medium">₹{doctor.consultationFee}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Platform fee</span><span className="font-medium">₹0</span></div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold"><span>Total</span><span className="text-sky-600">₹{doctor.consultationFee}</span></div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  {[
                    { id: 'upi', label: 'UPI / Google Pay / PhonePe', desc: 'Instant payment' },
                    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay' },
                    { id: 'insurance', label: 'Health Insurance', desc: 'Cashless facility available' },
                    { id: 'wallet', label: 'MediWave Wallet', desc: '₹1,200 available' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === m.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? 'border-sky-500' : 'border-slate-300'}`}>
                        {paymentMethod === m.id && <div className="w-2 h-2 bg-sky-500 rounded-full" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.label}</p>
                        <p className="text-xs text-slate-500">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">Back</button>
                <button onClick={handleBook} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 shadow-sm">
                  Pay & Confirm ₹{doctor.consultationFee}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
