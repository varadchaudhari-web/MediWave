import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Activity } from 'lucide-react';
import { SymptomMessage } from '@/types';

const aiResponses: Record<string, { response: string; suggestions?: string[] }> = {
  default: {
    response: "I understand you're experiencing some health concerns. Can you tell me more about your main symptom? Is it pain, fever, cough, fatigue, or something else?",
    suggestions: ['Fever & Chills', 'Chest Pain', 'Headache', 'Cough & Cold', 'Stomach Pain', 'Fatigue', 'Skin Issue'],
  },
  fever: {
    response: "Fever can be caused by many conditions. How high is your temperature? Is it above 101°F (38.3°C)? Do you have any other symptoms like headache, body ache, chills, or rash?",
    suggestions: ['Above 103°F', '100-103°F', 'Below 100°F', 'With body ache', 'With rash', 'With chills'],
  },
  chest: {
    response: "⚠️ Chest pain can be serious. Is the pain sharp or pressure-like? Does it radiate to your arm, jaw, or back? Are you experiencing shortness of breath, sweating, or nausea? If severe, please call emergency services immediately.",
    suggestions: ['Sharp pain', 'Pressure/Tightness', 'With shortness of breath', 'Radiates to arm', 'Mild discomfort'],
  },
  headache: {
    response: "Headaches have many causes. Is it on one side or both? How severe is it on a scale of 1-10? Is it accompanied by vision changes, nausea, sensitivity to light, or neck stiffness?",
    suggestions: ['One side (migraine)', 'Both sides (tension)', 'Very severe (10/10)', 'With nausea', 'With light sensitivity'],
  },
  cough: {
    response: "Coughs can be dry or productive. How long have you had this cough? Is it producing mucus? What color is it? Do you have fever, shortness of breath, or chest pain with the cough?",
    suggestions: ['Dry cough', 'Productive cough', 'More than 2 weeks', 'With fever', 'With breathlessness'],
  },
  stomach: {
    response: "Stomach pain can vary significantly. Where exactly is the pain — upper, lower, left, right, or all over? Is it constant or comes in waves? Do you have nausea, vomiting, diarrhea, or constipation?",
    suggestions: ['Upper abdomen', 'Lower abdomen', 'With vomiting', 'With diarrhea', 'After eating'],
  },
  fatigue: {
    response: "Fatigue can stem from many causes — sleep issues, anemia, thyroid, diabetes, or infections. How long have you been feeling tired? Do you sleep well? Any other symptoms like weight change, increased thirst, or shortness of breath?",
    suggestions: ['Less than 1 week', 'More than 2 weeks', 'With weight loss', 'With increased thirst', 'Not sleeping well'],
  },
  skin: {
    response: "Skin issues vary widely. Can you describe the problem — is it a rash, itching, redness, swelling, or a growth? Where on the body is it? When did it start? Any known allergies or new products?",
    suggestions: ['Rash/Hives', 'Itching', 'Acne', 'Eczema/dry skin', 'Unusual growth', 'Hair loss'],
  },
};

function getAIResponse(message: string): { response: string; suggestions?: string[] } {
  const lower = message.toLowerCase();
  if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) return aiResponses.fever;
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('pressure')) return aiResponses.chest;
  if (lower.includes('head') || lower.includes('migraine')) return aiResponses.headache;
  if (lower.includes('cough') || lower.includes('cold') || lower.includes('throat')) return aiResponses.cough;
  if (lower.includes('stomach') || lower.includes('abdom') || lower.includes('nausea') || lower.includes('vomit')) return aiResponses.stomach;
  if (lower.includes('tired') || lower.includes('fatigue') || lower.includes('weak')) return aiResponses.fatigue;
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch') || lower.includes('acne')) return aiResponses.skin;
  
  if (lower.includes('doctor') || lower.includes('appointment')) {
    return {
      response: "Based on your symptoms, I recommend consulting a doctor. I can help you find the right specialist. Would you like me to suggest doctors for your condition?",
      suggestions: ['Find Doctor', 'Book Appointment', 'Emergency Help'],
    };
  }

  if (lower.includes('severe') || lower.includes('emergency') || lower.includes('can\'t breathe')) {
    return {
      response: "⚠️ This sounds like it may require urgent medical attention. Please call emergency services or go to the nearest emergency room immediately. You can also use our SOS ambulance feature.",
      suggestions: ['Call Emergency', 'Book Ambulance', 'Nearest Hospital'],
    };
  }

  return {
    response: "I see. Based on what you've described, let me help narrow this down. Could you also tell me: How long have you had these symptoms? Do you have any underlying conditions like diabetes, hypertension, or allergies?",
    suggestions: ['Less than 24 hours', '2-7 days', 'More than a week', 'Yes, have conditions', 'No conditions'],
  };
}

export default function SymptomChecker() {
  const [messages, setMessages] = useState<SymptomMessage[]>([
    {
      id: '0',
      role: 'ai',
      content: "Hello! I'm MediWave AI, your health assistant. I can help you understand your symptoms, find the right doctor, or guide you on when to seek urgent care. Please note: This is for informational purposes only and not a medical diagnosis.\n\nWhat symptoms are you experiencing today?",
      timestamp: new Date(),
      suggestions: ['Fever & Chills', 'Chest Pain', 'Headache', 'Cough & Cold', 'Stomach Pain', 'Fatigue'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: SymptomMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResp = getAIResponse(text);
      const aiMsg: SymptomMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResp.response,
        timestamp: new Date(),
        suggestions: aiResp.suggestions,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-sky-600 to-cyan-500 text-white">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="font-semibold">AI Symptom Checker</h3>
          <p className="text-xs text-sky-100">Powered by MediWave AI • Not a medical diagnosis</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
              msg.role === 'ai' ? 'bg-sky-100' : 'bg-slate-100'
            }`}>
              {msg.role === 'ai' ? <Bot size={16} className="text-sky-600" /> : <User size={16} className="text-slate-600" />}
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'ai'
                  ? 'bg-slate-50 text-slate-700 rounded-tl-none'
                  : 'bg-sky-600 text-white rounded-tr-none'
              }`}>
                {msg.content}
              </div>
              {msg.suggestions && msg.role === 'ai' && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-600 text-xs rounded-full hover:bg-sky-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-sky-600" />
            </div>
            <div className="bg-slate-50 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Describe your symptoms..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="p-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          For emergencies, call 112 or use our SOS ambulance feature
        </p>
      </div>
    </div>
  );
}
