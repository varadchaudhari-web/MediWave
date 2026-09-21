import { Link } from 'react-router-dom';
import { Shield, Eye, Globe, Heart, FlaskConical, Users } from 'lucide-react';
import AvatarWithFallback from '@/components/ui/AvatarWithFallback';

export default function About() {
  const milestones = [
    { year: '2022', title: 'Founded', desc: 'MediWave launched with a mission to democratize healthcare access in India.' },
    { year: '2023', title: 'Series A', desc: 'Raised Rs.120 Cr in Series A funding. Expanded to 50 cities.' },
    { year: '2024', title: '1M Patients', desc: 'Reached 1 million patient milestone. Launched telemedicine platform.' },
    { year: '2025', title: 'Series B', desc: 'Raised Rs.480 Cr. Launched AI symptom checker and emergency services.' },
    { year: '2026', title: '5M+ Users', desc: '5 million active users. 15,000 doctors. 200+ cities. Pan-India presence.' },
  ];

  const team = [
    { name: 'Dr. Arjun Mehta', role: 'CEO & Co-founder', img: '/avatars/team-1.svg' },
    { name: 'Priya Krishnamurthy', role: 'CTO & Co-founder', img: '/avatars/team-2.svg' },
    { name: 'Dr. Rakesh Sharma', role: 'Chief Medical Officer', img: '/avatars/team-3.svg' },
    { name: 'Ananya Gupta', role: 'VP Product', img: '/avatars/team-4.svg' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold text-white font-sora mb-4">About MediWave</h1>
          <p className="text-sky-200 text-lg leading-relaxed">
            We're on a mission to make quality healthcare accessible to every Indian, everywhere — through technology, empathy, and innovation.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {/* Mission */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 font-sora mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              MediWave was founded on a simple belief: every person deserves access to quality healthcare, regardless of where they live or what they earn.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We connect patients with 15,000+ verified doctors, provide instant telemedicine consultations, and enable home delivery of medicines and lab tests across India.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Patients Served', value: '5M+' },
              { label: 'Verified Doctors', value: '15K+' },
              { label: 'Cities', value: '200+' },
              { label: 'Customer Rating', value: '4.8' },
            ].map(stat => (
              <div key={stat.label} className="bg-sky-50 rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-sky-600">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-3xl font-bold text-slate-800 font-sora mb-10 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-sky-100" />
            <div className="space-y-8">
              {milestones.map(m => (
                <div key={m.year} className="flex gap-6 ml-8">
                  <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 -ml-10 mt-1">
                    {m.year}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{m.title}</h3>
                    <p className="text-slate-600 text-sm mt-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-3xl font-bold text-slate-800 font-sora mb-10 text-center">Leadership Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="text-center">
                <AvatarWithFallback
                  src={member.img}
                  alt={member.name}
                  fallbackName={member.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-sky-100"
                  fallbackClassName="w-20 h-20 rounded-2xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-base mx-auto border-2 border-sky-100"
                />
                <p className="font-semibold text-slate-800 mt-3">{member.name}</p>
                <p className="text-sky-600 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-50 rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-slate-800 font-sora mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Heart size={22} className="text-red-500" />, bg: 'bg-red-50', title: 'Patient First', desc: 'Every decision we make starts with the patient. Your health and wellbeing is our north star.' },
              { icon: <FlaskConical size={22} className="text-sky-600" />, bg: 'bg-sky-50', title: 'Medical Excellence', desc: 'We partner only with verified, qualified healthcare providers who meet our rigorous standards.' },
              { icon: <Globe size={22} className="text-emerald-600" />, bg: 'bg-emerald-50', title: 'Accessibility', desc: 'Healthcare should know no barriers. We build for every Indian, in every corner of the country.' },
            ].map(value => (
              <div key={value.title} className="text-center">
                <div className={`w-14 h-14 ${value.bg} rounded-2xl flex items-center justify-center mx-auto`}>
                  {value.icon}
                </div>
                <h3 className="font-bold text-slate-800 mt-3 mb-2">{value.title}</h3>
                <p className="text-slate-500 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Join the MediWave Mission</h2>
          <p className="text-sky-100 mb-6">Help us build the future of healthcare in India.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/careers" className="px-6 py-3 bg-white text-sky-700 rounded-xl font-semibold hover:bg-sky-50 transition-colors">View Careers</Link>
            <Link to="/contact" className="px-6 py-3 bg-sky-500/30 border border-white/30 text-white rounded-xl font-semibold hover:bg-sky-500/50 transition-colors">Contact Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
