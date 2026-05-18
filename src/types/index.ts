export type UserRole = 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'superadmin' | 'lab';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  gender?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subSpecialty?: string;
  qualification: string;
  experience: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  languages: string[];
  hospital: string;
  location: string;
  avatar: string;
  available: boolean;
  availableSlots: string[];
  bio: string;
  patients: number;
  registrationNo: string;
  nextAvailable: string;
  tags: string[];
  telemedicineEnabled: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'telemedicine';
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  symptoms?: string;
  notes?: string;
  fee: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  prescription?: Prescription;
}

export interface Prescription {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  medicines: { name: string; dosage: string; duration: string; instructions: string }[];
  diagnosis: string;
  notes: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  image: string;
  description: string;
  dosage: string;
  requiresPrescription: boolean;
  stock: number;
  rating: number;
  tags: string[];
}

export interface LabTest {
  id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  sampleType: string;
  reportTime: string;
  homeCollection: boolean;
  parameters: string[];
  category: string;
  preparation?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  testId: string;
  testName: string;
  date: string;
  time: string;
  status: 'booked' | 'sample-collected' | 'processing' | 'completed';
  homeCollection: boolean;
  address?: string;
  reportUrl?: string;
  price: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'prescription' | 'report' | 'vaccination' | 'discharge' | 'insurance';
  title: string;
  date: string;
  doctor?: string;
  hospital?: string;
  description: string;
  fileUrl?: string;
  tags: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  type: 'medicine' | 'lab';
}

export interface Hospital {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  rating: number;
  beds: number;
  specialties: string[];
  image: string;
  phone: string;
  emergency: boolean;
}

export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  premium: number;
  coverage: number;
  features: string[];
  popular?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'lab' | 'payment' | 'emergency' | 'general';
  time: string;
  read: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  condition: string;
  date: string;
}

export interface SymptomMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface AmbulanceRequest {
  id: string;
  status: 'requested' | 'dispatched' | 'en-route' | 'arrived';
  ambulanceNo: string;
  driverName: string;
  driverPhone: string;
  eta: number;
  distance: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'insurance' | 'wallet';
  label: string;
  last4?: string;
  upiId?: string;
  balance?: number;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingReports: number;
  revenue: number;
  growth: number;
  completedConsultations: number;
}
