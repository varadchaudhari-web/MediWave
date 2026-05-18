import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { mockAppointments, medicalRecords, mockNotifications } from '@/data/mockData';
import {
  Calendar, FileText, Activity, Pill, FlaskConical, Video, Bell, User,
  ChevronRight, Home, LogOut, Plus, TrendingUp, ShoppingBag, CreditCard,
  Shield, Phone, X, ChevronLeft, Menu
} from 'lucide-react';
import { doctors } from '@/data/doctors';
import BookingModal from '@/components/features/BookingModal';
import { Doctor } from '@/types';
import { toast } from 'sonner';
import { generateReport } from '@/lib/reportGenerator';

type Section = 'overview' | 'appointments' | 'records' | 'prescriptions' | 'labs' | 'medicines' | 'billing' | 'insurance' | 'notifications' | 'profile' | 'emergency';

export default function PatientDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const { appointments, cancelAppointment, labOrders, pharmacyOrders, insuranceClaims, addInsuranceClaim } = useAppData();
  const navigate = useNavigate();
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [editProfile, setEditProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({
    policy: 'MediWave Plus',
    insurer: 'ICICI Lombard',
    hospital: 'Apollo Hospitals',
    treatment: '',
    amount: '',
    documents: ['Final bill'],
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bloodGroup: user?.bloodGroup || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  });

  const currentPatientId = user?.id || 'p1';
  const patientAppointments = appointments.filter(a => a.patientId === currentPatientId);
  const upcomingAppts = patientAppointments.filter(a => a.status === 'scheduled');
  const completedAppts = patientAppointments.filter(a => a.status === 'completed');
  const myLabOrders = labOrders.filter(o => o.patientId === currentPatientId);
  const myPharmacyOrders = pharmacyOrders.filter(o => o.patientId === currentPatientId);
  const myInsuranceClaims = insuranceClaims.filter(c => c.patientId === currentPatientId);

  const sidebarItems: { id: Section; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: upcomingAppts.length },
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'labs', label: 'Lab Orders', icon: FlaskConical, badge: myLabOrders.filter(o => o.reportReady).length },
    { id: 'medicines', label: 'Medicine Orders', icon: ShoppingBag },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: mockNotifications.filter(n => !n.read).length },
    { id: 'emergency', label: 'Emergency', icon: Phone },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const saveProfile = () => {
    updateProfile(profileForm);
    setEditProfile(false);
  };

  const submitClaim = () => {
    if (!claimForm.treatment || !claimForm.amount) {
      toast.error('Treatment and claim amount are required');
      return;
    }
    addInsuranceClaim({
      patientId: currentPatientId,
      patientName: user?.name || 'John Smith',
      policy: claimForm.policy,
      insurer: claimForm.insurer,
      hospital: claimForm.hospital,
      treatment: claimForm.treatment,
      amount: Number(claimForm.amount),
      documents: claimForm.documents,
    });
    setClaimForm({ policy: 'MediWave Plus', insurer: 'ICICI Lombard', hospital: 'Apollo Hospitals', treatment: '', amount: '', documents: ['Final bill'] });
    setClaimModalOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      // ── APPOINTMENTS ──────────────────────────────────────────────────────
      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">My Appointments</h2>
              <button onClick={() => navigate('/doctors')} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                <Plus size={16} /> Book New
              </button>
            </div>
            {patientAppointments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <Calendar size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No appointments yet</p>
                <button onClick={() => navigate('/doctors')} className="mt-3 px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium">Find a Doctor</button>
              </div>
            ) : (
              <div className="space-y-3">
                {patientAppointments.map(apt => {
                  const doc = doctors.find(d => d.id === apt.doctorId);
                  return (
                    <div key={apt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                      <div className="flex items-start gap-4">
                        {doc && <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold text-slate-800">{apt.doctorName}</h3>
                              <p className="text-sky-600 text-sm">{apt.doctorSpecialty}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                              apt.status === 'scheduled' ? 'bg-sky-100 text-sky-700' :
                              apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                            }`}>{apt.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={11} className="text-sky-400" />{new Date(apt.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            <span>{apt.time}</span>
                            <span>{apt.type === 'telemedicine' ? 'Video Call' : 'In-Person'}</span>
                            <span className={apt.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>₹{apt.fee} ({apt.paymentStatus})</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                        {apt.status === 'scheduled' && apt.type === 'telemedicine' && (
                          <button onClick={() => navigate('/telemedicine')} className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700">
                            <Video size={12} /> Start Call
                          </button>
                        )}
                        {apt.status === 'scheduled' && (
                          <button onClick={() => cancelAppointment(apt.id)} className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-500 rounded-xl text-xs font-medium hover:bg-red-50">
                            <X size={12} /> Cancel
                          </button>
                        )}
                        {apt.prescription && (
                          <button onClick={() => setActiveSection('prescriptions')} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-medium hover:bg-emerald-100">
                            View Prescription
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      // ── RECORDS ───────────────────────────────────────────────────────────
      case 'records':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Health Records</h2>
              <button onClick={() => navigate('/records')} className="flex items-center gap-2 px-4 py-2 border border-sky-200 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-50">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {medicalRecords.map(record => (
                <div key={record.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-sky-200 cursor-pointer transition-colors" onClick={() => navigate('/records')}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      record.type === 'prescription' ? 'bg-blue-100' : record.type === 'report' ? 'bg-purple-100' :
                      record.type === 'vaccination' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      {record.type === 'prescription' ? <Pill size={18} className="text-blue-600" /> :
                       record.type === 'report' ? <FlaskConical size={18} className="text-purple-600" /> :
                       record.type === 'vaccination' ? <Activity size={18} className="text-green-600" /> :
                       <FileText size={18} className="text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{record.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{record.doctor || record.hospital} · {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{record.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 shrink-0">
                      {record.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── PRESCRIPTIONS ─────────────────────────────────────────────────────
      case 'prescriptions': {
        const prescriptions = patientAppointments.filter(a => a.prescription).map(a => a.prescription!);
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">My Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <Pill size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No prescriptions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map(rx => (
                  <div key={rx.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">{rx.diagnosis}</h3>
                        <p className="text-sky-600 text-sm">{rx.doctorName}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">Active</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {rx.medicines.map((med, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-3 flex items-start gap-3">
                          <Pill size={14} className="text-sky-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{med.name} — {med.dosage}</p>
                            <p className="text-slate-400 text-xs">{med.duration} · {med.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {rx.notes && <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-100">{rx.notes}</p>}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => generateReport('prescription', { prescription: rx })} className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700">Download PDF</button>
                      <button onClick={() => navigate('/medicines')} className="px-4 py-2 border border-sky-200 text-sky-600 rounded-xl text-xs font-medium hover:bg-sky-50">Order Medicines</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // ── LAB ORDERS ────────────────────────────────────────────────────────
      case 'labs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Lab Test Orders</h2>
              <button onClick={() => navigate('/labs')} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                <Plus size={16} /> Book Test
              </button>
            </div>
            {myLabOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <FlaskConical size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No lab orders yet</p>
                <button onClick={() => navigate('/labs')} className="mt-3 px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium">Book Lab Test</button>
              </div>
            ) : (
              <div className="space-y-3">
                {myLabOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                          <FlaskConical size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{order.test}</p>
                          <p className="text-slate-400 text-xs">{order.date} · {order.time}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{order.homeCollection ? 'Home Collection' : 'Lab Visit'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'processing' ? 'bg-sky-100 text-sky-700' :
                          order.status === 'sample-collected' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                        }`}>{order.status.replace('-', ' ')}</span>
                        <p className="font-bold text-sky-600 text-sm mt-1">₹{order.amount}</p>
                      </div>
                    </div>
                    {order.reportReady && (
                      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-emerald-700">Report Ready!</p>
                        <button onClick={() => generateReport('lab', { labOrder: order })} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">
                          Download Report
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── MEDICINE ORDERS ───────────────────────────────────────────────────
      case 'medicines':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Medicine Orders</h2>
              <button onClick={() => navigate('/medicines')} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                <Plus size={16} /> Order Now
              </button>
            </div>
            {myPharmacyOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <ShoppingBag size={48} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No medicine orders yet</p>
                <button onClick={() => navigate('/medicines')} className="mt-3 px-5 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium">Order Medicines</button>
              </div>
            ) : (
              <div className="space-y-3">
                {myPharmacyOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{order.id}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.medicines}</p>
                        <p className="text-xs text-slate-400 mt-1">{order.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'dispatched' ? 'bg-sky-100 text-sky-700' :
                          order.status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>{order.status}</span>
                        <p className="font-bold text-sky-600 text-sm mt-1">₹{order.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── BILLING ───────────────────────────────────────────────────────────
      case 'billing': {
        const billingHistory = [
          { id: 'INV001', desc: 'Dr. Sarah Mitchell — Video Consultation', date: '2026-05-20', amount: 800, status: 'paid', type: 'appointment' },
          { id: 'INV002', desc: 'Complete Blood Count + Lipid Profile', date: '2026-05-18', amount: 749, status: 'paid', type: 'lab' },
          { id: 'INV003', desc: 'Metformin 500mg × 2, Vitamin D3', date: '2026-05-17', amount: 162, status: 'paid', type: 'medicine' },
          { id: 'INV004', desc: 'Dr. Ananya Gupta — In-Person Consultation', date: '2026-05-18', amount: 600, status: 'paid', type: 'appointment' },
          { id: 'INV005', desc: 'Dr. Vikram Patel — Pediatrics', date: '2026-05-25', amount: 500, status: 'pending', type: 'appointment' },
        ];
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Billing & Payments</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Paid', value: '₹2,311', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending', value: '₹500', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Wallet Balance', value: '₹1,250', color: 'text-sky-600', bg: 'bg-sky-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Transaction History</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {billingHistory.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === 'appointment' ? 'bg-sky-100' : item.type === 'lab' ? 'bg-purple-100' : 'bg-emerald-100'
                    }`}>
                      {item.type === 'appointment' ? <Calendar size={16} className="text-sky-600" /> :
                       item.type === 'lab' ? <FlaskConical size={16} className="text-purple-600" /> :
                       <Pill size={16} className="text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{item.desc}</p>
                      <p className="text-xs text-slate-400">{item.id} · {item.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-800">₹{item.amount}</p>
                      <span className={`text-xs ${item.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'} capitalize`}>{item.status}</span>
                    </div>
                    <button onClick={() => generateReport('invoice', { reportId: item.id, patientName: user?.name || 'John Smith', amount: item.amount, title: item.desc })} className="text-xs text-sky-600 hover:underline shrink-0">Invoice</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // ── INSURANCE ─────────────────────────────────────────────────────────
      case 'insurance':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Insurance & Claims</h2>
            <div className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-2xl p-6 text-white">
              <p className="text-sky-100 text-xs font-medium uppercase tracking-wide mb-1">Active Policy</p>
              <h3 className="text-xl font-bold">MediWave Plus</h3>
              <p className="text-sky-200 text-sm">ICICI Lombard · Sum Insured: ₹10,00,000</p>
              <div className="flex gap-6 mt-4">
                <div><p className="text-2xl font-bold">₹6.4L</p><p className="text-sky-200 text-xs">Available Balance</p></div>
                <div><p className="text-2xl font-bold">₹3.6L</p><p className="text-sky-200 text-xs">Utilized This Year</p></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Claims History</h3></div>
              <div className="divide-y divide-slate-50">
                {myInsuranceClaims.map(claim => (
                  <div key={claim.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">{claim.treatment} - {claim.hospital}</p>
                      <p className="text-xs text-slate-400">{claim.claimNumber} · {claim.date}</p>
                      <p className="text-xs text-slate-500 mt-1">{claim.remarks}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">₹{claim.amount.toLocaleString()}</p>
                      <span className={`text-xs ${claim.status === 'approved' ? 'text-emerald-600' : claim.status === 'rejected' ? 'text-red-500' : 'text-amber-600'} capitalize`}>{claim.status.replace('-', ' ')}</span>
                      <button onClick={() => generateReport('insurance', { claim })} className="block text-xs text-sky-600 hover:underline mt-1">PDF</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <button onClick={() => setClaimModalOpen(true)} className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700 transition-colors">
                  Submit New Claim
                </button>
              </div>
            </div>
          </div>
        );

      // ── EMERGENCY ─────────────────────────────────────────────────────────
      case 'emergency':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Emergency Services</h2>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl cursor-pointer hover:bg-red-600 transition-colors active:scale-95" onClick={() => { navigate('/emergency'); }}>
                <Phone size={36} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Emergency SOS</h3>
              <p className="text-red-600 text-sm mb-4">Click to go to emergency page and dispatch ambulance</p>
              <button onClick={() => navigate('/emergency')} className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors">
                Go to Emergency Page
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <a href="tel:108" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-red-200 hover:bg-red-50 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">108</p>
                  <p className="text-xs text-slate-500">National Ambulance</p>
                </div>
              </a>
              <a href="tel:112" className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 hover:bg-amber-50 transition-colors">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">112</p>
                  <p className="text-xs text-slate-500">Emergency Services</p>
                </div>
              </a>
            </div>
          </div>
        );

      // ── NOTIFICATIONS ─────────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Notifications</h2>
            <div className="space-y-3">
              {mockNotifications.map(n => (
                <div key={n.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${!n.read ? 'border-sky-200 bg-sky-50/30' : 'border-slate-100'}`}>
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${!n.read ? 'bg-sky-500' : 'bg-slate-300'}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{n.title}</p>
                    <p className="text-slate-600 text-sm mt-1">{n.message}</p>
                    <p className="text-slate-400 text-xs mt-2">{n.time}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${
                    n.type === 'appointment' ? 'bg-sky-100 text-sky-700' :
                    n.type === 'lab' ? 'bg-purple-100 text-purple-700' :
                    n.type === 'payment' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{n.type}</span>
                </div>
              ))}
            </div>
          </div>
        );

      // ── PROFILE ───────────────────────────────────────────────────────────
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">My Profile</h2>
              <button onClick={() => setEditProfile(!editProfile)} className="flex items-center gap-2 px-4 py-2 border border-sky-200 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-50">
                {editProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-6 mb-6">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-sky-100" />
                ) : (
                  <div className="w-20 h-20 bg-sky-100 rounded-2xl flex items-center justify-center">
                    <User size={32} className="text-sky-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                  <p className="text-sky-600 text-sm capitalize">{user?.role}</p>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                </div>
              </div>
              {editProfile ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text' },
                    { key: 'phone', label: 'Phone Number', type: 'tel' },
                    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                    { key: 'gender', label: 'Gender', type: 'text' },
                    { key: 'bloodGroup', label: 'Blood Group', type: 'text' },
                    { key: 'address', label: 'Address', type: 'text' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">{field.label}</label>
                      <input
                        type={field.type}
                        value={(profileForm as Record<string, string>)[field.key]}
                        onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 flex gap-3 mt-2">
                    <button onClick={() => setEditProfile(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm">Cancel</button>
                    <button onClick={saveProfile} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Phone', value: user?.phone || 'Not added' },
                    { label: 'Date of Birth', value: user?.dateOfBirth || 'Not added' },
                    { label: 'Gender', value: user?.gender || 'Not added' },
                    { label: 'Blood Group', value: user?.bloodGroup || 'Not added' },
                    { label: 'Address', value: user?.address || 'Not added' },
                    { label: 'Member Since', value: new Date(user?.createdAt || '').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-slate-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Health Vitals Snapshot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Blood Pressure', value: '122/80 mmHg', status: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Blood Sugar', value: '142 mg/dL', status: 'Monitor', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'BMI', value: '23.4', status: 'Healthy', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'HbA1c', value: '7.8%', status: 'High', color: 'text-red-500', bg: 'bg-red-50' },
                ].map(h => (
                  <div key={h.label} className={`${h.bg} rounded-xl p-3`}>
                    <p className="text-xs text-slate-500 mb-1">{h.label}</p>
                    <p className={`font-bold ${h.color}`}>{h.value}</p>
                    <p className={`text-xs font-medium ${h.color}`}>{h.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // ── OVERVIEW (default) ────────────────────────────────────────────────
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-1">Good morning, {user?.name?.split(' ')[0]}!</h2>
              <p className="text-sky-100 text-sm">You have {upcomingAppts.length} upcoming appointments this week.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => navigate('/doctors')} className="px-4 py-2 bg-white text-sky-600 rounded-xl text-sm font-semibold hover:bg-sky-50">Book Appointment</button>
                <button onClick={() => navigate('/telemedicine')} className="px-4 py-2 bg-sky-500/30 border border-white/30 text-white rounded-xl text-sm font-semibold hover:bg-sky-500/50">Video Consult</button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Appointments', value: patientAppointments.length, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50', section: 'appointments' as Section },
                { label: 'Health Records', value: medicalRecords.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', section: 'records' as Section },
                { label: 'Active Rx', value: 2, icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50', section: 'prescriptions' as Section },
                { label: 'Lab Orders', value: myLabOrders.length, icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-50', section: 'labs' as Section },
              ].map(stat => (
                <button key={stat.label} onClick={() => setActiveSection(stat.section)} className="stat-card flex items-center gap-4 hover:border-sky-200 transition-colors text-left">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">Upcoming Appointments</h3>
                  <button onClick={() => setActiveSection('appointments')} className="text-sky-600 text-xs font-medium hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
                </div>
                <div className="divide-y divide-slate-50">
                  {upcomingAppts.slice(0, 3).map(apt => {
                    const doc = doctors.find(d => d.id === apt.doctorId);
                    return (
                      <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                        {doc && <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm">{apt.doctorName}</p>
                          <p className="text-sky-500 text-xs">{apt.doctorSpecialty}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-slate-700">{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-slate-400">{apt.time}</p>
                          {apt.type === 'telemedicine' && (
                            <button onClick={() => navigate('/telemedicine')} className="mt-1 flex items-center gap-1 text-xs text-sky-600 hover:underline">
                              <Video size={10} /> Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {upcomingAppts.length === 0 && (
                    <div className="p-8 text-center">
                      <Calendar size={32} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">Health Snapshot</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Blood Pressure', value: '122/80', status: 'Normal', color: 'text-emerald-600' },
                      { label: 'Blood Sugar', value: '142 mg/dL', status: 'Monitor', color: 'text-amber-600' },
                      { label: 'BMI', value: '23.4', status: 'Healthy', color: 'text-emerald-600' },
                      { label: 'HbA1c', value: '7.8%', status: 'High', color: 'text-red-500' },
                    ].map(h => (
                      <div key={h.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">{h.label}</p>
                          <p className="font-semibold text-slate-800 text-sm">{h.value}</p>
                        </div>
                        <span className={`text-xs font-medium ${h.color}`}>{h.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-800 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Find Doctor', icon: User, action: () => navigate('/doctors'), color: 'bg-sky-50 text-sky-600' },
                      { label: 'Video Call', icon: Video, action: () => navigate('/telemedicine'), color: 'bg-purple-50 text-purple-600' },
                      { label: 'Lab Test', icon: FlaskConical, action: () => navigate('/labs'), color: 'bg-amber-50 text-amber-600' },
                      { label: 'Emergency', icon: Phone, action: () => navigate('/emergency'), color: 'bg-red-50 text-red-600' },
                    ].map(a => (
                      <button key={a.label} onClick={a.action} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${a.color} hover:opacity-80 transition-all`}>
                        <a.icon size={18} />
                        <span className="text-xs font-medium">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-white text-lg font-sora">Medi<span className="text-sky-400">Wave</span></span>
          )}
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className={`p-4 border-b border-slate-800 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-700" />
        ) : (
          <div className="w-10 h-10 bg-sky-700 rounded-xl flex items-center justify-center shrink-0">
            <User size={18} className="text-sky-300" />
          </div>
        )}
        {!sidebarCollapsed && (
          <div className="mt-2">
            <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
            <p className="text-sky-400 text-xs capitalize">{user?.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
              activeSection === item.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? item.label : ''}
          >
            <item.icon size={18} className="shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 space-y-1 border-t border-slate-800">
        <button onClick={() => navigate('/')} className={`w-full flex items-center gap-2 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Home size={16} className="shrink-0" />
          {!sidebarCollapsed && 'Back to Site'}
        </button>
        <button onClick={() => { logout(); navigate('/'); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={16} className="shrink-0" />
          {!sidebarCollapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 fixed left-0 top-0 bottom-0 flex flex-col z-40 hidden lg:flex transition-all duration-300`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} flex-1 min-w-0 transition-all duration-300`}>
        <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <Menu size={20} />
              </button>
              <h1 className="font-bold text-slate-800 text-lg capitalize">
                {activeSection === 'overview' ? 'Patient Dashboard' :
                 sidebarItems.find(i => i.id === activeSection)?.label || activeSection}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveSection('notifications')} className="relative p-2">
                <Bell size={20} className="text-slate-500" />
                {mockNotifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {mockNotifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              {user?.avatar && <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
      </div>

      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.6)' }} onClick={() => setClaimModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Submit Insurance Claim</h3>
                <p className="text-xs text-slate-500 mt-0.5">Upload simulation, claim tracking, and mock insurer review</p>
              </div>
              <button onClick={() => setClaimModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-700">Policy
                  <select value={claimForm.policy} onChange={e => setClaimForm(f => ({ ...f, policy: e.target.value, insurer: e.target.value === 'MediWave Plus' ? 'ICICI Lombard' : 'HDFC ERGO' }))} className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm">
                    <option>MediWave Plus</option>
                    <option>Family Shield Gold</option>
                    <option>Corporate Health Cover</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">Hospital
                  <select value={claimForm.hospital} onChange={e => setClaimForm(f => ({ ...f, hospital: e.target.value }))} className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm">
                    <option>Apollo Hospitals</option>
                    <option>Fortis Hospital</option>
                    <option>MediWave Diagnostics</option>
                    <option>Max Super Specialty</option>
                  </select>
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-sm font-medium text-slate-700">Treatment / Reason
                  <input value={claimForm.treatment} onChange={e => setClaimForm(f => ({ ...f, treatment: e.target.value }))} placeholder="e.g. Cardiology consultation and tests" className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </label>
                <label className="text-sm font-medium text-slate-700">Claim Amount
                  <input type="text" inputMode="numeric" value={claimForm.amount} onChange={e => setClaimForm(f => ({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') }))} placeholder="12400" className="mt-1 w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Upload Documents Simulation</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {['Final bill', 'Discharge summary', 'Prescription', 'Lab report', 'ID proof', 'Payment receipt'].map(doc => (
                    <label key={doc} className={`px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer ${claimForm.documents.includes(doc) ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600'}`}>
                      <input type="checkbox" className="mr-2 accent-sky-600" checked={claimForm.documents.includes(doc)} onChange={e => setClaimForm(f => ({ ...f, documents: e.target.checked ? [...f.documents, doc] : f.documents.filter(d => d !== doc) }))} />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700">
                Status flow after submit: Submitted, Under review, Approved or Rejected. This demo keeps data in shared mock state.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setClaimModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={submitClaim} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Submit Claim</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal doctor={bookingDoctor} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
