import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail, isValidMobile, isValidName, sanitizeEmail, sanitizeMobile, sanitizeName, sanitizeText } from '@/lib/validation';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidName(form.name)) { toast.error('Full name must contain only alphabets and spaces'); return; }
    if (!isValidEmail(form.email)) { toast.error('Enter a valid email address'); return; }
    if (form.phone && !isValidMobile(form.phone)) { toast.error('Mobile number must be exactly 10 digits'); return; }
    if (form.message.trim().length < 10) { toast.error('Message must be at least 10 characters'); return; }
    setTimeout(() => setSubmitted(true), 600);
    toast.success('Message sent! We\'ll respond within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold text-white font-sora mb-3">Contact Us</h1>
          <p className="text-sky-200 text-lg">We're here to help. Reach out through any channel below.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4">Get in Touch</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Have questions? Need support? Our team is available 24/7 for medical emergencies and during business hours for general inquiries.
              </p>
            </div>

            {[
              { icon: Phone, title: 'Phone Support', details: ['1800-MED-WAVE (Toll Free)', '24/7 Emergency: 108'], color: 'bg-sky-50 text-sky-600' },
              { icon: Mail, title: 'Email', details: ['care@mediwave.health', 'support@mediwave.health'], color: 'bg-purple-50 text-purple-600' },
              { icon: MapPin, title: 'Head Office', details: ['MediWave Health Technologies', '42 Innovation Park, Whitefield', 'Bangalore - 560066, Karnataka'], color: 'bg-emerald-50 text-emerald-600' },
              { icon: Clock, title: 'Business Hours', details: ['Mon-Fri: 9 AM - 6 PM', 'Emergency: 24/7'], color: 'bg-amber-50 text-amber-600' },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  {item.details.map((d, i) => <p key={i} className="text-slate-500 text-xs mt-0.5">{d}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Message Received!</h3>
                <p className="text-slate-500">Our team will respond to you within 24 business hours.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 px-5 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-800 mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</label>
                      <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: sanitizeName(e.target.value) }))} onBlur={() => form.name && !isValidName(form.name) && toast.error('Full name must be 2-50 alphabets only')} placeholder="John Smith" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email *</label>
                      <input required type="text" value={form.email} onChange={e => setForm(f => ({ ...f, email: sanitizeEmail(e.target.value) }))} onBlur={() => form.email && !isValidEmail(form.email) && toast.error('Enter a valid email address')} placeholder="you@email.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone</label>
                      <input type="tel" inputMode="numeric" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: sanitizeMobile(e.target.value) }))} onBlur={() => form.phone && !isValidMobile(form.phone) && toast.error('Mobile number must be exactly 10 digits')} placeholder="+91 98765 43210" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subject *</label>
                      <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="">Select topic</option>
                        <option>Patient Support</option>
                        <option>Doctor Partnership</option>
                        <option>Technical Issue</option>
                        <option>Billing / Payments</option>
                        <option>General Inquiry</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Message *</label>
                    <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: sanitizeText(e.target.value, 500) }))} placeholder="How can we help you?" rows={5} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Send size={16} />
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
