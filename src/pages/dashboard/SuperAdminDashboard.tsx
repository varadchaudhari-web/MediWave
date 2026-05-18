/**
 * SuperAdminDashboard — Full platform oversight with all users, roles, 
 * compliance, analytics, and emergency logs.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { analyticsData } from '@/data/mockData';
import {
  Activity, Users, Calendar, Shield, Bell, DollarSign, FileText,
  Home, LogOut, User, Plus, Search, CheckCircle, AlertTriangle, X,
  Edit, Trash2, FlaskConical, ChevronLeft, ChevronRight, Menu, Settings,
  Building2, Pill, TrendingUp, Eye, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { demoCredentials } from '@/data/mockData';
import { toast } from 'sonner';
import { generateReport } from '@/lib/reportGenerator';

type Section = 'overview' | 'users' | 'doctors' | 'hospitals' | 'appointments' | 'compliance' | 'analytics' | 'emergency' | 'reports' | 'settings';

const COLORS = ['#0284C7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const allUsers = [
  { id: 'u1', name: 'John Smith', email: 'patient@mediwave.health', role: 'Patient', status: 'Active', joined: '2024-01-10', lastLogin: '2026-05-18' },
  { id: 'u2', name: 'Dr. Sarah Mitchell', email: 'doctor@mediwave.health', role: 'Doctor', status: 'Active', joined: '2023-06-01', lastLogin: '2026-05-18' },
  { id: 'u3', name: 'Raj Malhotra', email: 'admin@mediwave.health', role: 'Admin', status: 'Active', joined: '2023-01-01', lastLogin: '2026-05-17' },
  { id: 'u4', name: 'MediMart Plus', email: 'pharmacy@mediwave.health', role: 'Pharmacy', status: 'Active', joined: '2023-03-15', lastLogin: '2026-05-18' },
  { id: 'u5', name: 'MediWave Diagnostics', email: 'lab@mediwave.health', role: 'Lab', status: 'Active', joined: '2023-04-01', lastLogin: '2026-05-18' },
  { id: 'u6', name: 'Sunita Patel', email: 'sunita@example.com', role: 'Patient', status: 'Active', joined: '2024-02-15', lastLogin: '2026-05-15' },
  { id: 'u7', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'Patient', status: 'Critical', joined: '2024-03-20', lastLogin: '2026-05-10' },
];

const platformStats = [
  { label: 'Total Users', value: '8,247', change: '+12.5%', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
  { label: 'Active Doctors', value: '134', change: '+3', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Hospitals', value: '42', change: '+1 this month', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Monthly Revenue', value: '₹22.4L', change: '+18.2%', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Lab Orders', value: '892', change: '+7%', icon: FlaskConical, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Medicine Orders', value: '1,820', change: '+11%', icon: Pill, color: 'text-rose-600', bg: 'bg-rose-50' },
];

const auditLogs = [
  { id: 'LOG001', user: 'admin@mediwave.health', action: 'Doctor account created', resource: 'Dr. Ramesh Gupta', time: '2026-05-18 09:12', status: 'success' },
  { id: 'LOG002', user: 'doctor@mediwave.health', action: 'Patient record accessed', resource: 'Patient #p1', time: '2026-05-18 10:30', status: 'success' },
  { id: 'LOG003', user: 'pharmacy@mediwave.health', action: 'Prescription dispensed', resource: 'RX-001', time: '2026-05-18 11:45', status: 'success' },
  { id: 'LOG004', user: 'unknown@domain.com', action: 'Login attempt failed', resource: 'Admin Panel', time: '2026-05-18 13:22', status: 'failed' },
  { id: 'LOG005', user: 'lab@mediwave.health', action: 'Report uploaded', resource: 'LB001', time: '2026-05-18 14:00', status: 'success' },
  { id: 'LOG006', user: 'superadmin@mediwave.health', action: 'System configuration updated', resource: 'Platform Settings', time: '2026-05-17 16:22', status: 'success' },
];

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const { doctors, patients, appointments, addDoctor, deleteDoctor } = useAppData();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [addDoctorModal, setAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', hospital: '', experience: '', registrationNo: '' });

  const sidebarNav: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Platform Overview', icon: Activity },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: User },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 },
    { id: 'appointments', label: 'All Appointments', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'emergency', label: 'Emergency Logs', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const filteredUsers = allUsers.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDoctor = () => {
    if (!newDoctor.name || !newDoctor.specialty) { toast.error('Name and specialty required'); return; }
    addDoctor({
      name: newDoctor.name, specialty: newDoctor.specialty, subSpecialty: '',
      qualification: 'MBBS, MD', experience: parseInt(newDoctor.experience) || 5,
      rating: 4.5, reviewCount: 0, consultationFee: 800,
      languages: ['English', 'Hindi'], hospital: newDoctor.hospital || 'MediWave Hospital',
      location: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face',
      available: true, availableSlots: ['10:00 AM', '02:00 PM', '04:00 PM'],
      bio: 'Expert specialist.', patients: 0, registrationNo: newDoctor.registrationNo || 'MCI-2024-NEW',
      nextAvailable: 'Today', tags: [newDoctor.specialty], telemedicineEnabled: true,
    });
    setNewDoctor({ name: '', specialty: '', hospital: '', experience: '', registrationNo: '' });
    setAddDoctorModal(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-sky-500/30 rounded-xl flex items-center justify-center">
                  <Shield size={22} className="text-sky-300" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">Super Admin Control Panel</h2>
                  <p className="text-slate-400 text-sm">Full platform access and oversight</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Platform Health', value: '99.9%', desc: 'Uptime' },
                  { label: 'Active Sessions', value: '1,248', desc: 'Right now' },
                  { label: 'Alerts', value: '2', desc: 'Need attention' },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-slate-400 text-xs">{s.label} · {s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {platformStats.map(stat => (
                <div key={stat.label} className="stat-card flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <stat.icon size={22} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-slate-500 text-xs">{stat.label}</p>
                    <p className="text-emerald-600 text-xs font-medium mt-0.5">{stat.change}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analyticsData.revenueByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v: number) => [`₹${(v/100000).toFixed(1)}L`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#0284C7" strokeWidth={3} dot={{ fill: '#0284C7', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Platform Usage by Role</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Patients', value: 7210 },
                      { name: 'Doctors', value: 134 },
                      { name: 'Admins', value: 42 },
                      { name: 'Pharmacy', value: 28 },
                      { name: 'Labs', value: 18 },
                    ]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                      {[0,1,2,3,4].map(i => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {['Patients', 'Doctors', 'Admins', 'Pharmacy', 'Labs'].map((l, i) => (
                    <div key={l} className="flex items-center gap-1 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-slate-600">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Recent Audit Log</h3></div>
              <div className="divide-y divide-slate-50">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm">{log.action} — <span className="text-sky-600">{log.resource}</span></p>
                      <p className="text-xs text-slate-400">{log.user}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{log.time.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center">
                <button onClick={() => setActiveSection('compliance')} className="text-xs text-sky-600 hover:underline">View Full Audit Log</button>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-slate-800 text-xl">All Users ({allUsers.length + patients.length})</h2>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <Search size={14} className="text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="text-xs focus:outline-none w-40" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Joined</th>
                    <th className="px-5 py-3 text-left">Last Login</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center font-bold text-sky-700 text-xs shrink-0">{u.name[0]}</div>
                            <div><p className="font-medium text-slate-800">{u.name}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            u.role === 'Doctor' ? 'bg-sky-100 text-sky-700' :
                            u.role === 'Admin' ? 'bg-amber-100 text-amber-700' :
                            u.role === 'Pharmacy' ? 'bg-emerald-100 text-emerald-700' :
                            u.role === 'Lab' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{u.status}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">{u.joined}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{u.lastLogin}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg" title="View"><Eye size={14} /></button>
                            <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit size={14} /></button>
                            <button onClick={() => toast.success('User suspended')} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-slate-800 text-xl">Doctor Management ({doctors.length})</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <Search size={14} className="text-slate-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." className="text-xs focus:outline-none w-36" />
                </div>
                <button onClick={() => setAddDoctorModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
                  <Plus size={16} /> Add Doctor
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredDoctors.map(doc => (
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
                      <span>{doc.patients.toLocaleString()} patients</span>
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

      case 'hospitals':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Hospital Partners (42)</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700"><Plus size={16} /> Add Hospital</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'Apollo Hospitals', type: 'Super Specialty', city: 'Hyderabad', beds: 550, status: 'Active', doctors: 48, revenue: '₹4.2L' },
                { name: 'Fortis Healthcare', type: 'Multi Specialty', city: 'Delhi', beds: 400, status: 'Active', doctors: 36, revenue: '₹3.8L' },
                { name: 'Max Super Specialty', type: 'Super Specialty', city: 'Delhi', beds: 480, status: 'Active', doctors: 42, revenue: '₹3.5L' },
                { name: 'Kokilaben Hospital', type: 'Super Specialty', city: 'Mumbai', beds: 750, status: 'Active', doctors: 58, revenue: '₹5.1L' },
                { name: 'AIIMS Delhi', type: 'Government', city: 'Delhi', beds: 2480, status: 'Active', doctors: 124, revenue: '₹2.1L' },
                { name: 'Manipal Hospitals', type: 'Multi Specialty', city: 'Bangalore', beds: 600, status: 'Review', doctors: 44, revenue: '₹2.9L' },
              ].map((h, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{h.name}</h3>
                      <p className="text-sky-600 text-xs">{h.type} · {h.city}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>{h.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl p-2">
                      <p className="font-bold text-slate-800 text-sm">{h.beds}</p>
                      <p className="text-xs text-slate-400">Beds</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2">
                      <p className="font-bold text-slate-800 text-sm">{h.doctors}</p>
                      <p className="text-xs text-slate-400">Doctors</p>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-2">
                      <p className="font-bold text-sky-600 text-sm">{h.revenue}</p>
                      <p className="text-xs text-slate-400">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Platform Analytics</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Monthly Appointments</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analyticsData.appointmentsByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Revenue Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analyticsData.revenueByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v: number) => [`₹${(v/100000).toFixed(1)}L`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Appointment Value', value: '₹724', change: '+8%' },
                { label: 'Patient Retention', value: '78%', change: '+5%' },
                { label: 'Doctor Utilization', value: '82%', change: '+3%' },
                { label: 'SLA Compliance', value: '94.2%', change: '-0.8%' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                  <p className={`text-xs mt-1 font-medium ${s.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{s.change}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Compliance & Security</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'HIPAA Compliance', status: 'Certified', desc: 'All PHI handling meets HIPAA standards.', color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600' },
                { label: 'DPDP Act (India)', status: 'Certified', desc: 'Digital Personal Data Protection Act certified.', color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600' },
                { label: 'Data Encryption', status: 'AES-256 Active', desc: 'All data encrypted at rest and in transit.', color: 'bg-sky-50 border-sky-200', iconColor: 'text-sky-600' },
                { label: 'Pending Actions', status: '2 Items', desc: 'Doctor credential verification pending for 2 new doctors.', color: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600' },
              ].map(item => (
                <div key={item.label} className={`rounded-2xl border p-5 ${item.color}`}>
                  <div className="flex items-start gap-3">
                    <Shield size={22} className={item.iconColor} />
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
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Full Audit Log</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-4 py-3 text-left">Log ID</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Resource</th>
                    <th className="px-4 py-3 text-left">Time</th>
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

      case 'emergency':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Emergency Logs</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Active SOS', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Total Today', value: '20', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Avg Response', value: '4.8 min', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Resolved', value: '18', color: 'text-sky-600', bg: 'bg-sky-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-600 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Emergency History</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Response</th>
                    <th className="px-4 py-3 text-left">Hospital</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { id: 'E001', patient: 'Ramesh Kumar', type: 'Cardiac Arrest', location: 'Andheri West', response: '3 min', hospital: 'Apollo Hospitals', status: 'Active' },
                      { id: 'E002', patient: 'Deepa Menon', type: 'Road Accident', location: 'Bandra East', response: '7 min', hospital: 'Kokilaben Hospital', status: 'Active' },
                      { id: 'E003', patient: 'Suresh Iyer', type: 'Stroke', location: 'Juhu', response: '4.2 min', hospital: 'Apollo Hospitals', status: 'Resolved' },
                      { id: 'E004', patient: 'Meena Kapoor', type: 'Respiratory', location: 'Vile Parle', response: '3.8 min', hospital: 'Kokilaben Hospital', status: 'Resolved' },
                      { id: 'E005', patient: 'Ajay Sharma', type: 'Burns', location: 'Kurla', response: '5.1 min', hospital: 'Fortis Hospital', status: 'Resolved' },
                    ].map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs font-medium text-slate-600">{e.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{e.patient}</td>
                        <td className="px-4 py-3 text-red-600 text-xs">{e.type}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{e.location}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{e.response}</td>
                        <td className="px-4 py-3 text-xs text-sky-600">{e.hospital}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.status === 'Active' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>{e.status}</span>
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
            <h2 className="font-bold text-slate-800 text-xl">Platform Reports</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Patient Registration Report', period: 'May 2026', desc: `${patients.length + 7210} total patients. +12.5% growth MoM.`, icon: Users, color: 'bg-sky-50 text-sky-600' },
                { label: 'Appointment Analytics', period: 'Q2 2026', desc: '14,250 appointments. 58% telemedicine. Avg value ₹724.', icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Revenue Statement', period: 'May 2026', desc: 'Total ₹22.4L. Top dept: Cardiology ₹4.2L. YoY +42%.', icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
                { label: 'Doctor Performance', period: 'Monthly', desc: 'Top: Dr. Sarah Mitchell. 168 consults. Avg rating 4.9.', icon: User, color: 'bg-amber-50 text-amber-600' },
                { label: 'Lab Test Reports', period: 'Weekly', desc: '892 tests. 71% on time. Top: CBC 24%, Thyroid 18%.', icon: FlaskConical, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Compliance Audit', period: 'Q1 2026', desc: '2,840 access events. 1 anomaly flagged. All resolved.', icon: Shield, color: 'bg-rose-50 text-rose-600' },
              ].map(r => (
                <div key={r.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center shrink-0`}><r.icon size={18} /></div>
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm">{r.label}</h4>
                      <p className="text-xs text-slate-400">{r.period}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{r.desc}</p>
                  <button onClick={() => generateReport(r.label.includes('Compliance') ? 'compliance' : r.label.includes('Revenue') ? 'revenue' : r.label.includes('Appointment') ? 'appointmentAnalytics' : 'medical', {
                    reportId: r.label.replace(/\s+/g, '-').toUpperCase(),
                    title: r.label,
                    rows: [['Period', r.period, 'Generated'], ['Summary', r.desc, 'Reviewed']],
                    notes: r.desc,
                  })} className="text-xs text-sky-600 hover:underline font-medium">Download PDF</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Platform Settings</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { label: 'Platform Name', value: 'MediWave Healthcare Platform' },
                { label: 'Support Email', value: 'support@mediwave.health' },
                { label: 'Emergency Hotline', value: '1800-MED-WAVE' },
                { label: 'Default Timezone', value: 'Asia/Kolkata (IST)' },
                { label: 'Session Timeout', value: '30 minutes' },
                { label: 'Max File Upload', value: '25 MB' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">{s.label}</label>
                  <input type="text" defaultValue={s.value} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => toast.success('Platform settings saved')} className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700">Save Settings</button>
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">All Appointments (Platform-wide)</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-5 py-3 text-left">Patient</th>
                    <th className="px-5 py-3 text-left">Doctor</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">Fee</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-800">{a.patientName}</td>
                        <td className="px-5 py-3 text-sky-600 text-xs">{a.doctorName}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{a.date}</td>
                        <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${a.type === 'telemedicine' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{a.type === 'telemedicine' ? 'Video' : 'In-Person'}</span></td>
                        <td className="px-5 py-3 font-semibold text-emerald-600">₹{a.fee}</td>
                        <td className="px-5 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${a.status === 'scheduled' ? 'bg-sky-100 text-sky-700' : a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-center py-20"><h3 className="font-semibold text-slate-600">Select a section</h3></div>;
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
      {!sidebarCollapsed && <span className="mx-4 mt-2 inline-block bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">Super Admin</span>}

      <div className={`p-4 border-b border-slate-800 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <div className="w-10 h-10 bg-red-700/50 rounded-xl flex items-center justify-center shrink-0"><Shield size={18} className="text-red-300" /></div>
        {!sidebarCollapsed && (
          <div className="mt-2">
            <p className="font-semibold text-white text-sm">{user?.name}</p>
            <p className="text-red-400 text-xs">Super Admin · Full Access</p>
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
              <h1 className="font-bold text-slate-800 text-lg">{sidebarNav.find(i => i.id === activeSection)?.label || 'Super Admin'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-medium">
                <Shield size={12} />
                Super Admin
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
                { key: 'hospital', label: 'Hospital', placeholder: 'Hospital Name', type: 'text' },
                { key: 'experience', label: 'Experience (years)', placeholder: '5', type: 'number' },
                { key: 'registrationNo', label: 'MCI Registration', placeholder: 'MCI-2024-XXXX', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={(newDoctor as Record<string, string>)[f.key]}
                    onChange={e => setNewDoctor(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setAddDoctorModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={handleAddDoctor} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Add Doctor</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
