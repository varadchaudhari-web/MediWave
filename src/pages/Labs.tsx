import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { labTests, labCategories, healthPackages } from '@/data/labTests';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequiredModal } from '@/components/features/Modal';
import { Search, Home, Clock, CheckCircle, X, FlaskConical, MapPin, Phone } from 'lucide-react';
import { LabTest } from '@/types';
import { toast } from 'sonner';
import { useAppData } from '@/contexts/AppDataContext';

export default function Labs() {
  const { isAuthenticated, user } = useAuth();
  const { addLabOrder } = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'tests' | 'packages'>('tests');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [loginModal, setLoginModal] = useState(false);
  const [bookingTest, setBookingTest] = useState<LabTest | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [homeCollection, setHomeCollection] = useState(true);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Home collection form
  const [homeForm, setHomeForm] = useState({
    fullAddress: '',
    mobileNumber: '',
    email: '',
    city: '',
    pincode: '',
  });

  const filtered = labTests.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || t.category === category;
    return matchSearch && matchCat;
  });

  const handleBook = (test: LabTest) => {
    if (!isAuthenticated) { setLoginModal(true); return; }
    setBookingTest(test);
    setHomeCollection(test.homeCollection);
    setBookingStep(1);
    setBooked(false);
    setSelectedDate('');
    setSelectedTime('');
    setHomeForm({ fullAddress: '', mobileNumber: '', email: '', city: '', pincode: '' });
  };

  const confirmBooking = () => {
    if (homeCollection) {
      if (!homeForm.fullAddress || !homeForm.mobileNumber || !homeForm.city || !homeForm.pincode) {
        toast.error('Please fill all required address fields');
        return;
      }
    }
    setTimeout(() => {
      const order = addLabOrder({
        patient: user?.name || 'John Smith',
        patientId: user?.id || 'p1',
        test: bookingTest?.name || 'Lab Test',
        date: selectedDate,
        time: selectedTime,
        homeCollection,
        amount: bookingTest?.price || 0,
      });
      setBookingId(order.id);
      setBooked(true);
    }, 800);
  };

  const today = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      value: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
    };
  });

  const timeSlots = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM', '06:00 PM'];

  // Lab addresses for Visit Lab mode
  const labAddresses = [
    { name: 'MediWave Diagnostics - Main Lab', address: '42 Medical Complex, Andheri East, Mumbai 400069', phone: '+91 22 4000 1234', timing: 'Mon-Sun: 7AM - 8PM' },
    { name: 'MediWave Diagnostics - Bandra', address: '18 Hill Road, Bandra West, Mumbai 400050', phone: '+91 22 4000 5678', timing: 'Mon-Sat: 7AM - 7PM' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-white font-sora mb-2">Lab Tests & Health Packages</h1>
          <p className="text-sky-200 text-sm mb-6">Book 500+ tests with home sample collection · Reports in 6-48 hours</p>
          <div className="flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search test name or condition..."
                className="flex-1 text-sm focus:outline-none"
              />
              {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Home size={18} className="text-sky-600" />, label: 'Home Collection', value: 'Free', color: 'text-sky-600' },
            { icon: <Clock size={18} className="text-emerald-600" />, label: 'Report Time', value: '6 hrs', color: 'text-emerald-600' },
            { icon: <FlaskConical size={18} className="text-purple-600" />, label: 'NABL Labs', value: '100+', color: 'text-purple-600' },
            { icon: <CheckCircle size={18} className="text-amber-600" />, label: 'Avg Savings', value: '55%', color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="medical-card p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className={`font-bold text-lg ${s.color} mt-1`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
          {(['tests', 'packages'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {tab === 'tests' ? 'Individual Tests' : 'Health Packages'}
            </button>
          ))}
        </div>

        {activeTab === 'tests' ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {labCategories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all ${category === cat ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(test => (
                <div key={test.id} className="medical-card p-5 cursor-pointer group" onClick={() => setSelectedTest(test)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-sky-600 transition-colors">{test.name}</h3>
                      <span className="bg-sky-100 text-sky-700 text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block">{test.category}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sky-600">₹{test.price}</p>
                      <p className="text-slate-400 text-xs line-through">₹{test.mrp}</p>
                      <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5">{test.discount}% off</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{test.description}</p>
                  <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><Clock size={11} className="text-sky-500" />{test.reportTime}</div>
                    {test.homeCollection && (
                      <div className="flex items-center gap-1 text-emerald-600"><Home size={11} />Home collection</div>
                    )}
                    <div className="flex items-center gap-1"><FlaskConical size={11} className="text-purple-500" />{test.sampleType}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleBook(test); }}
                    className="w-full py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors">
                    Book Test
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthPackages.map(pkg => (
              <div key={pkg.id} className={`medical-card p-6 relative ${pkg.popular ? 'ring-2 ring-sky-500' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-600 text-white text-xs font-semibold rounded-full">Most Popular</div>
                )}
                <FlaskConical size={24} className="text-sky-600 mb-3" />
                <h3 className="font-bold text-slate-800 mb-1">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{pkg.tests} tests • {pkg.ageGroup}</p>
                <p className="text-xs text-slate-400 mb-3">Report in {pkg.reportTime}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-sky-600">₹{pkg.price.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm line-through ml-2">₹{pkg.mrp.toLocaleString()}</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">{pkg.discount}% off</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {pkg.includes.slice(0, 5).map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle size={11} className="text-emerald-500 shrink-0" />{item}
                    </li>
                  ))}
                  {pkg.includes.length > 5 && <li className="text-xs text-sky-600">+{pkg.includes.length - 5} more...</li>}
                </ul>
                {pkg.homeCollection && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mb-3">
                    <Home size={11} />Free home collection
                  </div>
                )}
                <button
                  onClick={() => { if (!isAuthenticated) setLoginModal(true); else toast.success('Package booking initiated! Our team will call you shortly.'); }}
                  className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-700 transition-colors">
                  Book Package
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelectedTest(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{selectedTest.name}</h3>
              <button onClick={() => setSelectedTest(null)} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl">
                <div>
                  <p className="text-2xl font-bold text-sky-600">₹{selectedTest.price}</p>
                  <p className="text-slate-400 text-sm line-through">MRP ₹{selectedTest.mrp}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-medium">Save {selectedTest.discount}%</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{selectedTest.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 rounded-xl p-3">
                  <Clock size={18} className="text-sky-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-800">{selectedTest.reportTime}</p>
                  <p className="text-xs text-slate-400">Report time</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <FlaskConical size={18} className="text-purple-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-800">{selectedTest.sampleType}</p>
                  <p className="text-xs text-slate-400">Sample type</p>
                </div>
                <div className={`rounded-xl p-3 ${selectedTest.homeCollection ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <Home size={18} className={`${selectedTest.homeCollection ? 'text-emerald-500' : 'text-slate-300'} mx-auto mb-1`} />
                  <p className={`text-xs font-medium ${selectedTest.homeCollection ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {selectedTest.homeCollection ? 'Available' : 'Not avail.'}
                  </p>
                  <p className="text-xs text-slate-400">Home collect</p>
                </div>
              </div>
              {selectedTest.parameters.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Parameters Included ({selectedTest.parameters.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTest.parameters.map(p => (
                      <span key={p} className="bg-sky-100 text-sky-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedTest.preparation && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Preparation Required</p>
                  <p className="text-xs text-amber-600">{selectedTest.preparation}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setSelectedTest(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                <button onClick={() => { setSelectedTest(null); handleBook(selectedTest); }} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => { setBookingTest(null); setBooked(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">{booked ? 'Booking Confirmed!' : `Book: ${bookingTest.name}`}</h3>
              <button onClick={() => { setBookingTest(null); setBooked(false); }} className="p-2 rounded-xl hover:bg-slate-100"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="p-5">
              {booked ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Test Booked!</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {homeCollection
                      ? 'A certified phlebotomist will visit your home at the scheduled time.'
                      : 'Please visit the lab center at the scheduled time with your booking ID.'}
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
                    <p><span className="font-medium">Test:</span> {bookingTest.name}</p>
                    <p><span className="font-medium">Date:</span> {dates.find(d => d.value === selectedDate)?.label}</p>
                    <p><span className="font-medium">Time:</span> {selectedTime}</p>
                    <p><span className="font-medium">Collection:</span> {homeCollection ? 'Home Collection' : 'Lab Visit'}</p>
                    {homeCollection && homeForm.fullAddress && <p><span className="font-medium">Address:</span> {homeForm.fullAddress}, {homeForm.city} - {homeForm.pincode}</p>}
                    <p><span className="font-medium">Amount:</span> ₹{bookingTest.price}</p>
                    <p><span className="font-medium">Booking ID:</span> {bookingId}</p>
                  </div>
                  <button onClick={() => { setBookingTest(null); setBooked(false); }} className="px-8 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">Done</button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3 bg-sky-50 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{bookingTest.name}</span>
                    <span className="font-bold text-sky-600">₹{bookingTest.price}</span>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${bookingStep === s ? 'bg-sky-600 text-white' : bookingStep > s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {bookingStep > s ? <CheckCircle size={14} /> : s}
                        </div>
                        {s < 3 && <div className={`flex-1 h-0.5 ${bookingStep > s ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
                      </div>
                    ))}
                  </div>
                  <div className="flex text-xs text-slate-400 justify-between">
                    <span>Collection Type</span><span>Date & Time</span><span>Payment</span>
                  </div>

                  {bookingStep === 1 && (
                    <>
                      {bookingTest.homeCollection && (
                        <div className="flex gap-2">
                          <button onClick={() => setHomeCollection(true)}
                            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium flex items-center justify-center gap-2 ${homeCollection ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600'}`}>
                            <Home size={16} /> Home Collection
                          </button>
                          <button onClick={() => setHomeCollection(false)}
                            className={`flex-1 p-3 rounded-xl border-2 text-sm font-medium flex items-center justify-center gap-2 ${!homeCollection ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600'}`}>
                            <FlaskConical size={16} /> Visit Lab
                          </button>
                        </div>
                      )}

                      {homeCollection ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-700">Home Collection Address</p>
                          <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">Full Address *</label>
                            <input type="text" value={homeForm.fullAddress} onChange={e => setHomeForm(f => ({ ...f, fullAddress: e.target.value }))}
                              placeholder="Flat/House no, Building, Street, Area"
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-slate-600 block mb-1">Mobile Number *</label>
                              <input type="tel" value={homeForm.mobileNumber} onChange={e => setHomeForm(f => ({ ...f, mobileNumber: e.target.value }))}
                                placeholder="+91 XXXXX XXXXX"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                              <input type="email" value={homeForm.email} onChange={e => setHomeForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="your@email.com"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-slate-600 block mb-1">City *</label>
                              <input type="text" value={homeForm.city} onChange={e => setHomeForm(f => ({ ...f, city: e.target.value }))}
                                placeholder="Mumbai"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-slate-600 block mb-1">Pincode *</label>
                              <input type="text" value={homeForm.pincode} onChange={e => setHomeForm(f => ({ ...f, pincode: e.target.value }))}
                                placeholder="400001" maxLength={6}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-700">Select Lab Center</p>
                          {labAddresses.map((lab, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 cursor-pointer">
                              <p className="font-medium text-slate-800 text-sm">{lab.name}</p>
                              <div className="flex items-start gap-1 mt-1">
                                <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-500">{lab.address}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Phone size={11} />{lab.phone}</span>
                                <span className="flex items-center gap-1"><Clock size={11} />{lab.timing}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button onClick={() => {
                        if (homeCollection && !homeForm.fullAddress || homeCollection && !homeForm.mobileNumber || homeCollection && !homeForm.city || homeCollection && !homeForm.pincode) {
                          toast.error('Please fill all required fields');
                          return;
                        }
                        setBookingStep(2);
                      }} className="w-full py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">Continue</button>
                    </>
                  )}

                  {bookingStep === 2 && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Select Date</p>
                        <div className="flex gap-2 flex-wrap">
                          {dates.map(d => (
                            <button key={d.value} onClick={() => setSelectedDate(d.value)}
                              className={`px-3 py-2 rounded-xl text-xs font-medium border ${selectedDate === d.value ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-200 text-slate-600 hover:border-sky-300'}`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedDate && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Select Time Slot</p>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map(slot => (
                              <button key={slot} onClick={() => setSelectedTime(slot)}
                                className={`py-2 rounded-xl text-xs border ${selectedTime === slot ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-200 text-slate-600 hover:border-sky-300'}`}>
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {bookingTest.preparation && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                          Preparation: {bookingTest.preparation}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button onClick={() => setBookingStep(1)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Back</button>
                        <button onClick={() => selectedDate && selectedTime && setBookingStep(3)}
                          disabled={!selectedDate || !selectedTime}
                          className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          Continue
                        </button>
                      </div>
                    </>
                  )}

                  {bookingStep === 3 && (
                    <>
                      <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                        <h4 className="font-semibold text-slate-800 mb-2">Order Summary</h4>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Test fee</span><span className="font-medium">₹{bookingTest.price}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Collection fee</span><span className="font-medium text-emerald-600">Free</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="font-medium">{dates.find(d => d.value === selectedDate)?.label} at {selectedTime}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-slate-500">Collection</span><span className="font-medium">{homeCollection ? 'Home' : 'Lab Visit'}</span></div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold"><span>Total</span><span className="text-sky-600">₹{bookingTest.price}</span></div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Payment Method</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['UPI / Google Pay', 'Credit / Debit Card', 'Health Insurance', 'MediWave Wallet'].map(m => (
                            <button key={m} className="p-3 rounded-xl border-2 border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium text-left hover:border-sky-400">{m}</button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => setBookingStep(2)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Back</button>
                        <button onClick={confirmBooking} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700">
                          Confirm & Pay ₹{bookingTest.price}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginRequiredModal
        isOpen={loginModal}
        onClose={() => setLoginModal(false)}
        featureName="Book Lab Test"
        description="Please login to book lab tests and access test reports."
        onLogin={() => { setLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
}
