import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, MapPin, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { doctors, specializations } from '@/data/doctors';
import { Doctor } from '@/types';
import DoctorCard from '@/components/features/DoctorCard';
import BookingModal from '@/components/features/BookingModal';

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All');
  const [sortBy, setSortBy] = useState('rating');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [telemedicineOnly, setTelemedicineOnly] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const filtered = doctors
    .filter(d => {
      const matchesQuery = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.specialty.toLowerCase().includes(query.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      const matchesSpecialty = specialty === 'All' || d.specialty === specialty;
      const matchesAvailable = !availableOnly || d.available;
      const matchesTele = !telemedicineOnly || d.telemedicineEnabled;
      return matchesQuery && matchesSpecialty && matchesAvailable && matchesTele;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'fee_low') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee_high') return b.consultationFee - a.consultationFee;
      return 0;
    });

  const specialtyOptions = ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white font-sora mb-2">Find the Right Doctor</h1>
          <p className="text-sky-200 mb-6">{filtered.length} doctors available</p>

          {/* Search */}
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg max-w-2xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Doctor name, specialty, or symptom..."
                className="flex-1 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
              />
              {query && <button onClick={() => setQuery('')}><X size={14} className="text-slate-400" /></button>}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-100 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-200 transition-colors"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className={`mb-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Specialty */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block uppercase tracking-wide">Specialty</label>
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {specialtyOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block uppercase tracking-wide">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee_low">Fee: Low to High</option>
                  <option value="fee_high">Fee: High to Low</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-500 block uppercase tracking-wide">Options</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setAvailableOnly(!availableOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${availableOnly ? 'bg-sky-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${availableOnly ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-600">Available Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setTelemedicineOnly(!telemedicineOnly)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${telemedicineOnly ? 'bg-sky-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${telemedicineOnly ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-slate-600">Video Consult</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => { setQuery(''); setSpecialty('All'); setAvailableOnly(false); setTelemedicineOnly(false); setSortBy('rating'); }}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specialty pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {['All', ...specializations.slice(0, 8).map(s => s.name)].map(s => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                specialty === s ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-xl font-semibold text-slate-700">No doctors found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBook={(d) => { setSelectedDoctor(d); setBookingOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <BookingModal doctor={selectedDoctor} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
