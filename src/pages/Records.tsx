import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicalRecords } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, Download, Search, X, Calendar, Lock, Pill, FlaskConical, Syringe, Building2, Shield } from 'lucide-react';
import { MedicalRecord } from '@/types';
import { generateReport } from '@/lib/reportGenerator';

export default function Records() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState(medicalRecords);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<MedicalRecord | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-sky-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Health Records</h2>
          <p className="text-slate-500 text-sm mb-6">Your complete medical history, securely stored and easily accessible.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700">
            Login to View Records
          </button>
        </div>
      </div>
    );
  }

  const filtered = records.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeIcon = (type: string) => {
    switch (type) {
      case 'prescription': return Pill;
      case 'report': return FlaskConical;
      case 'vaccination': return Syringe;
      case 'discharge': return Building2;
      case 'insurance': return Shield;
      default: return FileText;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-blue-100 text-blue-700';
      case 'report': return 'bg-purple-100 text-purple-700';
      case 'vaccination': return 'bg-green-100 text-green-700';
      case 'discharge': return 'bg-amber-100 text-amber-700';
      case 'insurance': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const typeCounts = {
    all: records.length,
    prescription: records.filter(r => r.type === 'prescription').length,
    report: records.filter(r => r.type === 'report').length,
    vaccination: records.filter(r => r.type === 'vaccination').length,
    discharge: records.filter(r => r.type === 'discharge').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-sora">Health Records</h1>
              <p className="text-sky-200 text-sm mt-1">Your complete medical history</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-50 shadow">
              <Upload size={16} />
              Upload Record
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
            <Search size={16} className="text-white/60" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search records..."
              className="flex-1 bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Records', count: records.length, icon: FileText, color: 'text-slate-700' },
            { label: 'Prescriptions', count: typeCounts.prescription, icon: Pill, color: 'text-blue-600' },
            { label: 'Lab Reports', count: typeCounts.report, icon: FlaskConical, color: 'text-purple-600' },
            { label: 'Vaccinations', count: typeCounts.vaccination, icon: Syringe, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="medical-card p-4 text-center">
              <s.icon size={24} className={`${s.color} mx-auto`} />
              <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { value: 'all', label: `All (${typeCounts.all})` },
            { value: 'prescription', label: 'Prescriptions' },
            { value: 'report', label: 'Reports' },
            { value: 'vaccination', label: 'Vaccination' },
            { value: 'discharge', label: 'Discharge' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                typeFilter === t.value ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Records list */}
        <div className="space-y-3">
          {filtered.map(record => (
            <div
              key={record.id}
              onClick={() => setSelected(record)}
              className="medical-card p-5 cursor-pointer hover:border-sky-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                  {(() => { const Icon = typeIcon(record.type); return <Icon size={22} className="text-sky-600" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">{record.title}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor(record.type)} capitalize`}>
                      {record.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">{record.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} />
                      {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {record.doctor && <span className="text-xs text-sky-500">{record.doctor}</span>}
                    {record.hospital && <span className="text-xs text-slate-400">• {record.hospital}</span>}
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {record.tags.map(tag => (
                      <span key={tag} className="badge-primary">{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); generateReport(record.type === 'report' ? 'lab' : record.type === 'discharge' ? 'discharge' : record.type === 'insurance' ? 'insurance' : 'medical', { record, title: record.title, patientId: record.patientId, hospital: record.hospital, doctorName: record.doctor, date: record.date, notes: record.description }); }}
                  className="shrink-0 p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => { const Icon = typeIcon(selected.type); return <Icon size={20} className="text-sky-600" />; })()}
                <h3 className="font-bold text-slate-800">Record Details</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-800 text-base">{selected.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{selected.type}</p>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-400 mb-0.5">Date</p>
                  <p className="font-medium text-slate-800">{new Date(selected.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {selected.doctor && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-slate-400 mb-0.5">Doctor</p>
                    <p className="font-medium text-slate-800">{selected.doctor}</p>
                  </div>
                )}
                {selected.hospital && (
                  <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                    <p className="text-slate-400 mb-0.5">Hospital / Lab</p>
                    <p className="font-medium text-slate-800">{selected.hospital}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                <button onClick={() => generateReport(selected.type === 'report' ? 'lab' : selected.type === 'discharge' ? 'discharge' : selected.type === 'insurance' ? 'insurance' : 'medical', { record: selected, title: selected.title, patientId: selected.patientId, hospital: selected.hospital, doctorName: selected.doctor, date: selected.date, notes: selected.description })} className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-medium hover:bg-sky-700">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
