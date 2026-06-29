import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/src/lib/api';
import { Appointment, CreateAppointmentDto, CheckoutSessionResponse } from '@/src/types/appointment.types';
import { useAppointmentStore } from '@/src/store/appointmentStore';
import { PaginatedResponse } from '@/src/types/api.types';

export const useAppointments = () => {
  const {
    appointments,
    selectedAppointment,
    isLoading,
    error,
    setAppointments,
    setSelectedAppointment,
    setLoading,
    setError,
    addAppointment,
    updateAppointment,
    reset,
  } = useAppointmentStore();

  // Create appointment
  const createAppointment = useCallback(
    async (data: CreateAppointmentDto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<Appointment>('/appointments', data);
        const appointment = response.data;
        addAppointment(appointment);
        toast.success('Appointment created! Please complete payment.');
        return appointment;
      } catch (error) {
        setError('Failed to create appointment');
        toast.error('Failed to create appointment');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addAppointment, setLoading, setError]
  );

  // Get patient appointments
  const getMyAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PaginatedResponse<Appointment>>('/patients/appointments');
      setAppointments(response.data.items);
      return response.data;
    } catch (error) {
      setError('Failed to fetch appointments');
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [setAppointments, setLoading, setError]);

  // Get doctor appointments - confirmed appointments only
  const getDoctorAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ items: any[]; count: number }>('/doctors/me/appointments');
      setAppointments(response.data.items);
      return response.data;
    } catch (error) {
      setError('Failed to fetch doctor appointments');
      toast.error('Failed to fetch doctor appointments');
    } finally {
      setLoading(false);
    }
  }, [setAppointments, setLoading, setError]);

  // Get appointment by ID
  // Avoid re-fetching the full list on every call if it's already present in store.
  const getAppointment = useCallback(
    async (appointmentId: string) => {
      setLoading(true);
      setError(null);
      try {
        const alreadySelected = selectedAppointment?.id === appointmentId;
        if (alreadySelected) return selectedAppointment;

        // Try to find in already-loaded list first (prevents repeat network calls).
        const fromStore = appointments.find((a) => a.id === appointmentId);
        if (fromStore) {
          setSelectedAppointment(fromStore);
          return fromStore;
        }

        const response = await api.get<PaginatedResponse<Appointment>>(
          '/patients/appointments'
        );
        const appointment = response.data.items.find((a) => a.id === appointmentId) || null;

        if (appointment) setSelectedAppointment(appointment);
        return appointment;
      } catch (error) {
        setError('Failed to fetch appointment');
        toast.error('Failed to fetch appointment');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [appointments, selectedAppointment, setSelectedAppointment, setLoading, setError]
  );

  // Cancel appointment
  const cancelAppointment = useCallback(
    async (appointmentId: string) => {
      setLoading(true);
      setError(null);
      try {
        await api.post(`/patients/appointments/${appointmentId}/cancel`);
        updateAppointment(appointmentId, { status: 'CANCELLED' });
        toast.success('Appointment cancelled successfully');
      } catch (error) {
        setError('Failed to cancel appointment');
        toast.error('Failed to cancel appointment');
      } finally {
        setLoading(false);
      }
    },
    [updateAppointment, setLoading, setError]
  );

  // Create checkout session
  const createCheckoutSession = useCallback(
    async (appointmentId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<CheckoutSessionResponse>('/payments/checkout-session', {
          appointmentId: String(appointmentId),
        });
        return response.data;
      } catch (error) {
        setError('Failed to create checkout session');
        toast.error('Failed to create checkout session');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    appointments,
    selectedAppointment,
    isLoading,
    error,
    createAppointment,
    getMyAppointments,
    getDoctorAppointments,
    getAppointment,
    cancelAppointment,
    createCheckoutSession,
    reset,
  };
};