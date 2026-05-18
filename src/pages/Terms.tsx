export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using MediWave\'s platform, mobile application, or any associated services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services. These Terms constitute a legally binding agreement between you and MediWave Health Technologies Pvt. Ltd.',
    },
    {
      title: '2. Description of Services',
      content: `MediWave provides a healthcare technology platform that includes:
• Online doctor consultations (telemedicine and in-person booking)
• Lab test booking and home sample collection
• Medicine ordering and delivery
• Electronic health record management
• Emergency ambulance booking services
• AI-powered health guidance (informational only)
• Insurance claim assistance`,
    },
    {
      title: '3. Medical Disclaimer',
      content: `IMPORTANT: MediWave is a technology platform that facilitates access to healthcare services. It is NOT a medical provider.

• MediWave does not provide medical advice, diagnosis, or treatment
• The AI Symptom Checker is for informational purposes only
• Always consult a qualified healthcare professional for medical decisions
• In case of medical emergencies, immediately call 112 or go to the nearest emergency room
• Information provided on the platform does not replace professional medical consultation`,
    },
    {
      title: '4. User Accounts',
      content: `To use certain features, you must create an account. You agree to:
• Provide accurate and complete information
• Keep your login credentials secure
• Immediately notify us of unauthorized account access
• Not share your account with others
• Be at least 18 years old (minors require parental consent)

MediWave reserves the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      title: '5. Telemedicine Terms',
      content: `For telemedicine consultations:
• Video consultations are provided by independent licensed doctors
• Ensure you have a stable internet connection
• Be in a private, quiet location during consultations
• Prescriptions are provided at the doctor's professional discretion
• Some conditions may require in-person examination
• Telemedicine is not suitable for all medical conditions`,
    },
    {
      title: '6. Payment Terms',
      content: `All payments are processed securely. You agree that:
• Consultation fees are non-refundable once the consultation has started
• Lab test bookings can be cancelled 2 hours before the scheduled time
• Medicine orders can be cancelled before dispatch
• Refunds are processed within 5-7 business days
• MediWave uses PCI-DSS compliant payment processors
• Insurance claims are facilitated but not guaranteed`,
    },
    {
      title: '7. Privacy & Data',
      content: 'Your privacy is governed by our Privacy Policy, which is incorporated into these Terms. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.',
    },
    {
      title: '8. Limitation of Liability',
      content: 'To the maximum extent permitted by law, MediWave shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability shall not exceed the amount you paid for the specific service in question. MediWave does not guarantee the availability of any particular doctor or service.',
    },
    {
      title: '9. Governing Law',
      content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka. Before legal action, parties agree to attempt resolution through mediation.',
    },
    {
      title: '10. Contact',
      content: 'For questions about these Terms: legal@mediwave.health\nMediWave Health Technologies Pvt. Ltd., 42 Innovation Park, Whitefield, Bangalore 560066, India',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-white font-sora mb-3">Terms of Service</h1>
          <p className="text-sky-200">Last updated: January 15, 2026 • Version 3.2</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10">
          <p className="text-amber-800 text-sm font-medium">⚠️ Important Notice</p>
          <p className="text-amber-700 text-sm mt-1">MediWave is a technology platform facilitating healthcare access. We are NOT a medical provider. Always consult qualified doctors for medical decisions. In emergencies, call 112 immediately.</p>
        </div>

        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.title} className="border-b border-slate-100 pb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-3">{section.title}</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
