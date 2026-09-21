import { useState } from 'react';
import { MapPin, Briefcase, Clock, ArrowRight, Search, TrendingUp, Users, DollarSign, Heart } from 'lucide-react';
import { sanitizeSearch } from '@/lib/validation';

const jobs = [
  { id: 1, title: 'Senior Full Stack Engineer', dept: 'Engineering', location: 'Bangalore', type: 'Full-time', posted: '3 days ago', desc: 'Build scalable healthcare platform serving millions of patients across India.' },
  { id: 2, title: 'Product Manager - Telemedicine', dept: 'Product', location: 'Bangalore / Remote', type: 'Full-time', posted: '5 days ago', desc: 'Drive the vision and roadmap for our telemedicine product, used by 15K+ doctors.' },
  { id: 3, title: 'Clinical Data Scientist', dept: 'AI/ML', location: 'Bangalore', type: 'Full-time', posted: '1 week ago', desc: 'Build AI models for symptom analysis, diagnosis assistance, and patient outcomes.' },
  { id: 4, title: 'Medical Affairs Specialist', dept: 'Medical', location: 'Delhi', type: 'Full-time', posted: '1 week ago', desc: 'Manage relationships with healthcare providers and ensure clinical quality standards.' },
  { id: 5, title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Bangalore', type: 'Full-time', posted: '2 weeks ago', desc: 'Drive patient acquisition and engagement across digital channels at scale.' },
  { id: 6, title: 'UI/UX Designer', dept: 'Design', location: 'Remote', type: 'Full-time', posted: '2 weeks ago', desc: 'Design intuitive, accessible healthcare experiences for patients and doctors.' },
  { id: 7, title: 'Customer Success Manager', dept: 'Customer Success', location: 'Mumbai', type: 'Full-time', posted: '3 weeks ago', desc: 'Ensure hospital and pharmacy partner success on the MediWave platform.' },
  { id: 8, title: 'Data Analyst - Healthcare', dept: 'Analytics', location: 'Bangalore', type: 'Full-time', posted: '1 month ago', desc: 'Analyze platform data to uncover insights improving patient and doctor experiences.' },
];

export default function Careers() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);

  const depts = ['All', ...Array.from(new Set(jobs.map(j => j.dept)))];
  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.dept.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || j.dept === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-sky-500/30 border border-sky-400/30 text-sky-200 text-sm px-4 py-1.5 rounded-full mb-4">We're hiring!</span>
          <h1 className="text-4xl font-bold text-white font-sora mb-4">Build the Future of Healthcare</h1>
          <p className="text-sky-200 text-lg mb-8 max-w-2xl mx-auto">
            Join our mission to make quality healthcare accessible to every Indian. Work with a talented team solving real problems at scale.
          </p>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-lg max-w-xl mx-auto">
            <Search size={18} className="text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(sanitizeSearch(e.target.value))} placeholder="Search roles..." className="flex-1 text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-4 gap-5 mb-12">
          {[
            { icon: <Heart size={22} className="text-rose-500" />, bg: 'bg-rose-50', title: 'Real Impact', desc: '5M+ lives touched daily' },
            { icon: <TrendingUp size={22} className="text-emerald-600" />, bg: 'bg-emerald-50', title: 'Fast Growth', desc: '3x YoY for 3 years' },
            { icon: <Users size={22} className="text-sky-600" />, bg: 'bg-sky-50', title: 'Great Team', desc: '500+ mission-driven people' },
            { icon: <DollarSign size={22} className="text-amber-600" />, bg: 'bg-amber-50', title: 'Great Pay', desc: 'Competitive + equity' },
          ].map(v => (
            <div key={v.title} className="medical-card p-5 text-center">
              <div className={`w-12 h-12 ${v.bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>{v.icon}</div>
              <p className="font-semibold text-slate-800">{v.title}</p>
              <p className="text-slate-500 text-xs mt-1">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {depts.map(d => (
            <button key={d} onClick={() => setDeptFilter(d)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-all ${deptFilter === d ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'}`}>{d}</button>
          ))}
        </div>

        {/* Job listings */}
        <div className="space-y-4 mb-10">
          {filtered.map(job => (
            <div key={job.id} className="medical-card p-5 cursor-pointer hover:border-sky-200 group" onClick={() => setSelectedJob(job)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">{job.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{job.desc}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                    <span className="bg-sky-100 text-sky-700 font-medium px-2.5 py-0.5 rounded-full">{job.dept}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={11} />{job.type}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{job.posted}</span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-medium hover:bg-sky-700 transition-colors shrink-0">
                  Apply <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400">No jobs found matching your criteria.</div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-3xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Don't see your role?</h3>
          <p className="text-sky-100 mb-6">We're always looking for talented people passionate about healthcare and technology.</p>
          <a href="mailto:careers@mediwave.health" className="inline-block px-6 py-3 bg-white text-sky-700 rounded-xl font-semibold hover:bg-sky-50 transition-colors">
            Send us your resume
          </a>
        </div>
      </div>

      {/* Job detail modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-xl">{selectedJob.title}</h2>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="bg-sky-100 text-sky-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{selectedJob.dept}</span>
                <span className="text-xs text-slate-500">{selectedJob.location}</span>
                <span className="text-xs text-slate-500">• {selectedJob.type}</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">About the Role</h4>
                <p className="text-slate-600 text-sm">{selectedJob.desc}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">What you'll do</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {['Work on high-impact healthcare products', 'Collaborate with cross-functional teams', 'Make data-driven decisions', 'Mentor and grow with the team'].map(item => (
                    <li key={item} className="flex items-start gap-2"><span className="text-sky-500 mt-0.5">•</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedJob(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium">Close</button>
                <a href="mailto:careers@mediwave.health" className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold text-center hover:bg-sky-700">Apply Now</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
