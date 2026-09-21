/**
 * AppDataContext — global shared state for CRUD sync across all roles.
 * Doctors, patients, appointments, prescriptions, lab orders, pharmacy orders
 * are all stored here so changes made in one dashboard are immediately visible
 * in every other dashboard / public page.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { doctors as initialDoctors } from '@/data/doctors';
import { mockAppointments, medicalRecords as initialRecords } from '@/data/mockData';
import { Doctor, Appointment, MedicalRecord } from '@/types';
import { toast } from 'sonner';
import { sanitizeAddress, sanitizeEmail, sanitizeMobile, sanitizeName, sanitizeText } from '@/lib/validation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PharmacyOrder {
  id: string;
  patient: string;
  patientId: string;
  medicines: string;
  total: number;
  status: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  date: string;
  prescription: boolean;
}

export interface LabOrder {
  id: string;
  patient: string;
  patientId: string;
  test: string;
  date: string;
  time: string;
  status: 'booked' | 'sample-collected' | 'processing' | 'completed';
  homeCollection: boolean;
  amount: number;
  reportReady: boolean;
  reportNotes?: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  policy: string;
  insurer: string;
  hospital: string;
  treatment: string;
  amount: number;
  date: string;
  documents: string[];
  status: 'submitted' | 'under-review' | 'approved' | 'rejected';
  remarks: string;
  claimNumber: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  status: 'Active' | 'Stable' | 'Critical' | 'Inactive';
  lastVisit: string;
  condition: string;
  bloodGroup?: string;
  address?: string;
}

// ─── Initial mock data ────────────────────────────────────────────────────────

const initialPharmacyOrders: PharmacyOrder[] = [
  { id: 'ORD001', patient: 'John Smith', patientId: 'p1', medicines: 'Metformin 500mg × 2, Vitamin D3 × 1', total: 162, status: 'delivered', date: '2026-05-18', prescription: true },
  { id: 'ORD002', patient: 'Sunita Patel', patientId: 'p2', medicines: 'Atorvastatin 10mg × 1, Ecosprin 75mg × 1', total: 86, status: 'dispatched', date: '2026-05-17', prescription: true },
  { id: 'ORD003', patient: 'Ravi Kumar', patientId: 'p3', medicines: 'Allegra 120mg × 2, Combiflam × 1', total: 268, status: 'processing', date: '2026-05-17', prescription: false },
  { id: 'ORD004', patient: 'Anita Singh', patientId: 'p4', medicines: 'Revital H × 1, Crocin 500mg × 3', total: 306, status: 'pending', date: '2026-05-17', prescription: false },
  { id: 'ORD005', patient: 'Deepak Nambiar', patientId: 'p5', medicines: 'Pantoprazole 40mg × 2, Azithromycin × 1', total: 205, status: 'delivered', date: '2026-05-16', prescription: true },
];

const initialLabOrders: LabOrder[] = [
  { id: 'LB001', patient: 'John Smith', patientId: 'p1', test: 'Complete Blood Count', date: '2026-05-18', time: '09:00 AM', status: 'completed', homeCollection: true, amount: 299, reportReady: true },
  { id: 'LB002', patient: 'Sunita Patel', patientId: 'p2', test: 'Thyroid Profile (T3, T4, TSH)', date: '2026-05-18', time: '10:30 AM', status: 'processing', homeCollection: false, amount: 650, reportReady: false },
  { id: 'LB003', patient: 'Ravi Kumar', patientId: 'p3', test: 'Lipid Profile', date: '2026-05-17', time: '08:00 AM', status: 'sample-collected', homeCollection: true, amount: 450, reportReady: false },
  { id: 'LB004', patient: 'Anita Singh', patientId: 'p4', test: 'HbA1c + Fasting Glucose', date: '2026-05-17', time: '07:30 AM', status: 'booked', homeCollection: true, amount: 520, reportReady: false },
  { id: 'LB005', patient: 'Deepak Nambiar', patientId: 'p5', test: 'Liver Function Test (LFT)', date: '2026-05-16', time: '09:00 AM', status: 'completed', homeCollection: false, amount: 580, reportReady: true },
  { id: 'LB006', patient: 'Priya Mehta', patientId: 'p6', test: 'Vitamin D3 + B12', date: '2026-05-16', time: '10:00 AM', status: 'completed', homeCollection: true, amount: 720, reportReady: true },
];

const initialPatients: Patient[] = [
  { id: 'p1', name: 'John Smith', age: 38, email: 'john@example.com', phone: '+91 98765 43210', status: 'Active', lastVisit: '2026-05-18', condition: 'Diabetes', bloodGroup: 'O+', address: '42 Green Park, New Delhi' },
  { id: 'p2', name: 'Sunita Patel', age: 45, email: 'sunita@example.com', phone: '+91 87654 32109', status: 'Active', lastVisit: '2026-05-15', condition: 'Thyroid', bloodGroup: 'A+', address: 'Bandra West, Mumbai' },
  { id: 'p3', name: 'Ravi Kumar', age: 52, email: 'ravi@example.com', phone: '+91 76543 21098', status: 'Critical', lastVisit: '2026-05-10', condition: 'Cardiac', bloodGroup: 'B-', address: 'Andheri East, Mumbai' },
  { id: 'p4', name: 'Anita Singh', age: 29, email: 'anita@example.com', phone: '+91 65432 10987', status: 'Stable', lastVisit: '2026-05-08', condition: 'PCOS', bloodGroup: 'AB+', address: 'Koregaon Park, Pune' },
  { id: 'p5', name: 'Deepak Nambiar', age: 61, email: 'deepak@example.com', phone: '+91 54321 09876', status: 'Active', lastVisit: '2026-05-05', condition: 'Post-Op', bloodGroup: 'O-', address: 'Indiranagar, Bangalore' },
  { id: 'p6', name: 'Priya Mehta', age: 34, email: 'priya@example.com', phone: '+91 43210 98765', status: 'Stable', lastVisit: '2026-05-12', condition: 'Anxiety', bloodGroup: 'A-', address: 'Salt Lake, Kolkata' },
];

const initialInsuranceClaims: InsuranceClaim[] = [
  {
    id: 'CLM001',
    patientId: 'p1',
    patientName: 'John Smith',
    policy: 'MediWave Plus',
    insurer: 'ICICI Lombard',
    hospital: 'Fortis Hospital',
    treatment: 'Appendicitis Surgery',
    amount: 148000,
    date: '2024-11-25',
    documents: ['Final bill', 'Discharge summary', 'Investigation reports'],
    status: 'approved',
    remarks: 'Settled to hospital account',
    claimNumber: 'MWIC-2024-11025',
  },
  {
    id: 'CLM002',
    patientId: 'p1',
    patientName: 'John Smith',
    policy: 'MediWave Plus',
    insurer: 'ICICI Lombard',
    hospital: 'Apollo Hospitals',
    treatment: 'Cardiology Consultation + Tests',
    amount: 12400,
    date: '2026-05-16',
    documents: ['Doctor prescription', 'Lab report', 'Payment receipt'],
    status: 'approved',
    remarks: 'Approved under OPD benefit',
    claimNumber: 'MWIC-2026-05162',
  },
  {
    id: 'CLM003',
    patientId: 'p1',
    patientName: 'John Smith',
    policy: 'MediWave Plus',
    insurer: 'ICICI Lombard',
    hospital: 'MediWave Diagnostics',
    treatment: 'Lab Tests - Comprehensive Panel',
    amount: 3200,
    date: '2026-05-18',
    documents: ['Lab order', 'Receipt'],
    status: 'under-review',
    remarks: 'Medical review in progress',
    claimNumber: 'MWIC-2026-05183',
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppDataContextType {
  // Doctors
  doctors: Doctor[];
  addDoctor: (doc: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;

  // Patients
  patients: Patient[];
  addPatient: (p: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;

  // Medical Records
  records: MedicalRecord[];
  addRecord: (r: MedicalRecord) => void;

  // Pharmacy Orders
  pharmacyOrders: PharmacyOrder[];
  updatePharmacyOrder: (id: string, status: PharmacyOrder['status']) => void;

  // Lab Orders
  labOrders: LabOrder[];
  addLabOrder: (order: Omit<LabOrder, 'id' | 'status' | 'reportReady'>) => LabOrder;
  updateLabOrder: (id: string, data: Partial<LabOrder>) => void;
  uploadLabReport: (id: string, notes: string) => void;

  // Insurance
  insuranceClaims: InsuranceClaim[];
  addInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'status' | 'date' | 'claimNumber' | 'remarks'>) => InsuranceClaim;
  updateInsuranceClaim: (id: string, status: InsuranceClaim['status'], remarks?: string) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [doctorList, setDoctorList] = useState<Doctor[]>(initialDoctors);
  const [patientList, setPatientList] = useState<Patient[]>(initialPatients);
  const [appointmentList, setAppointmentList] = useState<Appointment[]>(mockAppointments);
  const [recordList, setRecordList] = useState<MedicalRecord[]>(initialRecords);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>(initialPharmacyOrders);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(initialLabOrders);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>(initialInsuranceClaims);

  // ── Doctors ──
  const addDoctor = (doc: Omit<Doctor, 'id'>) => {
    const newDoc = { ...doc, name: sanitizeName(doc.name).trim(), specialty: sanitizeText(doc.specialty, 50).trim(), hospital: sanitizeAddress(doc.hospital).trim(), id: `d_${Date.now()}` } as Doctor;
    setDoctorList(prev => [newDoc, ...prev]);
    toast.success(`Dr. ${doc.name} added successfully`);
  };
  const updateDoctor = (id: string, data: Partial<Doctor>) => {
    setDoctorList(prev => prev.map(d => d.id === id ? { ...d, ...data, name: data.name ? sanitizeName(data.name).trim() : d.name } : d));
    toast.success('Doctor profile updated');
  };
  const deleteDoctor = (id: string) => {
    setDoctorList(prev => prev.filter(d => d.id !== id));
    toast.success('Doctor removed');
  };

  // ── Patients ──
  const addPatient = (p: Omit<Patient, 'id'>) => {
    const newP = { ...p, name: sanitizeName(p.name).trim(), email: sanitizeEmail(p.email), phone: sanitizeMobile(p.phone), condition: sanitizeText(p.condition, 80).trim(), id: `p_${Date.now()}` };
    setPatientList(prev => [newP, ...prev]);
    toast.success(`Patient ${p.name} added`);
  };
  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatientList(prev => prev.map(p => p.id === id ? { ...p, ...data, name: data.name ? sanitizeName(data.name).trim() : p.name, email: data.email ? sanitizeEmail(data.email) : p.email, phone: data.phone ? sanitizeMobile(data.phone) : p.phone } : p));
    toast.success('Patient record updated');
  };
  const deletePatient = (id: string) => {
    setPatientList(prev => prev.filter(p => p.id !== id));
    toast.success('Patient removed');
  };

  // ── Appointments ──
  const addAppointment = (a: Appointment) => {
    setAppointmentList(prev => [{ ...a, patientName: sanitizeName(a.patientName).trim(), symptoms: a.symptoms ? sanitizeText(a.symptoms, 300).trim() : undefined }, ...prev]);
    toast.success('Appointment booked and synced across dashboards');
  };
  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointmentList(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };
  const cancelAppointment = (id: string) => {
    setAppointmentList(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled', paymentStatus: 'refunded' } : a));
    toast.success('Appointment cancelled. Refund will be processed in 3-5 days.');
  };

  // ── Records ──
  const addRecord = (r: MedicalRecord) => {
    setRecordList(prev => [r, ...prev]);
    toast.success('Health record added');
  };

  // ── Pharmacy ──
  const updatePharmacyOrder = (id: string, status: PharmacyOrder['status']) => {
    setPharmacyOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast.success(`Order ${id} status updated to ${status}`);
  };

  // ── Lab ──
  const addLabOrder = (order: Omit<LabOrder, 'id' | 'status' | 'reportReady'>) => {
    const newOrder: LabOrder = {
      ...order,
      patient: sanitizeName(order.patient).trim(),
      test: sanitizeText(order.test, 100).trim(),
      id: `LB${Date.now().toString().slice(-6)}`,
      status: 'booked',
      reportReady: false,
    };
    setLabOrders(prev => [newOrder, ...prev]);
    toast.success('Lab test booked and synced with lab, doctor, and admin dashboards');
    return newOrder;
  };
  const updateLabOrder = (id: string, data: Partial<LabOrder>) => {
    setLabOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
    toast.success(`Lab order ${id} updated`);
  };
  const uploadLabReport = (id: string, notes: string) => {
    setLabOrders(prev => prev.map(o => o.id === id ? { ...o, reportReady: true, status: 'completed', reportNotes: notes } : o));
    toast.success('Lab report uploaded successfully. Patient notified.');
  };

  // ── Insurance ──
  const addInsuranceClaim = (claim: Omit<InsuranceClaim, 'id' | 'status' | 'date' | 'claimNumber' | 'remarks'>) => {
    const suffix = Date.now().toString().slice(-6);
    const newClaim: InsuranceClaim = {
      ...claim,
      patientName: sanitizeName(claim.patientName).trim(),
      hospital: sanitizeAddress(claim.hospital).trim(),
      treatment: sanitizeText(claim.treatment, 120).trim(),
      id: `CLM${suffix}`,
      claimNumber: `MWIC-2026-${suffix}`,
      date: new Date().toISOString().split('T')[0],
      status: 'submitted',
      remarks: 'Claim submitted with documents. Awaiting insurer validation.',
    };
    setInsuranceClaims(prev => [newClaim, ...prev]);
    toast.success('Insurance claim submitted', { description: `Tracking ID ${newClaim.claimNumber}` });
    window.setTimeout(() => {
      setInsuranceClaims(prev => prev.map(c => c.id === newClaim.id ? { ...c, status: 'under-review', remarks: 'Documents verified. Medical adjudication in progress.' } : c));
    }, 1800);
    return newClaim;
  };

  const updateInsuranceClaim = (id: string, status: InsuranceClaim['status'], remarks?: string) => {
    setInsuranceClaims(prev => prev.map(c => c.id === id ? { ...c, status, remarks: remarks || c.remarks } : c));
    toast.success(`Claim ${id} marked ${status}`);
  };

  return (
    <AppDataContext.Provider value={{
      doctors: doctorList, addDoctor, updateDoctor, deleteDoctor,
      patients: patientList, addPatient, updatePatient, deletePatient,
      appointments: appointmentList, addAppointment, updateAppointment, cancelAppointment,
      records: recordList, addRecord,
      pharmacyOrders, updatePharmacyOrder,
      labOrders, addLabOrder, updateLabOrder, uploadLabReport,
      insuranceClaims, addInsuranceClaim, updateInsuranceClaim,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};
