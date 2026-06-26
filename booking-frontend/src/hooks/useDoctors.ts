import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/src/lib/api';
import { Doctor, Slot, ListDoctorsQuery, CreateSlotDto, UpdateSlotDto, DoctorProfileUpdate } from '@/src/types/doctor.types';
import { useDoctorStore } from '@/src/store/doctorStore';
import { PaginatedResponse } from '@/src/types/api.types';

export const useDoctors = () => {
  const {
    doctors,
    selectedDoctor,
    slots,
    isLoading,
    error,
    setDoctors,
    setSelectedDoctor,
    setSlots,
    setLoading,
    setError,
    reset,
  } = useDoctorStore();

  const listDoctors = useCallback(
    async (query: ListDoctorsQuery = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.search) params.append('search', query.search);
        if (query.specialization) params.append('specialization', query.specialization);
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());

        const endpoint = query.admin
          ? `/admin/doctors${params.toString() ? `?${params.toString()}` : ''}`
          : `/doctors${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await api.get<PaginatedResponse<Doctor>>(endpoint);
        setDoctors(response.data.items);
        return response.data;
      } catch {
        setError('Failed to fetch doctors');
        toast.error('Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    },
    [setDoctors, setLoading, setError]
  );

  const createDoctor = useCallback(
    async (data: {
      email: string;
      password: string;
      fullName: string;
      specialization?: string;
      bio?: string;
      experienceYears?: string;
      consultationFeeCents?: number;
      currency?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<Doctor>('/admin/doctors', data);
        await listDoctors({ admin: true });
        toast.success('Doctor created successfully');
        return response.data;
      } catch {
        setError('Failed to create doctor');
        toast.error('Failed to create doctor');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [listDoctors, setLoading, setError]
  );

  const updateDoctor = useCallback(
    async (doctorId: string, data: {
      email?: string;
      fullName?: string;
      specialization?: string;
      bio?: string;
      experienceYears?: string;
      consultationFeeCents?: number;
      currency?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.patch<Doctor>(`/admin/doctors/${doctorId}`, data);
        await listDoctors({ admin: true });
        toast.success('Doctor updated successfully');
        return response.data;
      } catch {
        setError('Failed to update doctor');
        toast.error('Failed to update doctor');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [listDoctors, setLoading, setError]
  );

  const deleteDoctor = useCallback(
    async (doctorId: string) => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/admin/doctors/${doctorId}`);
        await listDoctors({ admin: true });
        toast.success('Doctor deleted successfully');
        return true;
      } catch {
        setError('Failed to delete doctor');
        toast.error('Failed to delete doctor');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [listDoctors, setLoading, setError]
  );

  const getDoctor = useCallback(
    async (doctorId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Doctor>(`/doctors/${doctorId}`);
        setSelectedDoctor(response.data);
        return response.data;
      } catch {
        setError('Failed to fetch doctor');
        toast.error('Doctor not found');
      } finally {
        setLoading(false);
      }
    },
    [setSelectedDoctor, setLoading, setError]
  );

  const getMyProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Doctor>('/doctors/me');
      setSelectedDoctor(response.data);
      return response.data;
    } catch {
      setError('Failed to fetch profile');
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [setSelectedDoctor, setLoading, setError]);

  const updateProfile = useCallback(
    async (data: DoctorProfileUpdate) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.patch<Doctor>('/doctors/me', data);
        setSelectedDoctor(response.data);
        toast.success('Profile updated successfully');
        return response.data;
      } catch {
        setError('Failed to update profile');
        toast.error('Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
    [setSelectedDoctor, setLoading, setError]
  );

  const getDoctorSlots = useCallback(
    async (doctorId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = doctorId ? `/doctors/slots/public/${doctorId}` : '/doctors/slots/me';
        const response = await api.get<{ items: Slot[]; count: number }>(endpoint);
        setSlots(response.data.items);
        return response.data.items;
      } catch {
        setError('Failed to fetch slots');
        toast.error('Failed to fetch slots');
      } finally {
        setLoading(false);
      }
    },
    [setSlots, setLoading, setError]
  );

  const createSlot = useCallback(
    async (data: CreateSlotDto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<Slot>('/doctors/slots', data);
        await getDoctorSlots();
        toast.success('Slot created successfully');
        return response.data;
      } catch {
        setError('Failed to create slot');
        toast.error('Failed to create slot');
      } finally {
        setLoading(false);
      }
    },
    [getDoctorSlots, setLoading, setError]
  );

  const updateSlot = useCallback(
    async (slotId: string, data: UpdateSlotDto) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.patch<Slot>(`/doctors/slots/${slotId}`, data);
        await getDoctorSlots();
        toast.success('Slot updated successfully');
        return response.data;
      } catch {
        setError('Failed to update slot');
        toast.error('Failed to update slot');
      } finally {
        setLoading(false);
      }
    },
    [getDoctorSlots, setLoading, setError]
  );

  const deleteSlot = useCallback(
    async (slotId: string) => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/doctors/slots/${slotId}`);
        await getDoctorSlots();
        toast.success('Slot deleted successfully');
      } catch {
        setError('Failed to delete slot');
        toast.error('Failed to delete slot');
      } finally {
        setLoading(false);
      }
    },
    [getDoctorSlots, setLoading, setError]
  );

  return {
    doctors,
    selectedDoctor,
    slots,
    isLoading,
    error,
    listDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctor,
    getMyProfile,
    updateProfile,
    createSlot,
    updateSlot,
    deleteSlot,
    getDoctorSlots,
    reset,
  };
};