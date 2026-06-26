export interface Doctor {
  id: string;
  userId: number;
  email: string;
  fullName: string;
  specialization: string | null;
  bio: string | null;
  experienceYears: string | null;
  consultationFeeCents: number;
  currency: string;
  role: 'DOCTOR';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorProfileUpdate {
  fullName?: string;
  specialization?: string;
  bio?: string;
  experienceYears?: string;
  consultationFeeCents?: number;
  currency?: string;
}

export interface Slot {
  id: string;
  doctorId: number;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SlotStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'CANCELLED';

export interface CreateSlotDto {
  startTime: string;
  endTime: string;
  capacity?: number;
}

export interface UpdateSlotDto {
  startTime?: string;
  endTime?: string;
  capacity?: number;
}

export interface ListDoctorsQuery {
  search?: string;
  specialization?: string;
  page?: number;
  limit?: number;
  admin?: boolean;
}