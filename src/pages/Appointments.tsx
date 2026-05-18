import { useState } from 'react';
import { doctors } from '@/data/doctors';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, X, RefreshCw, CheckCircle, AlertCircle, Plus, Filter } from 'lucide-react';
import { Appointment } from '@/types';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { generateReport } from '@/lib/reportGenerator';

export default function Appointments() {
  const { isAuthenticated, user } = useAuth();
  const { appointments, cancelAppointment } = useAppData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduleDoctor, setRescheduleDoctor] = useState<Doctor | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-sky-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Manage Your Appointments</h2>
          <p className="text-slate-500 text-sm mb-6">Log in to view, book, and manage your doctor appointments.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  const patientAppointments = appointments.filter(a => a.patientId === (user?.id || 'p1'));
  const filtered = patientAppointments.filter(a => filter === 'all' || a.status === filter);

  const handleCancel = (id: string) => {
    cancelAppointment(id);
    setConfirmCancel(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'in-progress': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  const statusCounts = {
    all: patientAppointments.length,
    scheduled: patientAppointments.filter(a => a.status === 'scheduled').length,
    completed: patientAppointments.filter(a => a.status === 'completed').length,
    cancelled: patientAppointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white font-sora">My Appointments</h1>
              <p className="text-sky-200 text-sm mt-1">{patientAppointments.length} total appointments</p>
            </div>
            <button
              onClick={() => navigate('/doctors')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-50 shadow"
            >
              <Plus size={16} />
              New Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f} <span className="ml-1 text-xs opacity-70">({statusCounts[f]})</span>
            </button>
          ))}
        </div>

        {/* Appointment list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600">No {filter !== 'all' ? filter : ''} appointments</h3>
            <p className="text-slate-400 text-sm mt-1">Book your first appointment to get started</p>
            <button onClick={() => navigate('/doctors')} className="mt-4 px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium">
              Find a Doctor
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(apt => {
              const doctor = doctors.find(d => d.id === apt.doctorId);
              return (
                <div key={apt.id} className="medical-card p-5">
                  <div className="flex items-start gap-4">
                    {doctor && (
                      <img src={doctor.avatar} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-800">{apt.doctorName}</h3>
                          <p className="text-sky-600 text-sm">{apt.doctorSpecialty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            apt.status === 'scheduled' ? 'bg-sky-100 text-sky-700' :
                            apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          } capitalize`}>{apt.status}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={12} className="text-sky-500" />
                          {new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock size={12} className="text-sky-500" />
                          {apt.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          {apt.type === 'telemedicine' ? <Video size={12} className="text-sky-500" /> : <MapPin size={12} className="text-sky-500" />}
                          {apt.type === 'telemedicine' ? 'Video Consultation' : 'In-Person'}
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${apt.paymentStatus === 'paid' ? 'text-emerald-600' : apt.paymentStatus === 'refunded' ? 'text-amber-600' : 'text-slate-400'}`}>
                          <span>₹{apt.fee}</span>
                          <span className="capitalize">({apt.paymentStatus})</span>
                        </div>
                      </div>

                      {apt.symptoms && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-1.5">
                          <span className="font-medium">Symptoms:</span> {apt.symptoms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    {apt.status === 'scheduled' && (
                      <>
                        {apt.type === 'telemedicine' && (
                          <button
                            onClick={() => navigate('/telemedicine')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700 transition-colors"
                          >
                            <Video size={13} />
                            Start Call
                          </button>
                        )}
                        <button
                          onClick={() => { const d = doctors.find(doc => doc.id === apt.doctorId); if (d) { setRescheduleDoctor(d); setBookingOpen(true); } }}
                          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                          <RefreshCw size={13} />
                          Reschedule
                        </button>
                        {confirmCancel === apt.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Cancel appointment?</span>
                            <button onClick={() => handleCancel(apt.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium">Yes</button>
                            <button onClick={() => setConfirmCancel(null)} className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmCancel(apt.id)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-medium hover:bg-red-50 transition-colors"
                          >
                            <X size={13} />
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                    {apt.status === 'completed' && apt.prescription && (
                      <button
                        onClick={() => setSelectedAppt(apt)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-medium hover:bg-emerald-100"
                      >
                        <CheckCircle size={13} />
                        View Prescription
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAppt(apt)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sky-600 text-xs font-medium hover:underline"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelectedAppt(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Appointment Details</h2>
              <button onClick={() => setSelectedAppt(null)} className="p-2 rounded-xl hover:bg-slate-100">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                {doctors.find(d => d.id === selectedAppt.doctorId) && (
                  <img src={doctors.find(d => d.id === selectedAppt.doctorId)!.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                )}
                <div>
                  <p className="font-semibold text-slate-800">{selectedAppt.doctorName}</p>
                  <p className="text-sky-600 text-sm">{selectedAppt.doctorSpecialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Date', value: new Date(selectedAppt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Time', value: selectedAppt.time },
                  { label: 'Type', value: selectedAppt.type === 'telemedicine' ? 'Video Consultation' : 'In-Person' },
                  { label: 'Status', value: selectedAppt.status },
                  { label: 'Fee', value: `₹${selectedAppt.fee}` },
                  { label: 'Payment', value: selectedAppt.paymentStatus },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                    <p className="font-medium text-slate-800 text-sm capitalize">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedAppt.prescription && (
                <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50">
                  <h4 className="font-semibold text-emerald-800 mb-3">Prescription</h4>
                  <p className="text-sm text-slate-700 mb-2"><span className="font-medium">Diagnosis:</span> {selectedAppt.prescription.diagnosis}</p>
                  <div className="space-y-2">
                    {selectedAppt.prescription.medicines.map((med, i) => (
                      <div key={i} className="bg-white rounded-lg p-2.5 text-xs">
                        <p className="font-medium text-slate-800">{med.name} — {med.dosage}</p>
                        <p className="text-slate-500 mt-0.5">{med.duration} • {med.instructions}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{selectedAppt.prescription.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setSelectedAppt(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                {selectedAppt.prescription && (
                  <button
                    onClick={() => { generateReport('prescription', { prescription: selectedAppt.prescription }); }}
                    className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700"
                  >
                    Download Prescription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal doctor={rescheduleDoctor} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
