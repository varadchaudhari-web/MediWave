import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LabOrder, useAppData } from '@/contexts/AppDataContext';
import {
  FlaskConical, TrendingUp, DollarSign, Clock, CheckCircle, Search, Settings,
  Home, LogOut, User, Plus, X, BarChart2, ChevronLeft, ChevronRight, Menu, Bell, Edit
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { sanitizeSearch, sanitizeText } from '@/lib/validation';

type Section = 'orders' | 'tests' | 'analytics' | 'settings';

const salesData = [
  { day: 'Mon', value: 8400 },
  { day: 'Tue', value: 12100 },
  { day: 'Wed', value: 9800 },
  { day: 'Thu', value: 15400 },
  { day: 'Fri', value: 18900 },
  { day: 'Sat', value: 14600 },
  { day: 'Sun', value: 6200 },
];

const labTestCatalog = [
  { id: 't1', name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 299, turnaround: '4 hours', available: true },
  { id: 't2', name: 'Lipid Profile', category: 'Biochemistry', price: 450, turnaround: '6 hours', available: true },
  { id: 't3', name: 'Thyroid Profile', category: 'Endocrinology', price: 650, turnaround: '24 hours', available: true },
  { id: 't4', name: 'HbA1c', category: 'Diabetes', price: 380, turnaround: '6 hours', available: true },
  { id: 't5', name: 'Liver Function Test', category: 'Biochemistry', price: 580, turnaround: '8 hours', available: true },
  { id: 't6', name: 'Kidney Function Test', category: 'Biochemistry', price: 520, turnaround: '6 hours', available: false },
];

export default function LabDashboard() {
  const { user, logout } = useAuth();
  const { labOrders, updateLabOrder, uploadLabReport } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('orders');
  const [uploadModal, setUploadModal] = useState<string | null>(null);
  const [reportNotes, setReportNotes] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'processing': return 'bg-sky-100 text-sky-700';
      case 'sample-collected': return 'bg-purple-100 text-purple-700';
      case 'booked': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const filteredOrders = labOrders.filter(o =>
    !search || o.patient.toLowerCase().includes(search.toLowerCase()) || o.test.toLowerCase().includes(search.toLowerCase())
  );

  const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'orders', label: 'Orders', icon: FlaskConical },
    { id: 'tests', label: 'Test Catalog', icon: BarChart2 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-slate-800 text-xl">Lab Test Orders</h2>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                <Search size={14} className="text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(sanitizeSearch(e.target.value))} placeholder="Search orders..." className="text-xs focus:outline-none w-40" />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Orders", value: labOrders.length.toString(), change: '+6 vs yesterday', color: 'text-sky-600', bg: 'bg-sky-50', icon: FlaskConical },
                { label: "Revenue Today", value: `₹${labOrders.reduce((s, o) => s + o.amount, 0).toLocaleString()}`, change: '+12%', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: DollarSign },
                { label: 'Pending Reports', value: labOrders.filter(o => !o.reportReady && o.status !== 'booked').length.toString(), change: 'Upload needed', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                { label: 'Completed', value: labOrders.filter(o => o.status === 'completed').length.toString(), change: 'Reports uploaded', color: 'text-purple-600', bg: 'bg-purple-50', icon: CheckCircle },
              ].map(stat => (
                <div key={stat.label} className="stat-card flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}><stat.icon size={22} className={stat.color} /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-slate-500 text-xs">{stat.label}</p>
                    <p className={`text-xs mt-0.5 ${stat.color}`}>{stat.change}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Patient</th>
                    <th className="px-5 py-3 text-left">Test</th>
                    <th className="px-5 py-3 text-left">Date/Time</th>
                    <th className="px-5 py-3 text-left">Collection</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3"><p className="font-medium text-slate-800 text-xs">{order.id}</p></td>
                        <td className="px-5 py-3"><p className="font-medium text-slate-800">{order.patient}</p></td>
                        <td className="px-5 py-3 text-xs text-slate-600 max-w-[160px] truncate">{order.test}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{order.date} {order.time}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.homeCollection ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                            {order.homeCollection ? 'Home' : 'Lab Visit'}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-sky-600">₹{order.amount}</td>
                        <td className="px-5 py-3">
                          <select
                            value={order.status}
                            onChange={e => updateLabOrder(order.id, { status: e.target.value as LabOrder['status'] })}
                            className={`text-xs px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-sky-500 ${statusColor(order.status)}`}
                          >
                            <option value="booked">Booked</option>
                            <option value="sample-collected">Sample Collected</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          {order.reportReady ? (
                            <button onClick={() => toast.success('Report viewed')} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                              <CheckCircle size={11} /> View
                            </button>
                          ) : (
                            <button onClick={() => { setUploadModal(order.id); setReportNotes(''); }} className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                              <Plus size={11} /> Upload Report
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'tests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Test Catalog</h2>
              <button onClick={() => toast.success('New test form opened')} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
                <Plus size={16} /> Add Test
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labTestCatalog.map(test => (
                <div key={test.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{test.name}</h3>
                      <p className="text-sky-600 text-xs mt-0.5">{test.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {test.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                    <span className="flex items-center gap-1"><Clock size={11} /> {test.turnaround}</span>
                    <span className="font-bold text-sky-600 text-base">₹{test.price}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600"><Edit size={11} /> Edit</button>
                    <button onClick={() => { const t = { ...test, available: !test.available }; toast.success(`${test.name} ${test.available ? 'disabled' : 'enabled'}`); }} className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-600">Toggle</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Analytics & Reports</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Weekly Revenue</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={salesData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="value" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Order Status Breakdown</h4>
                <div className="space-y-4 mt-2">
                  {[
                    { label: 'Completed', value: Math.round(labOrders.filter(o => o.status === 'completed').length / labOrders.length * 100), color: 'bg-emerald-500' },
                    { label: 'Processing', value: Math.round(labOrders.filter(o => o.status === 'processing').length / labOrders.length * 100), color: 'bg-sky-500' },
                    { label: 'Sample Collected', value: Math.round(labOrders.filter(o => o.status === 'sample-collected').length / labOrders.length * 100), color: 'bg-purple-500' },
                    { label: 'Booked', value: Math.round(labOrders.filter(o => o.status === 'booked').length / labOrders.length * 100), color: 'bg-amber-500' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{s.label}</span><span className="font-medium">{s.value}%</span></div>
                      <div className="h-2 bg-slate-100 rounded-full"><div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Most Ordered Test', value: 'Complete Blood Count', sub: '24% of all orders', color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'Fastest Turnaround', value: '2.8 hrs avg', sub: 'vs 4 hrs committed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Home Collections', value: `${labOrders.filter(o => o.homeCollection).length}`, sub: 'this week', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Lab Settings</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              {[
                { label: 'Lab Name', value: 'MediWave Diagnostics - Central Lab' },
                { label: 'NABL License Number', value: 'NABL-MC-1234' },
                { label: 'Lab Address', value: '42 Medical Complex, Andheri East, Mumbai 400069' },
                { label: 'Contact Email', value: 'lab@mediwave.health' },
                { label: 'Contact Phone', value: '+91 66554 43322' },
                { label: 'Operating Hours', value: 'Mon-Sun: 7 AM - 8 PM' },
              ].map(s => (
                <div key={s.label}>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{s.label}</label>
                  <input type="text" defaultValue={s.value} onChange={e => { e.currentTarget.value = sanitizeText(e.currentTarget.value, 120); }} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm">Cancel</button>
                <button onClick={() => toast.success('Settings saved')} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700">Save Settings</button>
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
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0"><span className="text-white font-bold text-sm">M</span></div>
          {!sidebarCollapsed && <span className="font-bold text-white text-lg font-sora">Medi<span className="text-sky-400">Wave</span></span>}
        </div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
          {sidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      {!sidebarCollapsed && <span className="mx-4 mt-2 inline-block bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">Lab Partner</span>}

      <div className={`p-4 border-b border-slate-800 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center shrink-0"><FlaskConical size={18} className="text-purple-300" /></div>
        {!sidebarCollapsed && (
          <div className="mt-2">
            <p className="font-semibold text-white text-sm">{user?.name || 'Lab Partner'}</p>
            <p className="text-purple-400 text-xs">Lab Partner</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3">
        {navItems.map(item => (
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
              <h1 className="font-bold text-slate-800 text-lg">{navItems.find(i => i.id === activeSection)?.label || 'Lab Dashboard'}</h1>
            </div>
            <Bell size={20} className="text-slate-500" />
          </div>
        </div>
        <div className="p-4 sm:p-6">{renderContent()}</div>
      </div>

      {/* Upload Report Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.6)' }} onClick={() => setUploadModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Upload Lab Report</h3>
              <button onClick={() => setUploadModal(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">Order: <span className="font-semibold text-sky-600">{uploadModal}</span></p>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-sky-300 cursor-pointer transition-colors">
                <FlaskConical size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Drag & drop PDF or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Max 25MB · PDF, JPG, PNG</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Lab Report Notes (Optional)</label>
                <textarea rows={3} value={reportNotes} onChange={e => setReportNotes(sanitizeText(e.target.value, 500))}
                  placeholder="Add findings or notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setUploadModal(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={() => { uploadLabReport(uploadModal, reportNotes); setUploadModal(null); }} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Upload Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
