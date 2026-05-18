import { useState, useEffect } from 'react';
import { Phone, MapPin, Clock, AlertTriangle, CheckCircle, Navigation, Zap, Ambulance, Activity, Users, Heart } from 'lucide-react';
import { AmbulanceRequest } from '@/types';
import { toast } from 'sonner';

const TRACKING_STAGES = [
  { status: 'requested', label: 'SOS Received', desc: 'Your emergency request has been received', color: 'bg-amber-100 text-amber-700' },
  { status: 'dispatched', label: 'Ambulance Dispatched', desc: 'Nearest ambulance assigned and on the way', color: 'bg-sky-100 text-sky-700' },
  { status: 'en-route', label: 'En Route to You', desc: 'Ambulance is navigating to your location', color: 'bg-blue-100 text-blue-700' },
  { status: 'arrived', label: 'Ambulance Arrived', desc: 'The ambulance has reached your location', color: 'bg-emerald-100 text-emerald-700' },
];

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [request, setRequest] = useState<AmbulanceRequest | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [eta, setEta] = useState(8);
  const [countdown, setCountdown] = useState(3);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!sosActive || !request) return;

    const stageTimer = setTimeout(() => {
      if (currentStage < TRACKING_STAGES.length - 1) {
        setCurrentStage(prev => prev + 1);
        const stageLabels = ['', 'Ambulance has been dispatched! ETA: 8 minutes', 'Ambulance is en route to you', 'Ambulance has arrived at your location!'];
        if (stageLabels[currentStage + 1]) toast.success(stageLabels[currentStage + 1]);
      }
    }, 5000);

    const etaTimer = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(stageTimer);
      clearInterval(etaTimer);
    };
  }, [sosActive, currentStage, request]);

  const activateSOS = () => {
    setSosActive(true);
    setRequest({
      id: 'amb1',
      status: 'requested',
      ambulanceNo: 'MH-02-AMP-1234',
      driverName: 'Suresh Kumar',
      driverPhone: '+91 98765 00001',
      eta: 8,
      distance: '2.4 km',
    });
    toast.success('Emergency SOS activated! Ambulance is being dispatched.');
    setCurrentStage(0);
    setTimeout(() => setCurrentStage(1), 3000);
    setTimeout(() => setCurrentStage(2), 8000);
    setTimeout(() => setCurrentStage(3), 15000);
  };

  const handleSOS = () => {
    if (confirming) {
      setConfirming(false);
      activateSOS();
    } else {
      setConfirming(true);
      let c = 3;
      setCountdown(c);
      const timer = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(timer);
          setConfirming(false);
          activateSOS();
        }
      }, 1000);
    }
  };

  const handleCancel = () => {
    setSosActive(false);
    setRequest(null);
    setCurrentStage(0);
    setEta(8);
    setConfirming(false);
    setCountdown(3);
    toast.info('Emergency request cancelled');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-red-700 to-red-600 pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-white font-sora mb-1">Emergency Services</h1>
          <p className="text-red-200 text-sm">24/7 ambulance dispatch with real-time tracking</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* SOS Button Panel */}
          <div className="space-y-6">
            {!sosActive ? (
              <div className="medical-card p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Medical Emergency?</h2>
                <p className="text-slate-500 text-sm mb-8">Press the SOS button to dispatch an ambulance immediately to your location.</p>

                <div className="relative flex items-center justify-center mb-8">
                  <div className={`absolute w-40 h-40 rounded-full ${confirming ? 'bg-red-200 animate-ping' : 'bg-red-100'} opacity-50`} />
                  <div className={`absolute w-32 h-32 rounded-full ${confirming ? 'bg-red-300 animate-ping' : 'bg-red-200'} opacity-50`} style={{ animationDelay: '0.3s' }} />
                  <button
                    onClick={handleSOS}
                    className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-2xl transition-transform active:scale-95 z-10 ${confirming ? 'bg-red-600 scale-110' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    <Ambulance size={32} />
                    <span className="text-sm font-black mt-1">{confirming ? `SOS (${countdown})` : 'SOS'}</span>
                  </button>
                </div>

                {confirming && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                    <p className="text-red-700 font-semibold">Activating in {countdown}s...</p>
                    <p className="text-red-500 text-sm">Ambulance will be dispatched automatically</p>
                    <button onClick={handleCancel} className="mt-3 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50">
                      Cancel SOS
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:108" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                    <Phone size={16} className="text-red-500" />
                    <div className="text-left">
                      <p className="font-semibold text-red-700 text-sm">Call 108</p>
                      <p className="text-red-400 text-xs">National Helpline</p>
                    </div>
                  </a>
                  <a href="tel:112" className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                    <Phone size={16} className="text-amber-500" />
                    <div className="text-left">
                      <p className="font-semibold text-amber-700 text-sm">Call 112</p>
                      <p className="text-amber-400 text-xs">Emergency</p>
                    </div>
                  </a>
                </div>
              </div>
            ) : (
              <div className="medical-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <h3 className="font-bold text-slate-800">Emergency Active</h3>
                  <button onClick={handleCancel} className="ml-auto px-3 py-1.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-medium hover:bg-slate-50">
                    Cancel
                  </button>
                </div>

                {request && (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                      <p className="text-red-500 text-sm font-medium">Estimated Arrival</p>
                      <p className="text-4xl font-bold text-red-600">{eta} <span className="text-lg">min</span></p>
                      <p className="text-red-400 text-xs">{request.distance} away</p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                        <Ambulance size={22} className="text-sky-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{request.driverName}</p>
                        <p className="text-sky-600 text-xs">{request.ambulanceNo}</p>
                      </div>
                      <a href={`tel:${request.driverPhone}`} className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center hover:bg-emerald-200">
                        <Phone size={16} className="text-emerald-600" />
                      </a>
                    </div>

                    {/* Map simulation */}
                    <div className="relative h-40 bg-gradient-to-br from-slate-100 to-sky-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-20">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="absolute border-slate-300" style={{ left: `${i * 20}%`, top: 0, bottom: 0, borderLeftWidth: '1px' }} />
                        ))}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="absolute border-slate-300" style={{ top: `${i * 25}%`, left: 0, right: 0, borderTopWidth: '1px' }} />
                        ))}
                      </div>
                      <div className="relative z-10 text-center">
                        <div className="w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto animate-bounce">
                          <Navigation size={16} className="text-white" />
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-2">Your Location</p>
                      </div>
                      <div className="absolute top-1/3 left-1/4 animate-pulse">
                        <div className="w-8 h-8 bg-sky-500 rounded-full border-2 border-white shadow flex items-center justify-center">
                          <Ambulance size={14} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {sosActive && (
              <div className="medical-card p-5">
                <h4 className="font-semibold text-slate-800 mb-4">Live Status</h4>
                <div className="space-y-3">
                  {TRACKING_STAGES.map((stage, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${idx <= currentStage ? stage.color : 'bg-slate-50 text-slate-400'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${idx <= currentStage ? '' : 'bg-slate-100'}`}>
                        {idx <= currentStage ? <CheckCircle size={16} /> : <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{stage.label}</p>
                        <p className="text-xs opacity-70">{stage.desc}</p>
                      </div>
                      {idx === currentStage && idx < TRACKING_STAGES.length - 1 && (
                        <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            <div className="medical-card p-5">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Emergency Types We Handle
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Heart size={14} />, label: 'Cardiac Arrest', color: 'text-red-500' },
                  { icon: <Activity size={14} />, label: 'Stroke', color: 'text-purple-500' },
                  { icon: <Activity size={14} />, label: 'Respiratory', color: 'text-sky-500' },
                  { icon: <AlertTriangle size={14} />, label: 'Accidents', color: 'text-amber-500' },
                  { icon: <Users size={14} />, label: 'Maternity', color: 'text-pink-500' },
                  { icon: <AlertTriangle size={14} />, label: 'Burns/Trauma', color: 'text-orange-500' },
                  { icon: <Activity size={14} />, label: 'Overdose', color: 'text-indigo-500' },
                  { icon: <Heart size={14} />, label: 'Chest Pain', color: 'text-red-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-xs font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="medical-card p-5">
              <h4 className="font-semibold text-slate-800 mb-4">Our Fleet</h4>
              <div className="space-y-3">
                {[
                  { type: 'BLS Ambulance', desc: 'Basic life support with trained paramedics', available: 12 },
                  { type: 'ALS Ambulance', desc: 'Advanced life support with doctor onboard', available: 5 },
                  { type: 'ICU Ambulance', desc: 'Mobile ICU for critical patients', available: 3 },
                  { type: 'Neonatal', desc: 'Specialized newborn emergency care', available: 2 },
                ].map(fleet => (
                  <div key={fleet.type} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <Ambulance size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">{fleet.type}</p>
                      <p className="text-slate-400 text-xs">{fleet.desc}</p>
                    </div>
                    <span className="text-xs font-medium text-emerald-600">{fleet.available} nearby</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-500" />
                <h4 className="font-semibold text-red-800">First Aid Tips</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-red-600">
                <li>• Keep the patient calm and still</li>
                <li>• Do NOT move the patient if spinal injury suspected</li>
                <li>• Apply direct pressure to stop bleeding</li>
                <li>• Do NOT give food or water to unconscious patients</li>
                <li>• Perform CPR if patient is unresponsive and not breathing</li>
                <li>• Stay on the line with emergency services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
