/**
 * VideoCallInterface — Real WebRTC video call implementation.
 * Uses getUserMedia for camera/mic. Simulates the remote doctor feed.
 * Supports: mute, video toggle, end call, chat panel.
 */
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, MessageCircle, X, Send, Monitor, Users, Signal } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallInterfaceProps {
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  patientName?: string;
  isDoctor?: boolean;
  onEnd: () => void;
}

const AUTO_REPLIES = [
  "I can see and hear you clearly. How are you feeling today?",
  "Can you describe when these symptoms started?",
  "I see, let me make a note of that. Is the pain constant or does it come and go?",
  "Based on what you've told me, I'd like to run a few tests. Can you describe the severity on a scale of 1-10?",
  "I understand. I'm going to prescribe some medication. Please take it with meals.",
  "That's helpful information. Have you had any similar episodes before?",
  "Alright, I'll send the prescription to your account now. Any questions?",
];

let replyIndex = 0;

export default function VideoCallInterface({
  doctorName,
  doctorAvatar,
  doctorSpecialty,
  patientName = 'Patient',
  isDoctor = false,
  onEnd,
}: VideoCallInterfaceProps) {
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [localStreamActive, setLocalStreamActive] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: isDoctor ? patientName : doctorName,
      content: isDoctor ? 'Good morning Doctor. I have been having some concerns.' : 'Hello! I can see you clearly. How are you feeling today?',
      time: 'Just now',
      mine: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start WebRTC local stream
  useEffect(() => {
    let mounted = true;

    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStreamActive(true);
      } catch {
        // Camera/mic not available — gracefully continue without it
        setLocalStreamActive(false);
      }
    };

    startStream();

    // Simulate connection after 2s
    const connectTimer = setTimeout(() => {
      if (!mounted) return;
      setCallState('connected');
      toast.success(`Connected to ${isDoctor ? patientName : doctorName}`);

      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 2000);

    // Simulate occasional quality changes
    const qualityTimer = setInterval(() => {
      if (!mounted) return;
      const q = Math.random();
      if (q > 0.85) setConnectionQuality('poor');
      else if (q > 0.5) setConnectionQuality('good');
      else setConnectionQuality('excellent');
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(connectTimer);
      clearInterval(qualityTimer);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Toggle mic track
  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    }
    setMicOn(!micOn);
    toast.info(micOn ? 'Microphone muted' : 'Microphone unmuted');
  };

  // Toggle camera track
  const toggleCam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = !camOn; });
    }
    setCamOn(!camOn);
    toast.info(camOn ? 'Camera off' : 'Camera on');
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCallState('ended');
    toast.info(`Call ended — Duration: ${formatDuration(callDuration)}`);
    setTimeout(onEnd, 1800);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: isDoctor ? 'You (Doctor)' : 'You',
      content: chatInput,
      time: 'Just now',
      mine: true,
    }]);
    setChatInput('');
    // Simulate reply
    setTimeout(() => {
      const reply = isDoctor
        ? 'Thank you doctor. I feel much better after hearing this.'
        : AUTO_REPLIES[replyIndex % AUTO_REPLIES.length];
      replyIndex++;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: isDoctor ? patientName : doctorName,
        content: reply,
        time: 'Just now',
        mine: false,
      }]);
    }, 1500 + Math.random() * 1000);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const qualityColor = { excellent: 'text-emerald-400', good: 'text-amber-400', poor: 'text-red-400' };
  const qualityLabel = { excellent: 'Excellent', good: 'Good', poor: 'Weak Signal' };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden flex" style={{ minHeight: 480 }}>
      {/* Main Video Area */}
      <div className="flex-1 relative">

        {/* CONNECTING STATE */}
        {callState === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 z-20">
            <div className="relative mb-6">
              <img src={doctorAvatar} alt={doctorName} className="w-28 h-28 rounded-full object-cover border-4 border-sky-500 shadow-2xl" />
              <div className="absolute inset-0 rounded-full border-4 border-sky-400/40 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-sky-400/20 animate-ping" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-white font-bold text-xl">{isDoctor ? patientName : doctorName}</p>
            <p className="text-sky-400 text-sm mt-1">{isDoctor ? 'Patient' : doctorSpecialty}</p>
            <div className="flex items-center gap-2 mt-5">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-slate-400 text-sm">Connecting...</span>
            </div>
            <p className="text-slate-500 text-xs mt-3">Requesting camera & microphone access</p>
          </div>
        )}

        {/* ENDED STATE */}
        {callState === 'ended' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 z-20">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
              <Phone size={30} className="text-red-400 rotate-135" />
            </div>
            <p className="text-white font-bold text-xl">Call Ended</p>
            <p className="text-slate-400 mt-2">Duration: {formatDuration(callDuration)}</p>
            <p className="text-slate-500 text-sm mt-1">Prescription will be sent to your account</p>
          </div>
        )}

        {/* CONNECTED STATE */}
        {callState === 'connected' && (
          <>
            {/* Remote video — simulated with doctor/patient avatar + gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="relative">
                <img
                  src={doctorAvatar}
                  alt={isDoctor ? patientName : doctorName}
                  className="w-40 h-40 rounded-full object-cover border-4 border-slate-600 opacity-80"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
              <div className="absolute bottom-32 left-0 right-0 text-center">
                <p className="text-slate-400 text-sm">{isDoctor ? patientName : doctorName} · Video Active</p>
              </div>
            </div>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{isDoctor ? patientName : doctorName}</p>
                  <p className="text-sky-300 text-xs">{isDoctor ? 'Patient' : doctorSpecialty}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-400">Connected · {formatDuration(callDuration)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${qualityColor[connectionQuality]}`}>
                    <Signal size={14} />
                    <span className="text-xs">{qualityLabel[connectionQuality]}</span>
                  </div>
                  <span className="bg-sky-500/30 text-sky-300 text-xs px-2 py-0.5 rounded-full border border-sky-500/40">HD</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Self video (picture-in-picture, bottom right) */}
        <div className="absolute bottom-24 right-4 z-10" style={{ width: 160, height: 120 }}>
          <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-700">
            {camOn && localStreamActive ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center gap-1">
                <VideoOff size={22} className="text-slate-400" />
                <span className="text-slate-500 text-xs">{camOn ? 'Starting...' : 'Camera Off'}</span>
              </div>
            )}
            <div className="absolute bottom-1 left-2 text-xs text-white/80">You</div>
          </div>
        </div>

        {/* Control bar */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
          <div className="flex items-center justify-center gap-4">
            {/* Mute */}
            <button
              onClick={toggleMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            {/* Camera */}
            <button
              onClick={toggleCam}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                camOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={camOn ? 'Stop Camera' : 'Start Camera'}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-2xl"
              title="End Call"
            >
              <Phone size={22} className="rotate-135" />
            </button>

            {/* Chat */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                chatOpen ? 'bg-sky-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
              title="Chat"
            >
              <MessageCircle size={20} />
            </button>

            {/* Participants */}
            <button
              className="w-12 h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
              title="Participants"
            >
              <Users size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col" style={{ minHeight: 480 }}>
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h4 className="text-white font-semibold text-sm">Consultation Chat</h4>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'}`}>
                <p className={`text-xs mb-1 ${msg.mine ? 'text-sky-400' : 'text-slate-400'}`}>{msg.sender}</p>
                <div className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] ${
                  msg.mine ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-slate-500 mt-0.5">{msg.time}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              placeholder="Type message..."
              className="flex-1 bg-slate-700 text-white text-sm rounded-xl px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              onClick={sendChatMessage}
              disabled={!chatInput.trim()}
              className="p-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
