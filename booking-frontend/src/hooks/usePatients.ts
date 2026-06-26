import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/src/lib/api';
import { Patient, PatientProfileUpdate } from '@/src/types/patient.types';
import { PaginatedResponse } from '@/src/types/api.types';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current patient profile
  const getMyProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Patient>('/patients/me');
      setSelectedPatient(response.data);
      return response.data;
    } catch (error) {
      setError('Failed to fetch profile');
      toast.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update patient profile
  const updateProfile = useCallback(
    async (data: PatientProfileUpdate) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.patch<Patient>('/patients/me', data);
        setSelectedPatient(response.data);
        toast.success('Profile updated successfully');
        return response.data;
      } catch (error) {
        setError('Failed to update profile');
        toast.error('Failed to update profile');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // List all patients (Admin)
  const listPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<PaginatedResponse<Patient>>('/admin/patients');
      setPatients(response.data.items);
      return response.data;
    } catch (error) {
      setError('Failed to fetch patients');
      toast.error('Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPatient = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post<Patient>('/admin/patients', data);
        await listPatients();
        toast.success('Patient created successfully');
        return response.data;
      } catch (error) {
        setError('Failed to create patient');
        toast.error('Failed to create patient');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [listPatients]
  );

  const updatePatient = useCallback(
    async (patientId: string, data: { email?: string; fullName?: string; phoneNumber?: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.patch<Patient>(`/admin/patients/${patientId}`, data);
        await listPatients();
        toast.success('Patient updated successfully');
        return response.data;
      } catch (error) {
        setError('Failed to update patient');
        toast.error('Failed to update patient');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [listPatients]
  );

  const deletePatient = useCallback(
    async (patientId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/admin/patients/${patientId}`);
        await listPatients();
        toast.success('Patient deleted successfully');
        return true;
      } catch (error) {
        setError('Failed to delete patient');
        toast.error('Failed to delete patient');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [listPatients]
  );

  return {
    patients,
    selectedPatient,
    isLoading,
    error,
    getMyProfile,
    updateProfile,
    listPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};