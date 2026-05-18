import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Bell, ShoppingCart, Menu, X, User, LogOut, ChevronDown, Video, Calendar, FlaskConical, Pill, BarChart2 } from 'lucide-react';
import { mockNotifications } from '@/data/mockData';
import logo from '@/assets/logo.png';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const publicLinks = [
    { label: 'Doctors', href: '/doctors' },
    { label: 'Telemedicine', href: '/telemedicine' },
    { label: 'Labs', href: '/labs' },
    { label: 'Medicines', href: '/medicines' },
    { label: 'Emergency', href: '/emergency' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'patient': return '/dashboard/patient';
      case 'doctor': return '/dashboard/doctor';
      case 'admin': return '/dashboard/admin';
      case 'pharmacy': return '/dashboard/pharmacy';
      case 'superadmin': return '/dashboard/superadmin';
      case 'lab': return '/dashboard/lab';
      default: return '/dashboard/patient';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="MediWave" className="w-8 h-8 rounded-lg object-contain bg-white" />
            <span className="font-bold text-xl text-slate-800 font-sora">
              Medi<span className="text-sky-600">Wave</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-sky-600 bg-sky-50'
                    : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={() => navigate('/medicines')}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              title="Cart"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
                      <div className="p-4 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {mockNotifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-sky-50/50' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-sky-500' : 'bg-slate-300'}`} />
                              <div>
                                <p className="font-medium text-sm text-slate-800">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center">
                        <button className="text-sm text-sky-600 font-medium hover:underline">View all notifications</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 hover:border-sky-200 hover:bg-sky-50 transition-all"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                        <User size={14} className="text-sky-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
                      <div className="p-4 border-b border-slate-100">
                        <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => { navigate(getDashboardPath()); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        >
                          <BarChart2 size={16} />
                          Dashboard
                        </button>
                        <button
                          onClick={() => { navigate('/appointments'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        >
                          <Calendar size={16} />
                          Appointments
                        </button>
                        <button
                          onClick={() => { navigate('/records'); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        >
                          <FlaskConical size={16} />
                          Health Records
                        </button>
                        <div className="my-2 border-t border-slate-100" />
                        <button
                          onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {publicLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border border-sky-200 text-sky-600 rounded-xl text-sm font-medium">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-sky-600 text-white rounded-xl text-sm font-medium">Sign Up</Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => { navigate(getDashboardPath()); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
