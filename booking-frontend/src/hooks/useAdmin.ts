import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/src/lib/api';
import { DashboardStats } from '@/src/types/api.types';
import { Doctor } from '@/src/types/doctor.types';
import { Patient } from '@/src/types/patient.types';
import { Appointment } from '@/src/types/appointment.types';

export const useAdmin = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dashboard stats
  const getDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<DashboardStats>('/admin/dashboard/stats');
      setStats(response.data);
      return response.data;
    } catch (error) {
      setError('Failed to fetch stats');
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List doctors (Admin)
  const listDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ items: Doctor[] }>('/admin/doctors');
      return response.data.items;
    } catch (error) {
      setError('Failed to fetch doctors');
      toast.error('Failed to fetch doctors');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List patients (Admin)
  const listPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ items: Patient[] }>('/admin/patients');
      return response.data.items;
    } catch (error) {
      setError('Failed to fetch patients');
      toast.error('Failed to fetch patients');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List appointments (Admin)
  const listAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ items: Appointment[] }>('/admin/appointments');
      return response.data.items;
    } catch (error) {
      setError('Failed to fetch appointments');
      toast.error('Failed to fetch appointments');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    getDashboardStats,
    listDoctors,
    listPatients,
    listAppointments,
  };
};