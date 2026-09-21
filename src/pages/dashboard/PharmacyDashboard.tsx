import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PharmacyOrder, useAppData } from '@/contexts/AppDataContext';
import {
  Package, ShoppingBag, TrendingUp, DollarSign, CheckCircle, Clock, X,
  Search, Settings, Home, LogOut, User, Edit, BarChart2, ChevronLeft, ChevronRight, Menu,
  AlertTriangle, Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { medicines } from '@/data/medicines';
import { toast } from 'sonner';
import { generateReport } from '@/lib/reportGenerator';
import { sanitizeSearch, sanitizeText } from '@/lib/validation';

type Section = 'orders' | 'inventory' | 'analytics' | 'billing' | 'settings';

const salesData = [
  { day: 'Mon', value: 18400 },
  { day: 'Tue', value: 22100 },
  { day: 'Wed', value: 19800 },
  { day: 'Thu', value: 25400 },
  { day: 'Fri', value: 28900 },
  { day: 'Sat', value: 24600 },
  { day: 'Sun', value: 16200 },
];

const monthlyData = [
  { month: 'Dec', revenue: 380000, orders: 1240 },
  { month: 'Jan', revenue: 410000, orders: 1380 },
  { month: 'Feb', revenue: 390000, orders: 1210 },
  { month: 'Mar', revenue: 450000, orders: 1560 },
  { month: 'Apr', revenue: 480000, orders: 1640 },
  { month: 'May', revenue: 520000, orders: 1820 },
];

const billingHistory = [
  { id: 'INV001', patient: 'John Smith', amount: 162, method: 'UPI', date: '2026-05-18', status: 'paid' },
  { id: 'INV002', patient: 'Sunita Patel', amount: 86, method: 'Card', date: '2026-05-17', status: 'paid' },
  { id: 'INV003', patient: 'Ravi Kumar', amount: 268, method: 'Wallet', date: '2026-05-17', status: 'paid' },
  { id: 'INV004', patient: 'Anita Singh', amount: 306, method: 'UPI', date: '2026-05-17', status: 'pending' },
  { id: 'INV005', patient: 'Deepak Nambiar', amount: 205, method: 'Insurance', date: '2026-05-16', status: 'paid' },
];

export default function PharmacyDashboard() {
  const { user, logout } = useAuth();
  const { pharmacyOrders, updatePharmacyOrder } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('orders');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'dispatched' | 'delivered'>('all');

  const filteredOrders = pharmacyOrders.filter(o => {
    const matchSearch = !search || o.patient.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = orderFilter === 'all' || o.status === orderFilter;
    return matchSearch && matchFilter;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'dispatched': return 'bg-sky-100 text-sky-700';
      case 'processing': return 'bg-amber-100 text-amber-700';
      case 'pending': return 'bg-slate-100 text-slate-600';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-slate-800 text-xl">Order Management</h2>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'processing', 'dispatched', 'delivered'] as const).map(f => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize ${orderFilter === f ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Today's Orders", value: pharmacyOrders.length.toString(), change: '+12 vs yesterday', color: 'text-sky-600', bg: 'bg-sky-50', icon: ShoppingBag },
                { label: "Today's Revenue", value: `₹${pharmacyOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, change: '+8% vs yesterday', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: DollarSign },
                { label: 'Pending', value: pharmacyOrders.filter(o => o.status === 'pending').length.toString(), change: 'Need processing', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                { label: 'Low Stock', value: medicines.filter(m => m.stock < 200).length.toString(), change: 'Reorder needed', color: 'text-red-500', bg: 'bg-red-50', icon: Package },
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

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 flex-1">Orders</h3>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Search size={14} className="text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(sanitizeSearch(e.target.value))} placeholder="Search orders..." className="text-xs bg-transparent focus:outline-none w-32" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                      <th className="px-4 py-3 text-left">Order ID</th>
                      <th className="px-4 py-3 text-left">Patient</th>
                      <th className="px-4 py-3 text-left">Items</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3"><p className="font-medium text-slate-800 text-xs">{order.id}</p><p className="text-slate-400 text-xs">{order.date}</p></td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 text-sm">{order.patient}</p>
                            {order.prescription && <span className="text-xs text-amber-600">Rx required</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate">{order.medicines}</td>
                          <td className="px-4 py-3 font-semibold text-sky-600">₹{order.total}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor(order.status)}`}>{order.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={e => updatePharmacyOrder(order.id, e.target.value as PharmacyOrder['status'])}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="font-semibold text-slate-800 mb-4">Weekly Sales</h4>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={salesData}>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Sales']} />
                      <Bar dataKey="value" fill="#0284C7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Low Stock Alerts
                  </h4>
                  <div className="space-y-2">
                    {medicines.filter(m => m.stock < 200).slice(0, 4).map(med => (
                      <div key={med.id} className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{med.name}</p>
                          <p className="text-xs text-red-500">{med.stock} units left</p>
                        </div>
                        <button onClick={() => toast.success(`Reorder placed for ${med.name}`)} className="px-2 py-1 bg-sky-600 text-white text-xs rounded-lg hover:bg-sky-700 transition-colors shrink-0">Reorder</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xl">Inventory Management</h2>
              <button onClick={() => toast.success('Export started')} className="flex items-center gap-2 px-4 py-2 border border-sky-200 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-50">
                Export CSV
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
                  <Search size={14} className="text-slate-400" />
                  <input type="text" onChange={e => { e.currentTarget.value = sanitizeSearch(e.currentTarget.value); }} placeholder="Search medicines..." className="text-xs bg-transparent focus:outline-none flex-1" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-slate-400 uppercase bg-slate-50">
                    <th className="px-5 py-3 text-left">Medicine</th>
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Stock</th>
                    <th className="px-5 py-3 text-left">Price</th>
                    <th className="px-5 py-3 text-left">MRP</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {medicines.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={med.image} alt={med.name} className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{med.name}</p>
                              <p className="text-xs text-slate-400">{med.genericName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-sky-600">{med.category}</td>
                        <td className="px-5 py-3">
                          <span className={`text-sm font-medium ${med.stock < 200 ? 'text-red-600' : med.stock < 500 ? 'text-amber-600' : 'text-emerald-600'}`}>{med.stock}</span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-800">₹{med.price}</td>
                        <td className="px-5 py-3 text-slate-400 text-xs line-through">₹{med.mrp}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${med.stock < 200 ? 'bg-red-100 text-red-700' : med.stock < 500 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {med.stock < 200 ? 'Low Stock' : med.stock < 500 ? 'Medium' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"><Edit size={14} /></button>
                            {med.stock < 200 && (
                              <button onClick={() => toast.success(`Reorder placed for ${med.name}`)} className="text-xs text-sky-600 hover:underline px-2">Reorder</button>
                            )}
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

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Analytics & Performance</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Monthly Revenue & Orders</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
                    <Bar dataKey="revenue" fill="#0284C7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Daily Revenue This Week</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={salesData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="value" stroke="#0284C7" strokeWidth={3} dot={{ fill: '#0284C7', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Best Selling', value: 'Metformin 500mg', sub: '428 units this month', color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'Highest Revenue', value: 'Atorvastatin 40mg', sub: '₹28,400 this month', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Most Returned', value: 'Azithromycin 500mg', sub: '12 returns this month', color: 'text-red-500', bg: 'bg-red-50' },
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

      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Billing & Payments</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Today's Collections", value: `₹${pharmacyOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0).toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Pending Payments', value: `₹${pharmacyOrders.filter(o => o.status === 'pending').reduce((s, o) => s + o.total, 0).toLocaleString()}`, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Monthly Revenue', value: '₹5,20,000', color: 'text-sky-600', bg: 'bg-sky-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-center`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100"><h3 className="font-semibold text-slate-800">Transaction History</h3></div>
              <div className="divide-y divide-slate-50">
                {billingHistory.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">{item.patient}</p>
                      <p className="text-xs text-slate-400">{item.id} · {item.date} · {item.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">₹{item.amount}</p>
                      <span className={`text-xs ${item.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{item.status}</span>
                    </div>
                    <button onClick={() => generateReport('invoice', { reportId: item.id, patientName: item.patient, amount: item.amount })} className="text-xs text-sky-600 hover:underline">Invoice</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="font-bold text-slate-800 text-xl">Pharmacy Settings</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              {[
                { label: 'Pharmacy Name', value: 'MediMart Plus' },
                { label: 'Drug License Number', value: 'DL-MH-2024-0123' },
                { label: 'GSTIN', value: '27AAAAA0000A1Z5' },
                { label: 'Registered Address', value: 'Shop 12, Medical Complex, Andheri, Mumbai 400069' },
                { label: 'Contact Email', value: 'pharmacy@mediwave.health' },
                { label: 'Emergency Contact', value: '+91 77665 54433' },
              ].map(s => (
                <div key={s.label}>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{s.label}</label>
                  <input type="text" defaultValue={s.value} onChange={e => { e.currentTarget.value = sanitizeText(e.currentTarget.value, 120); }} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
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
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      {!sidebarCollapsed && <span className="mx-4 mt-2 inline-block bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full">Pharmacy Partner</span>}

      <div className={`p-4 border-b border-slate-800 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
        <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center shrink-0"><span className="text-white text-sm font-bold">P</span></div>
        {!sidebarCollapsed && (
          <div className="mt-2">
            <p className="font-semibold text-white text-sm">{user?.name}</p>
            <p className="text-emerald-400 text-xs">Pharmacy Partner</p>
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
              <h1 className="font-bold text-slate-800 text-lg">{navItems.find(i => i.id === activeSection)?.label || 'Pharmacy Dashboard'}</h1>
            </div>
            <Bell size={20} className="text-slate-500" />
          </div>
        </div>
        <div className="p-4 sm:p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
