import { useState } from 'react';
import { ChevronDown, Search, BookOpen, Calendar, CreditCard, FileText, ArrowRight, Phone, Mail, MessageCircle, UserPlus, Stethoscope, Video, RefreshCw, Download, Upload, Shield, HelpCircle } from 'lucide-react';
import { faqData } from '@/data/mockData';
import Modal from '@/components/features/Modal';

type HelpArticle = {
  title: string;
  content: string;
};

const helpArticles: Record<string, HelpArticle> = {
  'creating-account': {
    title: 'Creating Your MediWave Account',
    content: `Follow these simple steps to create your free MediWave account:

1. Click "Sign Up" in the top navigation bar
2. Select your role: Patient, Doctor, or Partner
3. Enter your full name, email address, and phone number
4. Create a secure password (minimum 8 characters)
5. Verify your email address via the OTP sent to your inbox
6. Complete your profile — add your photo, date of birth, blood group, and address

After registration, you can immediately:
• Book doctor appointments
• Access the AI symptom checker
• Browse lab tests and medicines
• Set up emergency contacts

Your data is encrypted and protected under India's DPDP Act and HIPAA standards.`,
  },
  'finding-doctors': {
    title: 'How to Find the Right Doctor',
    content: `MediWave makes it easy to find the perfect doctor for your needs:

Search Options:
• Search by name, specialty, condition, or location
• Browse specializations from the home page
• Use filters: availability, consultation fee, rating, language

Doctor Profiles Show:
• Qualifications, experience, and hospital affiliation
• Patient ratings and verified reviews
• Available consultation slots
• Telemedicine availability
• Consultation fee

Tips for Choosing:
• Check the doctor's specialization matches your condition
• Look for doctors with high ratings (4.5+ recommended)
• Verify if they offer telemedicine if you prefer home consultations
• Check language preferences for better communication

Once you find your doctor, click "Book Now" or "Video" to start.`,
  },
  'booking-appointment': {
    title: 'Booking Your First Appointment',
    content: `Booking a consultation on MediWave takes under 2 minutes:

Step 1: Choose Your Doctor
• Browse doctors by specialty or search by name
• Click on a doctor card to view full profile

Step 2: Select Consultation Type
• Video Consultation: From home via HD video call
• In-Person: Visit the doctor's clinic/hospital

Step 3: Pick Date & Time
• Choose from available slots shown in the calendar
• Slots update in real-time

Step 4: Add Symptoms (Optional)
• Describe your symptoms or reason for visit
• Upload previous reports if relevant

Step 5: Payment
• Pay via UPI, Credit/Debit Card, Insurance, or MediWave Wallet
• You receive a confirmation immediately with appointment ID

Confirmation Details:
• SMS and email confirmation sent immediately
• Reminder sent 1 hour before the appointment
• For telemedicine, a video link is shared 15 mins before`,
  },
  'how-to-book': {
    title: 'How to Book Appointments',
    content: `Appointments on MediWave can be booked in 3 ways:

1. From the Doctors Page:
   • Go to /doctors, search or filter, click "Book Now"
   
2. From the Home Page:
   • Click any doctor card in "Featured Doctors" section
   
3. From Your Dashboard:
   • Go to Patient Dashboard → click "+ Book Appointment"

Appointment Types:
• Telemedicine (Video Call): From home, available 24/7 for many doctors
• In-Person: At the doctor's hospital/clinic

Slots available: Today, Tomorrow, and up to 7 days in advance

Each slot shows real availability. If your preferred slot is full, you can:
• Choose a different slot
• Join the waitlist
• Book with a similar doctor`,
  },
  'reschedule-cancel': {
    title: 'Reschedule & Cancel Appointments',
    content: `Rescheduling:
• Go to My Appointments page
• Find your scheduled appointment
• Click "Reschedule" button
• A new booking modal opens — choose a new date and slot
• No extra charges for first reschedule (min 2 hours before)

Cancellation Policy:
• Cancel more than 2 hours before: Full refund
• Cancel less than 2 hours before: 50% refund
• No-show: No refund

How to Cancel:
1. Go to My Appointments
2. Find your appointment and click "Cancel"
3. Confirm cancellation
4. Refund is processed within 3-5 business days to original payment method

Note: Prescription medicines ordered during consultation are non-refundable once dispensed.`,
  },
  'join-video-calls': {
    title: 'How to Join Video Consultations',
    content: `Before Your Video Call:
• Ensure stable internet connection (minimum 2 Mbps)
• Use a device with working camera and microphone
• Allow browser permissions for camera and mic
• Find a quiet, well-lit private space

Joining the Call:
1. Go to My Appointments
2. Find your scheduled telemedicine appointment
3. Click "Start Call" — available 15 mins before scheduled time
4. Allow camera/mic permissions when prompted
5. Wait in virtual waiting room if doctor is with another patient

During the Call:
• Mute/unmute mic using the mic button
• Turn camera on/off as needed
• Use the chat panel to share text or links
• Screen share your reports if needed
• End call using the red phone button

After the Call:
• Prescription is sent to your MediWave account
• Medicines can be ordered directly from the prescription
• Follow-up can be booked from the appointment page`,
  },
  'payment-methods': {
    title: 'Payment Methods Accepted',
    content: `MediWave accepts all major payment methods:

UPI Payments:
• Google Pay, PhonePe, Paytm, BHIM UPI
• Any UPI app using VPA or QR code

Cards:
• Visa, Mastercard, Rupay (Credit & Debit)
• American Express
• Net Banking from 50+ banks

MediWave Wallet:
• Preload with any amount
• Use for instant payments
• Earn 2% cashback on wallet payments

Health Insurance (Cashless):
• Star Health, ICICI Lombard, HDFC Ergo, and 40+ more
• Verify eligibility before booking
• Cashless settlement for network hospitals

EMI Options:
• Available for bills above Rs. 2,000
• 3, 6, 9, 12 month options
• Zero cost EMI on select bank cards

All payments are secured by 256-bit SSL encryption and PCI-DSS compliance.`,
  },
  'refund-policy': {
    title: 'Refund Policy',
    content: `Consultation Refunds:
• Cancelled 2+ hours before: 100% refund within 3-5 days
• Cancelled less than 2 hours before: 50% refund
• Doctor unavailable/no-show: 100% refund + Rs. 100 credit
• Technical issues preventing call: 100% refund

Lab Test Refunds:
• Cancelled before sample collection: 100% refund
• After sample collection: No refund possible
• Report not delivered in time: 50% refund

Medicine Refunds:
• Cancelled before dispatch: Full refund
• Damaged product: Full replacement or refund
• Wrong product delivered: Full refund + replacement

How to Request Refund:
1. Go to Billing & Payments in your dashboard
2. Find the transaction
3. Click "Request Refund"
4. Provide reason and submit
5. Refund processed within 3-7 business days

Contact support@mediwave.health for urgent refund issues.`,
  },
  'insurance-claims': {
    title: 'Submitting Insurance Claims',
    content: `MediWave supports cashless and reimbursement claims:

Cashless Claims (Network Hospitals):
1. Verify your insurance at the hospital reception
2. Show insurance card and photo ID
3. Hospital submits pre-authorization to insurer
4. Treatment proceeds — no payment needed upfront

Reimbursement Claims:
1. Pay at the hospital/clinic
2. Collect all original bills and discharge summary
3. Go to MediWave app → Billing → Insurance Claim
4. Upload documents (bills, prescription, discharge summary, lab reports)
5. Submit claim — we forward to your insurer
6. Reimbursement in 14-21 business days

Supported Insurers (40+ plans):
Star Health, ICICI Lombard, HDFC Ergo, Bajaj Allianz, New India Assurance, United India, Oriental Insurance, Max Bupa, Religare, and more.

Tips for Faster Claims:
• Keep all original documents safe
• Submit within 30 days of discharge
• Ensure prescription has doctor's registration number`,
  },
  'accessing-records': {
    title: 'Accessing Your Health Records',
    content: `Your health records are securely stored and always accessible:

Where to Find Records:
• Go to Health Records from top navigation
• Or access from Patient Dashboard → Health Records
• Or use the shortcut in Navbar profile dropdown

What's Stored:
• Doctor Prescriptions
• Lab test reports
• Vaccination certificates
• Discharge summaries
• Insurance documents
• Medical images (X-ray, MRI, etc.)

Privacy & Security:
• Only you can view your records by default
• Share selectively with doctors during consultations
• Records are encrypted at rest and in transit
• Access log tracks who viewed your records

Record Organization:
• Filter by type: Prescription, Report, Vaccination, Discharge
• Search by doctor name, hospital, or condition
• Sort by date — newest or oldest first

You can download any record as PDF for offline use.`,
  },
  'upload-documents': {
    title: 'Uploading Health Documents',
    content: `You can upload your existing medical documents to keep them in one place:

How to Upload:
1. Go to Health Records
2. Click "Upload Record" (top right button)
3. Select document type (prescription, report, etc.)
4. Drag & drop or browse to select file
5. Add title, date, doctor name, and hospital
6. Click Save — document is securely stored

Supported Formats:
• PDF (recommended)
• JPG/PNG images
• Maximum file size: 25MB per document

During Doctor Consultations:
• Share records directly in the booking form
• Doctor can view during video consultation
• Attach prescription PDFs for medicine orders

Organization Tips:
• Add descriptive titles (e.g., "Thyroid Report - Jan 2026")
• Tag with relevant keywords (Diabetes, Cardiology, etc.)
• Keep reports from the same specialist grouped together`,
  },
  'download-pdfs': {
    title: 'Downloading Records as PDF',
    content: `All your health documents can be downloaded as professional PDFs:

How to Download:
1. Go to Health Records
2. Click on any record to view details
3. Click "Download PDF" button in the detail modal
4. PDF opens in new tab or downloads automatically

What PDFs Include:
• Professional MediWave header and logo
• Patient name and ID
• Doctor details and registration number
• Date and hospital information
• All relevant medical data
• QR code for verification

PDF Types Available:
• Prescription PDF: With medicines, dosage, diagnosis
• Lab Report PDF: With parameters, values, reference ranges
• Discharge Summary: Full hospital summary
• Insurance Document: Formatted for claim submission
• Vaccination Certificate: For travel or school requirements

The PDFs maintain the exact styling and branding for professional use.`,
  },
};

const categories = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    color: 'bg-sky-50 text-sky-600',
    items: [
      { id: 'creating-account', label: 'Creating an account' },
      { id: 'finding-doctors', label: 'Finding doctors' },
      { id: 'booking-appointment', label: 'Booking first appointment' },
    ],
  },
  {
    title: 'Appointments',
    icon: Calendar,
    color: 'bg-emerald-50 text-emerald-600',
    items: [
      { id: 'how-to-book', label: 'How to book' },
      { id: 'reschedule-cancel', label: 'Reschedule & cancel' },
      { id: 'join-video-calls', label: 'Join video calls' },
    ],
  },
  {
    title: 'Payments & Billing',
    icon: CreditCard,
    color: 'bg-amber-50 text-amber-600',
    items: [
      { id: 'payment-methods', label: 'Payment methods' },
      { id: 'refund-policy', label: 'Refund policy' },
      { id: 'insurance-claims', label: 'Insurance claims' },
    ],
  },
  {
    title: 'Medical Records',
    icon: FileText,
    color: 'bg-purple-50 text-purple-600',
    items: [
      { id: 'accessing-records', label: 'Accessing records' },
      { id: 'upload-documents', label: 'Upload documents' },
      { id: 'download-pdfs', label: 'Download PDFs' },
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [articleModal, setArticleModal] = useState<HelpArticle | null>(null);

  const filtered = faqData.filter(f =>
    !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const openArticle = (id: string) => {
    const article = helpArticles[id];
    if (article) setArticleModal(article);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <HelpCircle size={40} className="text-sky-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white font-sora mb-4">Help Center</h1>
          <p className="text-sky-200 mb-8">Find answers to common questions about MediWave</p>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 shadow-lg max-w-xl mx-auto">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for help articles..."
              className="flex-1 text-sm focus:outline-none placeholder-slate-400"
            />
            {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Quick help categories */}
        {!search && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {categories.map(cat => (
              <div key={cat.title} className="medical-card p-5 hover:border-sky-200">
                <div className={`w-10 h-10 ${cat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <cat.icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-3">{cat.title}</h3>
                <ul className="space-y-2">
                  {cat.items.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => openArticle(item.id)}
                        className="text-xs text-sky-600 hover:underline hover:text-sky-700 text-left flex items-center gap-1 group"
                      >
                        <ArrowRight size={10} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Popular Topics */}
        {!search && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Popular Help Topics</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { icon: UserPlus, label: 'Create Account', id: 'creating-account', color: 'bg-sky-50 text-sky-600' },
                { icon: Stethoscope, label: 'Find a Doctor', id: 'finding-doctors', color: 'bg-emerald-50 text-emerald-600' },
                { icon: Video, label: 'Join Video Call', id: 'join-video-calls', color: 'bg-purple-50 text-purple-600' },
                { icon: RefreshCw, label: 'Reschedule', id: 'reschedule-cancel', color: 'bg-amber-50 text-amber-600' },
                { icon: Download, label: 'Download Records', id: 'download-pdfs', color: 'bg-rose-50 text-rose-600' },
                { icon: Shield, label: 'Insurance Claims', id: 'insurance-claims', color: 'bg-indigo-50 text-indigo-600' },
              ].map(topic => (
                <button
                  key={topic.id}
                  onClick={() => openArticle(topic.id)}
                  className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-all group text-left"
                >
                  <div className={`w-9 h-9 ${topic.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <topic.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-sky-600">{topic.label}</span>
                  <ArrowRight size={14} className="text-slate-400 ml-auto group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {search ? `Search results for "${search}"` : 'Frequently Asked Questions'}
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Search size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No results found. Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, idx) => (
                <div key={idx} className="medical-card overflow-hidden">
                  <button
                    onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                    <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${openIdx === idx ? 'rotate-180 text-sky-500' : ''}`} />
                  </button>
                  {openIdx === idx && (
                    <div className="px-5 pb-5">
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still need help */}
        <div className="mt-12 bg-sky-50 border border-sky-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-sky-800 mb-2">Still need help?</h3>
          <p className="text-sky-600 mb-6">Our support team is available 24/7 for medical emergencies and during business hours for general queries.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/contact" className="flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700 transition-colors">
              <Mail size={16} />
              Contact Support
            </a>
            <a href="tel:18001234567" className="flex items-center justify-center gap-2 px-6 py-3 border border-sky-300 text-sky-700 rounded-xl font-semibold text-sm hover:bg-sky-100 transition-colors">
              <Phone size={16} />
              Call 1800-MED-WAVE
            </a>
          </div>
        </div>
      </div>

      {/* Article Modal */}
      <Modal isOpen={!!articleModal} onClose={() => setArticleModal(null)} title={articleModal?.title} size="md">
        <div className="p-6">
          <div className="prose prose-slate prose-sm max-w-none">
            {articleModal?.content.split('\n').map((line, i) => {
              if (!line.trim()) return <div key={i} className="h-2" />;
              if (line.startsWith('•')) return (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="text-sky-500 mt-0.5 shrink-0">•</span>
                  <span className="text-slate-600 text-sm">{line.slice(1).trim()}</span>
                </div>
              );
              const numMatch = line.match(/^(\d+)\.\s(.+)/);
              if (numMatch) return (
                <div key={i} className="flex items-start gap-2.5 mb-2">
                  <span className="w-5 h-5 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{numMatch[1]}</span>
                  <span className="text-slate-700 text-sm">{numMatch[2]}</span>
                </div>
              );
              if (line.endsWith(':') || (line.length < 60 && !line.startsWith(' '))) return (
                <h4 key={i} className="font-semibold text-slate-800 text-sm mt-4 mb-1.5">{line}</h4>
              );
              return <p key={i} className="text-slate-600 text-sm leading-relaxed mb-1">{line}</p>;
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => setArticleModal(null)}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Close
            </button>
            <a
              href="/contact"
              className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 text-center"
            >
              Contact Support
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Missing import
function X({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
