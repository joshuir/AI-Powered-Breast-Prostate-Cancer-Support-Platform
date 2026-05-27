export type UserRole = 'patient' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt?: string; // ISO string or ServerTimestamp
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  imageUrl: string;
  experience: string;
  availability: string;
  rating: number;
  email: string;
  description?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: AppointmentStatus;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description?: string;
  fileName: string;
  fileType?: string;
  fileSize?: string;
  fileDataURL: string; // Base64 representation of uploaded file for local preview & offline capability
  uploadedAt: string;
}
