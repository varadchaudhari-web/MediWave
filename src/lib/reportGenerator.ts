import jsPDF from 'jspdf';
import logoUrl from '@/assets/logo.png';
import { Appointment, MedicalRecord, Prescription } from '@/types';
import { InsuranceClaim, LabOrder } from '@/contexts/AppDataContext';

export type ReportType =
  | 'invoice'
  | 'discharge'
  | 'prescription'
  | 'lab'
  | 'insurance'
  | 'medical'
  | 'compliance'
  | 'revenue'
  | 'appointmentAnalytics';

type TableRow = (string | number)[];

interface BaseReportData {
  reportId?: string;
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  hospital?: string;
  date?: string;
  title?: string;
  amount?: number;
}

interface GenerateReportOptions extends BaseReportData {
  appointment?: Appointment;
  prescription?: Partial<Prescription> & { medicines?: { name: string; dosage: string; duration: string; instructions: string }[] };
  labOrder?: LabOrder;
  claim?: InsuranceClaim;
  record?: MedicalRecord;
  rows?: TableRow[];
  notes?: string;
}

const hospital = {
  name: 'MediWave Health Network',
  address: 'MediWave Tower, MG Road, Bengaluru 560001',
  phone: '1800-MED-WAVE',
  email: 'care@mediwave.health',
  gstin: '29AAECM4821F1Z8',
};

const money = (value = 0) => `Rs. ${value.toLocaleString('en-IN')}`;
const today = () => new Date().toISOString().split('T')[0];

function addLogo(doc: jsPDF): void {
  try {
    doc.addImage(logoUrl, 'PNG', 14, 12, 15, 15);
  } catch {
    doc.setFillColor(2, 132, 199);
    doc.roundedRect(14, 12, 15, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('M', 19, 22);
  }
}

function header(doc: jsPDF, title: string, reportId: string): void {
  addLogo(doc);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(hospital.name, 33, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(hospital.address, 33, 22);
  doc.text(`${hospital.phone} | ${hospital.email} | GSTIN ${hospital.gstin}`, 33, 26);

  doc.setFillColor(2, 132, 199);
  doc.roundedRect(14, 34, 182, 14, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title.toUpperCase(), 18, 43);
  doc.setFontSize(8);
  doc.text(`Document ID: ${reportId}`, 146, 40);
  doc.text(`Issued: ${today()}`, 146, 44);
}

function footer(doc: jsPDF): void {
  const y = 282;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y - 5, 196, y - 5);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated MediWave demo document for healthcare SaaS workflow validation.', 14, y);
  doc.text('Authorized signatory and QR verification placeholder included for document authenticity simulation.', 14, y + 4);
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(14, y, 182, 8, 1.5, 1.5, 'F');
  doc.setTextColor(3, 105, 161);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(text, 17, y + 5.5);
  return y + 12;
}

function kvGrid(doc: jsPDF, items: { label: string; value: string }[], y: number): number {
  doc.setFontSize(8.5);
  items.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = col === 0 ? 16 : 106;
    const yy = y + row * 9;
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x, yy);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(String(item.value || '-').slice(0, 38), x + 34, yy);
  });
  return y + Math.ceil(items.length / 2) * 9 + 2;
}

function table(doc: jsPDF, headers: string[], rows: TableRow[], y: number, widths?: number[]): number {
  const w = widths || headers.map(() => 182 / headers.length);
  let x = 14;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5.2);
    x += w[i];
  });
  y += 8;
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, rowIndex) => {
    x = 14;
    doc.setFillColor(rowIndex % 2 === 0 ? 248 : 255, 250, 252);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(51, 65, 85);
    row.forEach((cell, i) => {
      doc.text(String(cell).slice(0, 34), x + 2, y + 5.2);
      x += w[i];
    });
    y += 8;
  });
  return y + 4;
}

function signatureBlock(doc: jsPDF, y: number): void {
  doc.setDrawColor(148, 163, 184);
  doc.rect(16, y, 28, 28);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('QR VERIFY', 22, y + 15);
  doc.line(122, y + 20, 190, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signature', 145, y + 25);
}

function invoice(doc: jsPDF, data: GenerateReportOptions): void {
  const appt = data.appointment;
  header(doc, 'Medical Bill / Invoice', data.reportId || `INV-${Date.now().toString().slice(-6)}`);
  let y = sectionTitle(doc, 'Patient & Visit Details', 56);
  y = kvGrid(doc, [
    { label: 'Patient', value: data.patientName || appt?.patientName || 'John Smith' },
    { label: 'Patient ID', value: data.patientId || appt?.patientId || 'p1' },
    { label: 'Doctor', value: data.doctorName || appt?.doctorName || 'Dr. Sarah Mitchell' },
    { label: 'Specialty', value: appt?.doctorSpecialty || 'Cardiology' },
    { label: 'Visit Date', value: appt?.date || data.date || today() },
    { label: 'Payment', value: appt?.paymentStatus || 'paid' },
  ], y);
  y = sectionTitle(doc, 'Billing Breakdown', y + 4);
  const fee = data.amount || appt?.fee || 800;
  y = table(doc, ['Code', 'Description', 'Qty', 'Amount'], [
    ['CONS-OPD', appt?.type === 'telemedicine' ? 'Video consultation' : 'In-person consultation', 1, money(fee)],
    ['PLATFORM', 'MediWave platform service charge', 1, money(0)],
    ['TAX', 'Healthcare GST exempt service', 1, money(0)],
  ], y, [28, 94, 20, 40]);
  y = sectionTitle(doc, 'Payment Summary', y);
  y = kvGrid(doc, [
    { label: 'Subtotal', value: money(fee) },
    { label: 'Discount', value: money(0) },
    { label: 'Net Payable', value: money(fee) },
    { label: 'Mode', value: 'UPI / Card / Wallet' },
  ], y);
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Terms: Payment received against healthcare services. Refunds follow MediWave cancellation policy.', 16, y + 8);
  signatureBlock(doc, 230);
}

function prescription(doc: jsPDF, data: GenerateReportOptions): void {
  const rx = data.prescription;
  header(doc, 'Doctor Prescription', rx?.id || data.reportId || `RX-${Date.now().toString().slice(-6)}`);
  let y = sectionTitle(doc, 'Clinical Details', 56);
  y = kvGrid(doc, [
    { label: 'Patient', value: rx?.patientName || data.patientName || 'John Smith' },
    { label: 'Doctor', value: rx?.doctorName || data.doctorName || 'Dr. Sarah Mitchell' },
    { label: 'Date', value: rx?.date || data.date || today() },
    { label: 'Diagnosis', value: rx?.diagnosis || 'Acute upper respiratory infection' },
  ], y);
  y = sectionTitle(doc, 'Medication Order', y + 4);
  y = table(doc, ['Medicine', 'Dosage', 'Duration', 'Instructions'], (rx?.medicines || [
    { name: 'Paracetamol 650mg', dosage: '1 tablet twice daily', duration: '3 days', instructions: 'After meals' },
    { name: 'Cetirizine 10mg', dosage: '1 tablet at night', duration: '5 days', instructions: 'May cause drowsiness' },
  ]).map(m => [m.name, m.dosage, m.duration, m.instructions]), y, [48, 40, 34, 60]);
  y = sectionTitle(doc, 'Doctor Notes', y);
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(doc.splitTextToSize(rx?.notes || data.notes || 'Hydration, rest, and follow-up if symptoms persist beyond 72 hours.', 176), 16, y);
  signatureBlock(doc, 230);
}

function lab(doc: jsPDF, data: GenerateReportOptions): void {
  const order = data.labOrder;
  header(doc, 'Diagnostic Lab Test Report', order?.id || data.reportId || `LAB-${Date.now().toString().slice(-6)}`);
  let y = sectionTitle(doc, 'Specimen & Patient Details', 56);
  y = kvGrid(doc, [
    { label: 'Patient', value: order?.patient || data.patientName || 'John Smith' },
    { label: 'Patient ID', value: order?.patientId || data.patientId || 'p1' },
    { label: 'Test', value: order?.test || 'Complete Blood Count' },
    { label: 'Sample', value: 'Blood / Serum' },
    { label: 'Collected', value: `${order?.date || today()} ${order?.time || '09:00 AM'}` },
    { label: 'Report Status', value: order?.status || 'completed' },
  ], y);
  y = sectionTitle(doc, 'Observed Values', y + 4);
  y = table(doc, ['Parameter', 'Result', 'Unit', 'Reference Range', 'Flag'], data.rows || [
    ['Hemoglobin', '14.1', 'g/dL', '13.0 - 17.0', 'Normal'],
    ['WBC Count', '6,800', '/cumm', '4,000 - 11,000', 'Normal'],
    ['Platelets', '2.45', 'Lakh/cumm', '1.5 - 4.5', 'Normal'],
    ['Fasting Glucose', '96', 'mg/dL', '70 - 100', 'Normal'],
  ], y, [48, 28, 28, 48, 30]);
  y = sectionTitle(doc, 'Lab Interpretation', y);
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(doc.splitTextToSize(order?.reportNotes || 'Values are within clinically acceptable reference intervals. Correlate with symptoms and physician advice.', 176), 16, y);
  signatureBlock(doc, 230);
}

function insurance(doc: jsPDF, data: GenerateReportOptions): void {
  const claim = data.claim;
  header(doc, 'Insurance Claim Form', claim?.claimNumber || data.reportId || `MWIC-${Date.now().toString().slice(-6)}`);
  let y = sectionTitle(doc, 'Claimant & Policy Details', 56);
  y = kvGrid(doc, [
    { label: 'Patient', value: claim?.patientName || data.patientName || 'John Smith' },
    { label: 'Policy', value: claim?.policy || 'MediWave Plus' },
    { label: 'Insurer', value: claim?.insurer || 'ICICI Lombard' },
    { label: 'Hospital', value: claim?.hospital || 'Apollo Hospitals' },
    { label: 'Treatment', value: claim?.treatment || 'OPD consultation and diagnostics' },
    { label: 'Claim Amount', value: money(claim?.amount || data.amount || 12400) },
  ], y);
  y = sectionTitle(doc, 'Submitted Documents', y + 4);
  y = table(doc, ['Document', 'Status', 'Verification'], (claim?.documents || ['Hospital bill', 'Prescription', 'Lab report']).map(d => [d, 'Uploaded', 'Pending insurer validation']), y, [74, 42, 66]);
  y = sectionTitle(doc, 'Claim Tracking', y);
  y = table(doc, ['Stage', 'Owner', 'Status', 'Date'], [
    ['Submission', 'Patient', 'Completed', claim?.date || today()],
    ['Document Check', 'MediWave', claim?.status || 'Submitted', today()],
    ['Medical Review', 'Insurer', 'In queue', 'T+2 days'],
  ], y, [48, 42, 48, 44]);
  signatureBlock(doc, 230);
}

function narrativeReport(doc: jsPDF, type: ReportType, data: GenerateReportOptions): void {
  const titles: Record<ReportType, string> = {
    invoice: 'Medical Bill / Invoice',
    discharge: 'Hospital Discharge Summary',
    prescription: 'Doctor Prescription',
    lab: 'Diagnostic Lab Test Report',
    insurance: 'Insurance Claim Form',
    medical: 'Patient Medical Report',
    compliance: 'Admin Compliance Report',
    revenue: 'Revenue Report',
    appointmentAnalytics: 'Appointment Analytics Report',
  };
  header(doc, titles[type], data.reportId || `${type.toUpperCase()}-${Date.now().toString().slice(-6)}`);
  let y = sectionTitle(doc, 'Report Metadata', 56);
  y = kvGrid(doc, [
    { label: 'Prepared For', value: data.patientName || hospital.name },
    { label: 'Prepared By', value: data.doctorName || 'MediWave Administration' },
    { label: 'Facility', value: data.hospital || hospital.name },
    { label: 'Date', value: data.date || today() },
  ], y);
  y = sectionTitle(doc, 'Structured Summary', y + 4);
  y = table(doc, ['Metric / Field', 'Details', 'Status'], data.rows || [
    ['Primary diagnosis', 'Stable clinical condition under regular follow-up', 'Reviewed'],
    ['Care plan', 'Medication adherence, follow-up consultation, routine labs', 'Active'],
    ['Risk notes', 'No critical alerts in current record', 'Normal'],
  ], y, [56, 86, 40]);
  y = sectionTitle(doc, 'Clinical / Administrative Notes', y);
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(doc.splitTextToSize(data.notes || 'Generated from MediWave mock healthcare workflow data with professional document formatting.', 176), 16, y);
  signatureBlock(doc, 230);
}

export function generateReport(type: ReportType, data: GenerateReportOptions = {}): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  switch (type) {
    case 'invoice':
      invoice(doc, data);
      break;
    case 'prescription':
      prescription(doc, data);
      break;
    case 'lab':
      lab(doc, data);
      break;
    case 'insurance':
      insurance(doc, data);
      break;
    default:
      narrativeReport(doc, type, data);
  }
  footer(doc);
  doc.save(`${type}-${(data.reportId || Date.now()).toString().replace(/\s+/g, '-')}.pdf`);
}
