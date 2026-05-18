import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { demoCredentials } from '@/data/mockData';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect after login
  useEffect(() => {
    if (isAuthenticated && user) {
      const path =
        user.role === 'doctor' ? '/dashboard/doctor' :
        user.role === 'admin' ? '/dashboard/admin' :
        user.role === 'pharmacy' ? '/dashboard/pharmacy' :
        user.role === 'superadmin' ? '/dashboard/superadmin' :
        user.role === 'lab' ? '/dashboard/lab' :
        '/dashboard/patient';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      setError('Invalid email or password. Use the demo credentials below.');
    }
    // Navigation handled by useEffect above
  };

  const fillCredentials = (cred: typeof demoCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    toast.info(`${cred.role} credentials filled`);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MediWave" className="w-10 h-10 rounded-xl object-contain bg-white" />
            <span className="font-bold text-2xl text-slate-800 font-sora">
              Medi<span className="text-sky-600">Wave</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-2">Sign in to access your healthcare dashboard</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs text-sky-600 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10 transition-shadow"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-600 font-medium hover:underline">Create one free</Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 bg-sky-50 border-b border-sky-100">
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Demo Credentials — Click to Auto-fill</p>
          </div>
          <div className="divide-y divide-slate-100">
            {demoCredentials.map((cred, idx) => (
              <div key={idx} onClick={() => fillCredentials(cred)}
                className="flex items-center justify-between px-4 py-3 hover:bg-sky-50 cursor-pointer transition-colors group">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{cred.role}</p>
                  <p className="text-xs text-slate-400 font-mono">{cred.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">{cred.password}</span>
                  <button onClick={e => { e.stopPropagation(); copyToClipboard(`${cred.email} / ${cred.password}`, idx); }}
                    className="p-1 rounded text-slate-400 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all">
                    {copiedIdx === idx ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
