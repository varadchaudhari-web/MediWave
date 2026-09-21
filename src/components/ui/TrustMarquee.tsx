import React from 'react';

const marqueeItems = [
  '100% VERIFIED SPECIALIST DOCTORS',
  '24/7 RAPID EMERGENCY SOS',
  'NABL ACCREDITED LAB PARTNERS',
  'ISO 27001 & DPDP ACT COMPLIANT',
  '5,000,000+ SATISFIED PATIENTS',
  '200+ CITIES PAN-INDIA PRESENCE',
  '5,000+ NETWORK CASHLESS HOSPITALS',
  'EXPRESS MEDICINE DELIVERY IN 24H',
];

export default function TrustMarquee() {
  const content = (
    <div className="flex items-center gap-8 shrink-0">
      {marqueeItems.map((item, i) => (
        <div key={i} className="flex items-center gap-4 text-slate-500 text-xs font-mono tracking-wider font-medium shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-slate-100/70 border-y border-slate-200/80 py-3.5 overflow-hidden select-none">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
        {content}
        {content}
      </div>
    </div>
  );
}
