import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { mockAppointments } from '@/data/mockData';
import {
  Calendar, Users, Video, Clock, FileText, Star, Activity, DollarSign,
  ChevronLeft, ChevronRight, Plus, Search, User, Phone, MessageCircle, X, Send,
  TrendingUp, Home, Bell, LogOut, Pill, CheckCircle, Menu, FlaskConical
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import VideoCallInterface from '@/components/features/VideoCallInterface';
import { generateReport } from '@/lib/reportGenerator';

type Section = 'overview' | 'appointments' | 'patients' | 'telemedicine' | 'prescriptions' | 'earnings' | 'schedule' | 'profile';

const mockPatients = [
  { id: 'p1', name: 'John Smith', age: 38, condition: 'Hypertension & Diabetes', lastVisit: '2026-05-18', nextVisit: '2026-06-15', bloodGroup: 'O+', phone: '+91 98765 43210', status: 'Active' },
  { id: 'p2', name: 'Sunita Patel', age: 45, condition: 'Thyroid Disorder', lastVisit: '2026-05-10', nextVisit: '2026-06-10', bloodGroup: 'A+', phone: '+91 87654 32109', status: 'Active' },
  { id: 'p3', name: 'Ravi Kumar', age: 52, condition: 'Chronic Heart Disease', lastVisit: '2026-05-05', nextVisit: '2026-05-25', bloodGroup: 'B-', phone: '+91 76543 21098', status: 'Critical' },
  { id: 'p4', name: 'Anita Singh', age: 29, condition: 'PCOS Management', lastVisit: '2026-04-28', nextVisit: '2026-06-20', bloodGroup: 'AB+', phone: '+91 65432 10987', status: 'Stable' },
  { id: 'p5', name: 'Deepak Nambiar', age: 61, condition: 'Post-Op Cardiac Care', lastVisit: '2026-05-15', nextVisit: '2026-05-29', bloodGroup: 'O-', phone: '+91 54321 09876', status: 'Active' },
  { id: 'p6', name: 'Priya Mehta', age: 34, condition: 'Anxiety & Depression', lastVisit: '2026-05-12', nextVisit: '2026-06-02', bloodGroup: 'A-', phone: '+91 43210 98765', status: 'Stable' },
];

const earningsData = [
  { month: 'Dec', consultations: 124, amount: 76800 },
  { month: 'Jan', consultations: 138, amount: 88200 },
  { month: 'Feb', consultations: 112, amount: 72400 },
  { month: 'Mar', consultations: 156, amount: 98600 },
  { month: 'Apr', consultations: 142, amount: 91800 },
  { month: 'May', consultations: 168, amount: 112400 },
];

const mockPrescriptions = [
  {
    id: 'rx1', patientName: 'John Smith', date: '2026-05-18', diagnosis: 'Type 2 Diabetes', status: 'Active',
    medicines: [
      { name: 'Metformin 500mg', dosage: '1 twice daily', duration: '3 months', instructions: 'With meals' },
      { name: 'Januvia 50mg', dosage: '1 once daily', duration: '3 months', instructions: 'Morning' },
    ],
    notes: 'Monitor HbA1c in 3 months. Diet control essential.',
  },
  {
    id: 'rx2', patientName: 'Sunita Patel', date: '2026-05-10', diagnosis: 'Hypothyroidism', status: 'Active',
    medicines: [
      { name: 'Thyroxine 50mcg', dosage: '1 once daily', duration: '6 months', instructions: 'Empty stomach' },
    ],
    notes: 'TSH retest in 6 weeks.',
  },
  {
    id: 'rx3', patientName: 'Ravi Kumar', date: '2026-05-05', diagnosis: 'Coronary Artery Disease', status: 'Active',
    medicines: [
      { name: 'Aspirin 75mg', dosage: '1 once daily', duration: 'Ongoing', instructions: 'After breakfast' },
      { name: 'Atorvastatin 40mg', dosage: '1 at bedtime', duration: 'Ongoing', instructions: 'Night' },
      { name: 'Bisoprolol 5mg', dosage: '1 once daily', duration: 'Ongoing', instructions: 'Morning' },
    ],
    notes: 'Avoid strenuous activity. Follow low-fat diet.',
  },
];

const scheduleSlots = [
  { time: '09:00 AM', patient: 'John Smith', type: 'Video', status: 'confirmed' },
  { time: '10:00 AM', patient: 'Sunita Patel', type: 'In-Person', status: 'confirmed' },
  { time: '11:00 AM', patient: null, type: '', status: 'available' },
  { time: '12:00 PM', patient: null, type: '', status: 'blocked' },
  { time: '02:00 PM', patient: 'Ravi Kumar', type: 'Video', status: 'confirmed' },
  { time: '03:00 PM', patient: 'Anita Singh', type: 'In-Person', status: 'confirmed' },
  { time: '04:00 PM', patient: null, type: '', status: 'available' },
  { time: '05:00 PM', patient: 'Deepak Nambiar', type: 'Video', status: 'confirmed' },
];

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const { appointments, labOrders } = useAppData();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<typeof mockPrescriptions[0] | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [inVideoCall, setInVideoCall] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'John Smith', content: 'Good morning Doctor. I have been having chest tightness since yesterday.', time: '10:02 AM', mine: false },
    { id: '2', sender: 'You', content: 'Good morning John. I can see your ECG from last week — it looked normal. Is the tightness constant or comes and goes?', time: '10:03 AM', mine: true },
    { id: '3', sender: 'John Smith', content: 'It comes and goes. Mostly during stress or after climbing stairs.', time: '10:04 AM', mine: false },
  ]);

  const todayAppts = appointments.filter(a => a.status === 'scheduled').slice(0, 4);
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const filteredPatients = mockPatients.filter(p =>
    !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.condition.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: 'You', content: chatInput, time: 'Now', mine: true }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'John Smith',
        content: 'Thank you doctor. Should I come in for an in-person visit?',
        time: 'Now',
        mine: false,
      }]);
    }, 1500);
  };

  const sidebarNav: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'telemedicine', label: 'Video Consults', icon: Video },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'schedule', label: 'My Schedule', icon: Clock },
    { id: 'profile', label: 'Doctor Profile', icon: User },
  ];

  const renderContent = () => {
    if (inVideoCall) {
      return (
        <div className="fixed inset-0 z-50 bg-slate-900 p-4 flex flex-col" style={{ left: sidebarCollapsed ? 64 : 256 }}>
          <VideoCallInterface
            doctorName="Dr. Sarah Mitchell"
            doctorAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            doctorSpecialty="Patient"
            patientName="John Smith"
            isDoctor={true}
            onEnd={() => setInVideoCall(false)}
          />
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Patients", value: '8', icon: Users, change: '+2 from avg', color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'Pending Consults', value: todayAppts.filter(a => a.type === 'telemedicine').length.toString(), icon: Clock, change: 'Video calls today', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Monthly Revenue', value: '₹1,12,400', icon: DollarSign, change: '+18% vs last month', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Avg Rating', value: '4.9', icon: Star, change: '1,247 total reviews', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(stat => (
                <div key={stat.label} className="stat-card">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                  <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 flex-1">Today's Appointments</h3>
                  {(['today', 'upcoming', 'completed'] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${activeTab === t ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="divide-y divide-slate-50">
                  {(activeTab === 'completed' ? completedAppts : todayAppts).slice(0, 4).map(apt => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                      <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 font-bold text-sm shrink-0">
                        {apt.patientName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{apt.patientName}</p>
                        <p className="text-xs text-slate-500 truncate">{apt.symptoms || 'General consultation'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-slate-700">{apt.time}</p>
                        {apt.type === 'telemedicine' ? (
                          <button onClick={() => setInVideoCall(true)} className="flex items-center gap-1 text-sky-600 text-xs hover:underline mt-0.5">
                            <Video size={10} /> Join Call
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">In-person</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(activeTab === 'completed' ? completedAppts : todayAppts).length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">No appointments</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="font-semibold text-slate-800 mb-4">Appointment Types</h4>
                  {[
                    { label: 'Video Consults', pct: 58, color: 'bg-sky-500' },
                    { label: 'In-Person', pct: 42, color: 'bg-emerald-500' },
                  ].map(t => (
                    <div key={t.label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{t.label}</span><span className="font-medium">{t.pct}%</span></div>
                      <div className="h-2 bg-slate-100 rounded-full"><div className={`h-full ${t.color} rounded-full`} style={{ width: `${t.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="font-semibold text-slate-800 mb-3">Revenue Trend</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={earningsData}>
                      <Line type="monotone" dataKey="amount" stroke="#0284C7" strokeWidth={2} dot={false} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Recent Lab Requests</h3>
                <span className="text-xs text-slate-400">{labOrders.length} synced orders</span>
              </div>
              <div className="divide-y divide-slate-50">
                {labOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                      <FlaskConical size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{order.patient}</p>
                      <p className="text-xs text-slate-500 truncate">{order.test}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{order.date}</p>
                      <span className={`text-xs capitalize ${order.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-slate-800 text-xl">Appointment Management</h2>
              <div className="flex gap-2">
                {(['today', 'upcoming', 'completed'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize ${activeTab === t ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {(activeTab === 'completed' ? completedAppts : appointments.filter(a => a.status === 'scheduled')).map(apt => (
                <div key={apt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center font-bold text-sky-700 text-sm shrink-0">
                      {apt.patientName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-slate-800">{apt.patientName}</h3>
                          <p className="text-xs text-slate-500">{apt.symptoms || 'General consultation'}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          apt.status === 'scheduled' ? 'bg-sky-100 text-sky-700' :
                          apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>{apt.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={11} className="text-sky-400" />{new Date(apt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span>{apt.time}</span>
                        <span>{apt.type === 'telemedicine' ? 'Video Call' : 'In-Person'}</span>
                        <span className="text-emerald-600 font-medium">₹{apt.fee} ({apt.paymentStatus})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    {apt.type === 'telemedicine' && apt.status === 'scheduled' && (
                      <button onClick={() => setInVideoCall(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700">
                        <Video size={13} /> Join Call
                      </button>
                    )}
                    <button onClick={() => { const p = mockPatients.find(pt => pt.name === apt.patientName); if (p) { setSelectedPatient(p); setActiveSection('patients'); } }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50">
                      <User size={13} /> Patient Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-slate-800 text-xl">My Patients</h2>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <Search size={14} className="text-slate-400" />
                <input type="text" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search patients..." className="flex-1 text-xs focus:outline-none" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPatients.map(patient => (
                <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:border-sky-200 transition-colors" onClick={() => setSelectedPatient(patient)}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center font-bold text-sky-700 text-sm shrink-0">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{patient.name}</h3>
                          <p className="text-xs text-slate-500">{patient.age} yrs · {patient.bloodGroup}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          patient.status === 'Critical' ? 'bg-red-100 text-red-600' :
                          patient.status === 'Active' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>{patient.status}</span>
                      </div>
                      <p className="text-xs text-sky-600 mt-1">{patient.condition}</p>
                      <div className="flex gap-3 mt-2 text-xs text-slate-400">
                        <span>Last: {new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span>Next: {new Date(patient.nextVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-xs font-medium hover:bg-sky-100" onClick={e => { e.stopPropagation(); }}>
                      <Phone size={11} /> Call
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium hover:bg-emerald-100" onClick={e => { e.stopPropagation(); setActiveSection('telemedicine'); }}>
                      <MessageCircle size={11} /> Message
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-xs font-medium hover:bg-purple-100" onClick={e => { e.stopPropagation(); }}>
                      <FileText size={11} /> Records
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {selectedPatient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.6)' }} onClick={() => setSelectedPatient(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Patient Profile</h3>
                    <button onClick={() => setSelectedPatient(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center font-bold text-sky-700 text-xl">
                        {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{selectedPatient.name}</h4>
                        <p className="text-sky-600 text-sm">{selectedPatient.condition}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          selectedPatient.status === 'Critical' ? 'bg-red-100 text-red-600' :
                          selectedPatient.status === 'Active' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>{selectedPatient.status}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Age', value: `${selectedPatient.age} years` },
                        { label: 'Blood Group', value: selectedPatient.bloodGroup },
                        { label: 'Phone', value: selectedPatient.phone },
                        { label: 'Last Visit', value: new Date(selectedPatient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                        { label: 'Next Appointment', value: new Date(selectedPatient.nextVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                        { label: 'Status', value: selectedPatient.status },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                          <p className="text-sm font-medium text-slate-800">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedPatient(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                      <button onClick={() => { setSelectedPatient(null); setInVideoCall(true); }} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                        Start Video Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'telemedicine':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Video Consultations</h2>
              <button onClick={() => setInVideoCall(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                <Video size={16} /> Start Call
              </button>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Waiting Room ({appointments.filter(a => a.type === 'telemedicine' && a.status === 'scheduled').length})
                  </h4>
                  <div className="space-y-3">
                    {appointments.filter(a => a.type === 'telemedicine' && a.status === 'scheduled').slice(0, 3).map(apt => (
                      <div key={apt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center font-bold text-sky-700 text-xs shrink-0">
                          {apt.patientName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{apt.patientName}</p>
                          <p className="text-xs text-slate-400">{apt.time}</p>
                        </div>
                        <button onClick={() => setInVideoCall(true)} className="px-2.5 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-medium">Join</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="font-semibold text-slate-800 mb-3">Call Stats Today</h4>
                  {[
                    { label: 'Calls Completed', value: '8', color: 'text-sky-600' },
                    { label: 'Avg Duration', value: '18 min', color: 'text-emerald-600' },
                    { label: 'Satisfaction', value: '4.9/5', color: 'text-amber-600' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-600">{s.label}</span>
                      <span className={`font-bold text-sm ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 500 }}>
                <div className="flex items-center gap-3 p-4 bg-slate-800 text-white">
                  <div className="w-8 h-8 bg-sky-600 rounded-xl flex items-center justify-center text-xs font-bold">JS</div>
                  <div>
                    <p className="font-semibold text-sm">John Smith</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-slate-400">Active consultation chat</span>
                    </div>
                  </div>
                  <button onClick={() => setInVideoCall(true)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700">
                    <Video size={12} /> Start Video
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.mine ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${msg.mine ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {msg.mine ? 'Dr' : 'P'}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.mine ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100 flex gap-2">
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Type a message to patient..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button onClick={sendChat} className="p-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700"><Send size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Prescriptions</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
                <Plus size={16} /> New Prescription
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {mockPrescriptions.map(rx => (
                <div key={rx.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 cursor-pointer hover:border-sky-200" onClick={() => setSelectedPrescription(rx)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{rx.patientName}</h3>
                      <p className="text-sky-600 text-sm">{rx.diagnosis}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium">{rx.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <div className="space-y-1.5">
                    {rx.medicines.slice(0, 2).map((med, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Pill size={11} className="text-sky-500 shrink-0" />
                        <span className="text-slate-600">{med.name} — {med.dosage}</span>
                      </div>
                    ))}
                    {rx.medicines.length > 2 && <p className="text-xs text-sky-600">+{rx.medicines.length - 2} more medicines</p>}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                    <button onClick={e => { e.stopPropagation(); generateReport('prescription', { prescription: rx }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-xs font-medium hover:bg-sky-100">
                      Download PDF
                    </button>
                    <button onClick={e => { e.stopPropagation(); setSelectedPrescription(rx); }} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50">
                      View Full
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {selectedPrescription && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.6)' }} onClick={() => setSelectedPrescription(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Prescription Details</h3>
                    <button onClick={() => setSelectedPrescription(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="bg-sky-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{selectedPrescription.patientName}</p>
                        <p className="text-sky-600 text-sm">{selectedPrescription.diagnosis}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Date</p>
                        <p className="text-sm font-medium text-slate-700">{new Date(selectedPrescription.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 text-sm mb-3">Prescribed Medicines</h4>
                      <div className="space-y-3">
                        {selectedPrescription.medicines.map((med, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Pill size={14} className="text-sky-500" />
                              <p className="font-semibold text-slate-800 text-sm">{med.name}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mt-1">
                              <span>Dose: {med.dosage}</span>
                              <span>Duration: {med.duration}</span>
                              <span>{med.instructions}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedPrescription.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Doctor Notes</p>
                        <p className="text-xs text-amber-600">{selectedPrescription.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedPrescription(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                      <button onClick={() => generateReport('prescription', { prescription: selectedPrescription })} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Download PDF</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'earnings':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Earnings & Revenue</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'This Month', value: '₹1,12,400', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+18%' },
                { label: 'Consultations', value: '168', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50', change: 'This month' },
                { label: 'Video Calls', value: '97', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', change: '58% of total' },
                { label: 'Avg per Consult', value: '₹669', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', change: '+₹45' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}><s.icon size={20} className={s.color} /></div>
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                  <p className={`text-xs mt-1 ${s.color}`}>{s.change}</p>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Revenue by Month</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={earningsData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="amount" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100"><h4 className="font-semibold text-slate-800">Monthly Breakdown</h4></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                      <th className="px-4 py-3 text-left">Month</th>
                      <th className="px-4 py-3 text-left">Consults</th>
                      <th className="px-4 py-3 text-left">Revenue</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {earningsData.map(row => (
                        <tr key={row.month} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{row.month} 2026</td>
                          <td className="px-4 py-3 text-slate-600">{row.consultations}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">₹{row.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">My Schedule — Today</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
            <div className="space-y-3">
              {scheduleSlots.map((slot, i) => (
                <div key={i} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${
                  slot.status === 'blocked' ? 'border-slate-100 opacity-50' :
                  slot.status === 'available' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'
                }`}>
                  <div className="w-20 shrink-0 text-center">
                    <p className="font-bold text-slate-800 text-sm">{slot.time}</p>
                    <p className={`text-xs ${slot.status === 'available' ? 'text-emerald-600' : slot.status === 'blocked' ? 'text-slate-400' : 'text-sky-600'}`}>
                      {slot.status === 'available' ? 'Free' : slot.status === 'blocked' ? 'Blocked' : 'Booked'}
                    </p>
                  </div>
                  <div className="flex-1">
                    {slot.patient ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center text-sky-700 font-bold text-xs shrink-0">
                          {slot.patient.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{slot.patient}</p>
                          <p className="text-xs text-slate-400">{slot.type} consultation</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">{slot.status === 'blocked' ? 'Lunch / Break' : 'No appointment'}</p>
                    )}
                  </div>
                  {slot.type === 'Video' && slot.status === 'confirmed' && (
                    <button onClick={() => setInVideoCall(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700 shrink-0">
                      <Video size={12} /> Join
                    </button>
                  )}
                  {slot.status === 'available' && (
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full font-medium shrink-0">Available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Doctor Profile</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-6 mb-6">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-sky-100" />
                ) : (
                  <div className="w-24 h-24 bg-sky-100 rounded-2xl flex items-center justify-center">
                    <User size={40} className="text-sky-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{user?.name}</h3>
                  <p className="text-sky-600">Cardiologist · Apollo Hospitals, Mumbai</p>
                  <p className="text-slate-400 text-sm">Reg. No: MCI-2014-0456</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= 4 ? 'text-amber-400 fill-amber-400' : 'text-amber-300 fill-amber-100'} />)}
                    <span className="text-sm font-medium text-slate-700 ml-1">4.9 (1,247 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Specialty', value: 'Cardiology & Interventional Cardiology' },
                  { label: 'Experience', value: '12 years' },
                  { label: 'Qualifications', value: 'MBBS, MD (Cardiology), DM' },
                  { label: 'Languages', value: 'English, Hindi, Marathi' },
                  { label: 'Consultation Fee', value: '₹800 (Video) / ₹1,200 (In-Person)' },
                  { label: 'Total Patients', value: '4,247' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!sidebarCollapsed && <span className="font-bold text-white text-lg font-sora">Medi<span className="text-sky-400">Wave</span></span>}
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className={`p-4 border-b border-slate-800 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover border-2 border-slate-700" />
        ) : (
          <div className="w-10 h-10 bg-sky-700 rounded-xl flex items-center justify-center"><User size={18} className="text-sky-300" /></div>
        )}
        {!sidebarCollapsed && (
          <div className="mt-2">
            <p className="font-semibold text-white text-sm">{user?.name}</p>
            <p className="text-sky-400 text-xs">Doctor</p>
            <button onClick={() => setIsAvailable(!isAvailable)}
              className={`mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isAvailable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isAvailable ? 'Available' : 'Busy'}
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {sidebarNav.map(item => (
          <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${activeSection === item.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? item.label : ''}>
            <item.icon size={18} className="shrink-0" />
            {!sidebarCollapsed && item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 space-y-1 border-t border-slate-800">
        <button onClick={() => navigate('/')} className={`w-full flex items-center gap-2 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Home size={16} className="shrink-0" />{!sidebarCollapsed && 'Back to Site'}
        </button>
        <button onClick={() => { logout(); navigate('/'); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-xl text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <LogOut size={16} className="shrink-0" />{!sidebarCollapsed && 'Logout'}
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

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col"><SidebarContent /></div>
        </div>
      )}

      <div className={`${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} flex-1 min-w-0 transition-all duration-300`}>
        <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu size={20} /></button>
              <h1 className="font-bold text-slate-800 text-lg capitalize">
                {activeSection === 'overview' ? 'Doctor Dashboard' :
                 sidebarNav.find(i => i.id === activeSection)?.label || activeSection}
              </h1>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isAvailable ? 'Available' : 'Busy'}
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
