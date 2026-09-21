import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { analyticsData } from '@/data/mockData';
import {
  Activity, Users, Calendar, TrendingUp, Shield, Bell,
  DollarSign, FileText, Home, LogOut, User, Plus, Search, CheckCircle,
  AlertTriangle, X, Edit, Trash2, FlaskConical, ChevronLeft, ChevronRight, Menu, Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { generateReport } from '@/lib/reportGenerator';
import { isValidAge, isValidEmail, isValidMobile, isValidName, sanitizeAddress, sanitizeAge, sanitizeEmail, sanitizeMobile, sanitizeName, sanitizeSearch, sanitizeText } from '@/lib/validation';

type Section = 'overview' | 'patients' | 'doctors' | 'appointments' | 'revenue' | 'compliance' | 'reports' | 'emergency' | 'settings';

const COLORS = ['#0284C7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const recentActivity = [
  { action: 'New patient registration', user: 'Priya Sharma', time: '2 min ago', type: 'patient' },
  { action: 'Doctor approved: Dr. Mehta', user: 'Admin', time: '15 min ago', type: 'doctor' },
  { action: 'Lab report flagged', user: 'System', time: '28 min ago', type: 'alert' },
  { action: 'Emergency SOS activated', user: 'Patient #4821', time: '35 min ago', type: 'emergency' },
  { action: 'Insurance claim submitted', user: 'Rajesh Kumar', time: '1 hr ago', type: 'billing' },
  { action: 'New hospital partner added', user: 'Apollo Hospitals', time: '2 hrs ago', type: 'partner' },
];

const adminAppointments = [
  { id: 'A001', patient: 'John Smith', doctor: 'Dr. Sarah Mitchell', department: 'Cardiology', date: '2026-05-20', time: '10:30 AM', type: 'Video', status: 'scheduled', fee: 800 },
  { id: 'A002', patient: 'Sunita Patel', doctor: 'Dr. Ananya Gupta', department: 'Dermatology', date: '2026-05-20', time: '11:00 AM', type: 'In-Person', status: 'completed', fee: 600 },
  { id: 'A003', patient: 'Ravi Kumar', doctor: 'Dr. Vikram Nair', department: 'Cardiology', date: '2026-05-20', time: '12:00 PM', type: 'Video', status: 'scheduled', fee: 1200 },
  { id: 'A004', patient: 'Anita Singh', doctor: 'Dr. Priya Nair', department: 'Gynecology', date: '2026-05-20', time: '02:00 PM', type: 'In-Person', status: 'scheduled', fee: 700 },
  { id: 'A005', patient: 'Deepak Nambiar', doctor: 'Dr. Kiran Rao', department: 'Neurology', date: '2026-05-20', time: '03:30 PM', type: 'Video', status: 'cancelled', fee: 900 },
  { id: 'A006', patient: 'Priya Mehta', doctor: 'Dr. Arun Mehta', department: 'Endocrinology', date: '2026-05-19', time: '09:00 AM', type: 'In-Person', status: 'completed', fee: 750 },
];

const revenueBreakdown = [
  { department: 'Cardiology', revenue: 840000, appointments: 420, growth: '+22%' },
  { department: 'Gynecology', revenue: 620000, appointments: 380, growth: '+15%' },
  { department: 'Pediatrics', revenue: 540000, appointments: 510, growth: '+18%' },
  { department: 'Dermatology', revenue: 380000, appointments: 290, growth: '+12%' },
  { department: 'Neurology', revenue: 720000, appointments: 310, growth: '+28%' },
];

const auditLogs = [
  { id: 'LOG001', user: 'admin@mediwave.health', action: 'Doctor account created', resource: 'Dr. Ramesh Gupta', time: '2026-05-18 09:12', ip: '192.168.1.100', status: 'success' },
  { id: 'LOG002', user: 'doctor@mediwave.health', action: 'Patient record accessed', resource: 'Patient #p1', time: '2026-05-18 10:30', ip: '103.24.56.78', status: 'success' },
  { id: 'LOG003', user: 'pharmacy@mediwave.health', action: 'Prescription dispensed', resource: 'RX-20260518-001', time: '2026-05-18 11:45', ip: '192.168.1.102', status: 'success' },
  { id: 'LOG004', user: 'unknown@domain.com', action: 'Login attempt failed', resource: 'Admin Panel', time: '2026-05-18 13:22', ip: '45.123.67.89', status: 'failed' },
  { id: 'LOG005', user: 'lab@mediwave.health', action: 'Report uploaded', resource: 'LB001', time: '2026-05-18 14:00', ip: '192.168.1.105', status: 'success' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { doctors: doctorList, patients: patientList, appointments, labOrders, addDoctor, deleteDoctor, addPatient, deletePatient } = useAppData();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [search, setSearch] = useState('');
  const [addDoctorModal, setAddDoctorModal] = useState(false);
  const [addPatientModal, setAddPatientModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [apptFilter, setApptFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', hospital: '', experience: '', registrationNo: '' });
  const [newPatient, setNewPatient] = useState({ name: '', age: '', email: '', phone: '', condition: '', bloodGroup: '' });

  const stats = [
    { label: 'Total Patients', value: patientList.length.toLocaleString(), change: '+12.5%', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Active Doctors', value: doctorList.filter(d => d.available).length.toString(), change: '+3', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Appointments Today', value: appointments.filter(a => a.status === 'scheduled').length.toString(), change: '+8%', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Monthly Revenue', value: '₹22.4L', change: '+18.2%', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Telemedicine', value: '1,248', change: '+22%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Lab Orders', value: labOrders.length.toString(), change: '+7%', icon: FlaskConical, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const filteredPatients = patientList.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDoctors = doctorList.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAppts = appointments.filter(a => apptFilter === 'all' || a.status === apptFilter);

  const sidebarNav: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleAddDoctor = () => {
    if (!isValidName(newDoctor.name)) { toast.error('Doctor name must contain only alphabets and spaces'); return; }
    if (!newDoctor.specialty.trim()) { toast.error('Specialty is required'); return; }
    addDoctor({
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      subSpecialty: '',
      qualification: 'MBBS, MD',
      experience: parseInt(newDoctor.experience) || 5,
      rating: 4.5,
      reviewCount: 0,
      consultationFee: 800,
      languages: ['English', 'Hindi'],
      hospital: newDoctor.hospital || 'MediWave Hospital',
      location: 'Mumbai',
      avatar: '/avatars/dr-vikram.svg',
      available: true,
      availableSlots: ['10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      bio: 'Experienced specialist with a focus on patient-centered care.',
      patients: 0,
      registrationNo: newDoctor.registrationNo || 'MCI-2024-0001',
      nextAvailable: 'Today',
      tags: [newDoctor.specialty],
      telemedicineEnabled: true,
    });
    setNewDoctor({ name: '', specialty: '', hospital: '', experience: '', registrationNo: '' });
    setAddDoctorModal(false);
  };

  const handleAddPatient = () => {
    if (!isValidName(newPatient.name)) { toast.error('Patient name must contain only alphabets and spaces'); return; }
    if (!isValidAge(newPatient.age, 0, 120)) { toast.error('Enter a valid age'); return; }
    if (!isValidEmail(newPatient.email)) { toast.error('Enter a valid email address'); return; }
    if (newPatient.phone && !isValidMobile(newPatient.phone)) { toast.error('Mobile number must be exactly 10 digits'); return; }
    addPatient({
      name: newPatient.name,
      age: parseInt(newPatient.age) || 30,
      email: newPatient.email,
      phone: newPatient.phone,
      status: 'Active',
      lastVisit: new Date().toISOString().split('T')[0],
      condition: newPatient.condition || 'General',
      bloodGroup: newPatient.bloodGroup,
    });
    setNewPatient({ name: '', age: '', email: '', phone: '', condition: '', bloodGroup: '' });
    setAddPatientModal(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map(stat => (
                <div key={stat.label} className="stat-card flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-slate-500 text-xs">{stat.label}</p>
                    <p className="text-emerald-600 text-xs font-medium mt-0.5">{stat.change} this month</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Monthly Appointments</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.appointmentsByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [v, 'Appointments']} />
                    <Bar dataKey="value" fill="#0284C7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analyticsData.revenueByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v: number) => [`₹${(v / 100000).toFixed(1)}L`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Patients by Specialty</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={analyticsData.patientsBySpecialty} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {analyticsData.patientsBySpecialty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {analyticsData.patientsBySpecialty.slice(0, 4).map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-slate-600 flex-1">{item.name}</span>
                      <span className="font-medium text-slate-800">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Recent Activity</h3></div>
                <div className="divide-y divide-slate-50">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        activity.type === 'patient' ? 'bg-sky-100' : activity.type === 'doctor' ? 'bg-emerald-100' :
                        activity.type === 'alert' ? 'bg-amber-100' : activity.type === 'emergency' ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        {activity.type === 'patient' ? <Users size={16} className="text-sky-600" /> :
                         activity.type === 'doctor' ? <User size={16} className="text-emerald-600" /> :
                         activity.type === 'alert' ? <AlertTriangle size={16} className="text-amber-600" /> :
                         activity.type === 'emergency' ? <Activity size={16} className="text-red-600" /> :
                         <FileText size={16} className="text-slate-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.user}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-slate-800 text-xl">Patient Management</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(sanitizeSearch(e.target.value))} placeholder="Search patients..." className="text-xs focus:outline-none w-36" />
                </div>
                <button onClick={() => setAddPatientModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
                  <Plus size={16} /> Add Patient
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                    <th className="px-5 py-3 text-left">Patient</th>
                    <th className="px-5 py-3 text-left">Age</th>
                    <th className="px-5 py-3 text-left">Condition</th>
                    <th className="px-5 py-3 text-left">Last Visit</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPatients.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center font-bold text-sky-700 text-xs shrink-0">{p.name.split(' ').map(n => n[0]).join('')}</div>
                            <div><p className="font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-400">{p.email}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{p.age} yrs</td>
                        <td className="px-5 py-3 text-sky-600 text-xs">{p.condition}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{new Date(p.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            p.status === 'Critical' ? 'bg-red-100 text-red-600' :
                            p.status === 'Active' ? 'bg-sky-100 text-sky-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit size={14} /></button>
                            <button onClick={() => deletePatient(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'doctors':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-slate-800 text-xl">Doctor Management</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(sanitizeSearch(e.target.value))} placeholder="Search doctors..." className="text-xs focus:outline-none w-36" />
                </div>
                <button onClick={() => setAddDoctorModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
                  <Plus size={16} /> Add Doctor
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredDoctors.slice(0, 10).map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
                  <img src={doc.avatar} alt={doc.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{doc.name}</h3>
                        <p className="text-sky-600 text-xs">{doc.specialty}</p>
                        <p className="text-slate-400 text-xs">{doc.hospital}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${doc.available ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {doc.available ? 'Active' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{doc.experience} yrs</span>
                      <span>Rating: {doc.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit size={14} /></button>
                    <button onClick={() => deleteDoctor(doc.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-slate-800 text-xl">Appointment Management</h2>
              <div className="flex gap-2">
                {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(f => (
                  <button key={f} onClick={() => setApptFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize ${apptFilter === f ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-5 py-3 text-left">ID</th>
                    <th className="px-5 py-3 text-left">Patient</th>
                    <th className="px-5 py-3 text-left">Doctor</th>
                    <th className="px-5 py-3 text-left">Department</th>
                    <th className="px-5 py-3 text-left">Date & Time</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Fee</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAppts.map(apt => (
                      <tr key={apt.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 text-xs font-medium text-slate-600">{apt.id}</td>
                        <td className="px-5 py-3 font-medium text-slate-800">{apt.patientName}</td>
                        <td className="px-5 py-3 text-sky-600 text-xs">{apt.doctorName}</td>
                        <td className="px-5 py-3 text-slate-500 text-xs">{apt.doctorSpecialty}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{apt.date} · {apt.time}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${apt.type === 'telemedicine' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{apt.type === 'telemedicine' ? 'Video' : 'In-Person'}</span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-emerald-600">₹{apt.fee}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                            apt.status === 'scheduled' ? 'bg-sky-100 text-sky-700' :
                            apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>{apt.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Revenue & Financial Reports</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Monthly Revenue', value: '₹22.4L', change: '+18.2%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: DollarSign },
                { label: 'Pending Payments', value: '₹3.8L', change: '48 invoices', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
                { label: 'Refunds Processed', value: '₹0.42L', change: '12 refunds', color: 'text-rose-600', bg: 'bg-rose-50', icon: TrendingUp },
                { label: 'Insurance Claims', value: '₹8.2L', change: '83% settled', color: 'text-sky-600', bg: 'bg-sky-50', icon: Shield },
              ].map(s => (
                <div key={s.label} className="stat-card flex items-center gap-4">
                  <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center shrink-0`}><s.icon size={22} className={s.color} /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    <p className="text-slate-500 text-xs">{s.label}</p>
                    <p className={`text-xs mt-0.5 ${s.color}`}>{s.change}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Monthly Revenue Trend</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={analyticsData.revenueByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v: number) => [`₹${(v/100000).toFixed(1)}L`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100"><h4 className="font-semibold text-slate-800">Revenue by Department</h4></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Revenue</th>
                      <th className="px-4 py-3 text-left">Appts</th>
                      <th className="px-4 py-3 text-left">Growth</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {revenueBreakdown.map(row => (
                        <tr key={row.department} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-700">{row.department}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">₹{(row.revenue/100000).toFixed(1)}L</td>
                          <td className="px-4 py-3 text-slate-600">{row.appointments}</td>
                          <td className="px-4 py-3 text-emerald-600 text-xs font-medium">{row.growth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Compliance & Regulatory</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'HIPAA Compliance', status: 'Fully Compliant', icon: Shield, desc: 'Last audit: May 2026. All PHI handling meets HIPAA standards.', color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600' },
                { label: 'DPDP Act (India)', status: 'Certified', icon: CheckCircle, desc: 'Digital Personal Data Protection Act compliance certified June 2026.', color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600' },
                { label: 'Data Encryption', status: 'AES-256 Active', icon: Shield, desc: 'All data encrypted at rest and in transit. E2E for video calls.', color: 'bg-sky-50 border-sky-200', iconColor: 'text-sky-600' },
                { label: 'Medical Licenses', status: 'Valid — Expires Dec 2027', icon: FileText, desc: 'MCI registration and state medical council approvals active.', color: 'bg-sky-50 border-sky-200', iconColor: 'text-sky-600' },
                { label: 'Data Backup', status: 'Daily — 99.9% Uptime', icon: Activity, desc: 'Automated backups every 6 hours. Disaster recovery tested quarterly.', color: 'bg-purple-50 border-purple-200', iconColor: 'text-purple-600' },
                { label: 'Security Audits', status: 'Passed — Q1 2026', icon: Shield, desc: 'External security audit by CertSecure. No critical findings.', color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600' },
              ].map(item => (
                <div key={item.label} className={`rounded-2xl border p-5 ${item.color}`}>
                  <div className="flex items-start gap-3">
                    <item.icon size={22} className={item.iconColor} />
                    <div>
                      <h4 className="font-semibold text-slate-800">{item.label}</h4>
                      <p className={`text-sm font-medium ${item.iconColor} mt-0.5`}>{item.status}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Audit Log</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-4 py-3 text-left">Log ID</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Resource</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs font-medium text-slate-600">{log.id}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{log.user}</td>
                        <td className="px-4 py-3 text-xs text-slate-700">{log.action}</td>
                        <td className="px-4 py-3 text-xs text-sky-600">{log.resource}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{log.time}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{log.ip}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Reports & Analytics</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Patient Registration Report', period: 'May 2026', icon: Users, color: 'bg-sky-50 text-sky-600', data: `${patientList.length} patients registered this month. +12.5% growth. Top age group: 30-45 years.` },
                { label: 'Appointment Analytics', period: 'Q1 2026', icon: Calendar, color: 'bg-emerald-50 text-emerald-600', data: '8,450 appointments. 58% telemedicine. Peak hours: 10 AM - 12 PM. Avg duration: 18 min.' },
                { label: 'Revenue Statement', period: 'May 2026', icon: DollarSign, color: 'bg-purple-50 text-purple-600', data: 'Total: ₹22.4L. Consultations: ₹14.2L. Lab Tests: ₹5.8L. Medicines: ₹2.4L.' },
                { label: 'Doctor Performance', period: 'Monthly', icon: User, color: 'bg-amber-50 text-amber-600', data: 'Top performer: Dr. Sarah Mitchell (168 consults, ₹1.12L). Avg rating: 4.8/5.' },
                { label: 'Lab Test Reports', period: 'Weekly', icon: FlaskConical, color: 'bg-indigo-50 text-indigo-600', data: '892 tests ordered. 71% completed on time. Most booked: CBC (24%), Thyroid (18%).' },
                { label: 'Compliance Audit Trail', period: 'Q1 2026', icon: Shield, color: 'bg-rose-50 text-rose-600', data: '2,840 system access events. 1 suspicious activity flagged. All PHI access logged.' },
              ].map(r => (
                <div key={r.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <r.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm">{r.label}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{r.period}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.data}</p>
                  <button onClick={() => generateReport(r.label.includes('Compliance') ? 'compliance' : r.label.includes('Revenue') ? 'revenue' : r.label.includes('Appointment') ? 'appointmentAnalytics' : 'medical', {
                    reportId: r.label.replace(/\s+/g, '-').toUpperCase(),
                    title: r.label,
                    rows: [['Period', r.period, 'Generated'], ['Summary', r.data, 'Reviewed']],
                    notes: r.data,
                  })} className="mt-3 text-xs text-sky-600 hover:underline font-medium">Download PDF Report</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Emergency Dashboard</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Active SOS Alerts', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Ambulances Dispatched', value: '4', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Avg Response Time', value: '4.8 min', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Resolved Today', value: '18', color: 'text-sky-600', bg: 'bg-sky-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-600 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Active Emergency Cases</h3>
                <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium">2 Active</span>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { id: 'E001', patient: 'Ramesh Kumar', type: 'Cardiac Arrest', status: 'En Route', eta: '3 min', ambulance: 'MH-02-AMP-1234', location: 'Andheri West, Mumbai', priority: 'Critical' },
                  { id: 'E002', patient: 'Deepa Menon', type: 'Road Accident', status: 'Dispatched', eta: '7 min', ambulance: 'MH-03-AMP-5678', location: 'Bandra East, Mumbai', priority: 'High' },
                ].map(e => (
                  <div key={e.id} className="p-5 flex items-start gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-slate-800">{e.patient}</p>
                          <p className="text-red-600 text-sm">{e.type}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{e.location} · {e.ambulance}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${e.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{e.priority}</span>
                          <p className="text-xs text-slate-400 mt-1">ETA: {e.eta}</p>
                          <span className="text-xs text-sky-600">{e.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Emergency History (Today)</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Response Time</th>
                    <th className="px-4 py-3 text-left">Hospital</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { id: 'E003', patient: 'Suresh Iyer', type: 'Stroke', response: '4.2 min', hospital: 'Apollo Hospitals', status: 'Resolved' },
                      { id: 'E004', patient: 'Meena Kapoor', type: 'Respiratory', response: '3.8 min', hospital: 'Kokilaben Hospital', status: 'Resolved' },
                      { id: 'E005', patient: 'Ajay Sharma', type: 'Burns', response: '5.1 min', hospital: 'Fortis Hospital', status: 'Resolved' },
                    ].map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs font-medium text-slate-600">{e.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{e.patient}</td>
                        <td className="px-4 py-3 text-red-600 text-xs">{e.type}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{e.response}</td>
                        <td className="px-4 py-3 text-xs text-sky-600">{e.hospital}</td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">System Settings</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Platform Name', value: 'MediWave Healthcare Platform', type: 'text' },
                { label: 'Support Email', value: 'support@mediwave.health', type: 'email' },
                { label: 'Support Phone', value: '1800-MED-WAVE', type: 'text' },
                { label: 'Timezone', value: 'Asia/Kolkata (IST)', type: 'text' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">{s.label}</label>
                  <input type={s.type} defaultValue={s.value} onChange={e => { e.currentTarget.value = sanitizeText(e.currentTarget.value, 120); }} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => toast.success('Settings saved')} className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700">Save Settings</button>
            </div>
          </div>
        );

      default:
        return <div className="text-center py-20"><h3 className="font-semibold text-slate-600">Select a section from the sidebar</h3></div>;
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0"><span className="text-white font-bold text-sm">M</span></div>
          {!sidebarCollapsed && <span className="font-bold text-white text-lg font-sora">Medi<span className="text-sky-400">Wave</span></span>}
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      {!sidebarCollapsed && <span className="mx-4 mt-2 inline-block bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full">Admin Panel</span>}

      <div className={`p-4 border-b border-slate-800 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <div className="w-10 h-10 bg-sky-700 rounded-xl flex items-center justify-center shrink-0"><Shield size={18} className="text-sky-300" /></div>
        {!sidebarCollapsed && (
          <div className="mt-2">
            <p className="font-semibold text-white text-sm">{user?.name}</p>
            <p className="text-sky-400 text-xs">Hospital Admin</p>
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
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 fixed left-0 top-0 bottom-0 flex flex-col z-40 hidden lg:flex transition-all duration-300`}>
        <SidebarContent />
      </div>

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
              <h1 className="font-bold text-slate-800 text-lg">{activeSection === 'overview' ? 'Hospital Admin Dashboard' : sidebarNav.find(i => i.id === activeSection)?.label}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                All Systems Normal
              </div>
              <Bell size={20} className="text-slate-500" />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">{renderContent()}</div>
      </div>

      {/* Add Doctor Modal */}
      {addDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.6)' }} onClick={() => setAddDoctorModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Add New Doctor</h3>
              <button onClick={() => setAddDoctorModal(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Dr. First Last', type: 'text' },
                { key: 'specialty', label: 'Specialty', placeholder: 'e.g. Cardiology', type: 'text' },
                { key: 'hospital', label: 'Hospital / Clinic', placeholder: 'Hospital Name', type: 'text' },
                { key: 'experience', label: 'Experience (years)', placeholder: '5', type: 'number' },
                { key: 'registrationNo', label: 'MCI Registration No.', placeholder: 'MCI-2024-XXXX', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{f.label}</label>
                  <input type={f.key === 'experience' ? 'text' : f.type} inputMode={f.key === 'experience' ? 'numeric' : undefined} placeholder={f.placeholder}
                    value={(newDoctor as Record<string, string>)[f.key]}
                    onChange={e => setNewDoctor(prev => ({
                      ...prev,
                      [f.key]: f.key === 'name' ? sanitizeName(e.target.value) :
                        f.key === 'experience' ? sanitizeAge(e.target.value) :
                        f.key === 'hospital' ? sanitizeAddress(e.target.value) :
                        sanitizeText(e.target.value, 80),
                    }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddDoctorModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={handleAddDoctor} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Add Doctor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {addPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.6)' }} onClick={() => setAddPatientModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Add New Patient</h3>
              <button onClick={() => setAddPatientModal(false)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Patient Name', type: 'text' },
                { key: 'age', label: 'Age', placeholder: '30', type: 'number' },
                { key: 'email', label: 'Email', placeholder: 'patient@example.com', type: 'email' },
                { key: 'phone', label: 'Phone', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
                { key: 'condition', label: 'Primary Condition', placeholder: 'e.g. Diabetes', type: 'text' },
                { key: 'bloodGroup', label: 'Blood Group', placeholder: 'e.g. O+', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{f.label}</label>
                  <input type={f.key === 'age' ? 'text' : f.type} inputMode={f.key === 'age' || f.key === 'phone' ? 'numeric' : undefined} placeholder={f.placeholder}
                    value={(newPatient as Record<string, string>)[f.key]}
                    onChange={e => setNewPatient(prev => ({
                      ...prev,
                      [f.key]: f.key === 'name' ? sanitizeName(e.target.value) :
                        f.key === 'age' ? sanitizeAge(e.target.value) :
                        f.key === 'email' ? sanitizeEmail(e.target.value) :
                        f.key === 'phone' ? sanitizeMobile(e.target.value) :
                        sanitizeText(e.target.value, 80),
                    }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddPatientModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={handleAddPatient} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Add Patient</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
