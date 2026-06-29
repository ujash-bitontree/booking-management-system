import { create } from 'zustand';
import { Appointment } from '@/src/types/appointment.types';

interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setAppointments: (appointments: Appointment[]) => void;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { page: number; limit: number; total: number; totalPages: number }) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  updateAppointmentStatus: (id: string, status: string) => void;
  reset: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set: any) => ({
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  },

  setAppointments: (appointments: any) => set({ appointments }),
  setSelectedAppointment: (selectedAppointment: any) => set({ selectedAppointment }),
  setLoading: (isLoading: any) => set({ isLoading }),
  setError: (error: any) => set({ error }),
  setPagination: (pagination: any) => set({ pagination }),

  addAppointment: (appointment: any) =>
    set((state: any) => ({
      appointments: [...state.appointments, appointment],
    })),

  updateAppointment: (id: any, appointment: any) =>
    set((state: any) => ({
      appointments: state.appointments.map((a: any) =>
        a.id === id ? { ...a, ...appointment } : a
      ),
      selectedAppointment:
        state.selectedAppointment?.id === id
          ? { ...state.selectedAppointment, ...appointment }
          : state.selectedAppointment,
    })),

  updateAppointmentStatus: (id: any, status: any) =>
    set((state: any) => ({
      appointments: state.appointments.map((a: any) =>
        a.id === id ? { ...a, status } : a
      ),
      selectedAppointment:
        state.selectedAppointment?.id === id
          ? { ...state.selectedAppointment, status }
          : state.selectedAppointment,
    })),

  reset: () => set({
    appointments: [],
    selectedAppointment: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
    },
  }),
}));

// Selectors
export const selectAppointments = (state: AppointmentState) => state.appointments;
export const selectSelectedAppointment = (state: AppointmentState) => state.selectedAppointment;
export const selectIsAppointmentsLoading = (state: AppointmentState) => state.isLoading;