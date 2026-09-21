import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, Stethoscope, Building2, FlaskConical, Pill } from 'lucide-react';
import { UserRole } from '@/types';
import logo from '@/assets/logo.png';
import { isValidEmail, isValidMobile, isValidName, isValidPassword, sanitizeEmail, sanitizeMobile, sanitizeName, sanitizePassword } from '@/lib/validation';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: 'patient', agree: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeEmail(form.email);
    if (!isValidName(form.name)) { toast.error('Full name must contain only alphabets and spaces'); return; }
    if (!isValidMobile(form.phone)) { toast.error('Mobile number must be exactly 10 digits'); return; }
    if (!isValidEmail(cleanEmail)) { toast.error('Enter a valid email address'); return; }
    if (!isValidPassword(form.password)) { toast.error('Password must be 8+ chars with letters and numbers'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (!form.agree) { toast.error('Please accept terms'); return; }
    setLoading(true);
    const success = await register({
      name: form.name,
      email: cleanEmail,
      phone: form.phone,
      password: form.password,
      role: form.role as UserRole,
    });
    setLoading(false);
    if (!success) return;
    const path =
      form.role === 'doctor' ? '/dashboard/doctor' :
      form.role === 'admin' ? '/dashboard/admin' :
      form.role === 'lab' ? '/dashboard/lab' :
      form.role === 'pharmacy' ? '/dashboard/pharmacy' :
      '/dashboard/patient';
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="MediWave" className="w-10 h-10 rounded-xl object-contain bg-white" />
            <span className="font-bold text-2xl text-slate-800 font-sora">Medi<span className="text-sky-600">Wave</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="text-slate-500 text-sm mt-2">Join 5M+ users managing their health on MediWave</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Register as</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { value: 'patient', label: 'Patient', icon: User },
                  { value: 'doctor', label: 'Doctor', icon: Stethoscope },
                  { value: 'admin', label: 'Hospital Admin', icon: Building2 },
                  { value: 'lab', label: 'Lab Partner', icon: FlaskConical },
                  { value: 'pharmacy', label: 'Pharmacy Partner', icon: Pill },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`min-h-[72px] px-2 py-2.5 rounded-xl border-2 text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                      form.role === r.value ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-sky-200'
                    }`}
                  >
                    <r.icon size={18} />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: sanitizeName(e.target.value) }))}
                  onBlur={() => form.name && !isValidName(form.name) && toast.error('Full name must be 2-50 alphabets only')}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: sanitizeMobile(e.target.value) }))}
                  onBlur={() => form.phone && !isValidMobile(form.phone) && toast.error('Mobile number must be exactly 10 digits')}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address</label>
              <input
                type="text"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: sanitizeEmail(e.target.value) }))}
                onBlur={() => form.email && !isValidEmail(form.email) && toast.error('Enter a valid email address')}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: sanitizePassword(e.target.value) }))}
                    onBlur={() => form.password && !isValidPassword(form.password) && toast.error('Password must include letters and numbers')}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-400">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: sanitizePassword(e.target.value) }))}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))}
                className="mt-0.5 accent-sky-600"
              />
              <span className="text-xs text-slate-500">
                I agree to MediWave's{' '}
                <Link to="/terms" className="text-sky-600 underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-sky-600 underline">Privacy Policy</Link>.
                I consent to receiving health-related communications.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account — Free'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          {['HIPAA Compliant', 'DPDP Act', 'SSL Secured', 'Free for Patients'].map(b => (
            <span key={b} className="flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" />
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
