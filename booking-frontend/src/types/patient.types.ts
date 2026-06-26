export interface Patient {
  id: string;
  userId: number;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  role: 'PATIENT';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientProfileUpdate {
  fullName?: string;
  phoneNumber?: string;
}