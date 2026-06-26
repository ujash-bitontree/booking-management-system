import { create } from 'zustand';
import { Doctor, Slot } from '@/src/types/doctor.types';

interface DoctorState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  slots: Slot[];
  isLoading: boolean;
  error: string | null;
  setDoctors: (doctors: Doctor[]) => void;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  setSlots: (slots: Slot[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDoctorStore = create<DoctorState>((set: any) => ({
  doctors: [],
  selectedDoctor: null,
  slots: [],
  isLoading: false,
  error: null,

  setDoctors: (doctors: any) => set({ doctors }),
  setSelectedDoctor: (selectedDoctor: any) => set({ selectedDoctor }),
  setSlots: (slots: any) => set({ slots }),
  setLoading: (isLoading: any) => set({ isLoading }),
  setError: (error: any) => set({ error }),
  reset: () => set({
    doctors: [],
    selectedDoctor: null,
    slots: [],
    isLoading: false,
    error: null,
  }),
}));

// Selectors
export const selectDoctors = (state: DoctorState) => state.doctors;
export const selectSelectedDoctor = (state: DoctorState) => state.selectedDoctor;
export const selectSlots = (state: DoctorState) => state.slots;
export const selectIsDoctorsLoading = (state: DoctorState) => state.isLoading;