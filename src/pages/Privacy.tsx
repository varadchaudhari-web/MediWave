export default function Privacy() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect information you provide directly, including name, email, phone number, date of birth, and health information necessary for providing our services. We also collect usage data, device information, and location data when you use our emergency services.

Types of information:
• Personal identification (name, email, phone, DOB)
• Health information (symptoms, medical history, prescriptions)
• Payment information (processed securely via PCI-DSS compliant processors)
• Device and usage information (IP address, browser type, app usage)
• Location data (for emergency services only, with consent)`,
    },
    {
      title: '2. How We Use Your Information',
      content: `Your information is used to:
• Provide and improve healthcare services
• Connect you with doctors, labs, and pharmacies
• Process appointments, lab bookings, and medicine orders
• Send appointment reminders and health notifications
• Process payments and insurance claims
• Ensure platform safety and prevent fraud
• Comply with legal and regulatory requirements`,
    },
    {
      title: '3. Health Information & HIPAA/DPDP Compliance',
      content: `MediWave handles your health information with the highest standards of privacy and security. We comply with:
• India's Digital Personal Data Protection (DPDP) Act 2023
• HIPAA standards for health information protection
• ISO 27001 security standards

Your health data is:
• Encrypted in transit and at rest using AES-256 encryption
• Accessible only to you and the healthcare providers you authorize
• Never sold to third parties for marketing purposes
• Retained only as long as necessary for healthcare purposes`,
    },
    {
      title: '4. Data Sharing',
      content: `We share your information only in these circumstances:
• With healthcare providers you choose to consult
• With labs and pharmacies for service delivery
• With payment processors for secure transactions
• With emergency services when there is imminent danger
• When required by law or court order

We do NOT:
• Sell your personal or health data
• Share data with advertisers
• Use health data for unrelated commercial purposes`,
    },
    {
      title: '5. Your Rights',
      content: `Under applicable laws, you have the right to:
• Access your personal data
• Correct inaccurate information
• Delete your account and data
• Export your health records
• Opt out of non-essential communications
• Withdraw consent for data processing

To exercise these rights, contact: privacy@mediwave.health`,
    },
    {
      title: '6. Cookies & Tracking',
      content: `We use cookies and similar technologies to:
• Keep you logged in securely
• Remember your preferences
• Analyze platform usage to improve services
• Provide relevant health content

You can control cookies through your browser settings. Disabling certain cookies may affect functionality.`,
    },
    {
      title: '7. Data Security',
      content: `We implement robust security measures:
• End-to-end encryption for all communications
• Two-factor authentication for accounts
• Regular security audits and penetration testing
• Secure data centers with physical and digital access controls
• Employee training on data privacy

While we take extensive precautions, no system is completely secure. We encourage strong, unique passwords.`,
    },
    {
      title: '8. Contact Us',
      content: `For privacy-related questions or to exercise your rights:

Data Protection Officer
MediWave Health Technologies Pvt. Ltd.
42 Innovation Park, Whitefield, Bangalore 560066

Email: privacy@mediwave.health
Phone: 1800-MED-WAVE

Grievance Officer: grievance@mediwave.health (as required by IT Act, 2000)`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-sky-700 to-sky-600 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-white font-sora mb-3">Privacy Policy</h1>
          <p className="text-sky-200">Last updated: January 15, 2026 • Effective: January 15, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 mb-10">
          <h2 className="font-bold text-sky-800 mb-2">Our Privacy Commitment</h2>
          <p className="text-sky-700 text-sm leading-relaxed">
            MediWave is committed to protecting your privacy and the security of your health information. This policy explains how we collect, use, and protect your personal and health data. We comply with India's DPDP Act 2023, HIPAA standards, and all applicable data protection regulations.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.title} className="border-b border-slate-100 pb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{section.title}</h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
