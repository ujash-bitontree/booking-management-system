'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useDoctors } from '@/src/hooks/useDoctors';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Doctor } from '@/src/types/doctor.types';

export default function AdminDoctorsPage() {
  const { listDoctors, doctors, isLoading, createDoctor, updateDoctor, deleteDoctor } = useDoctors();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    specialization: '',
    consultationFeeCents: '5000',
    currency: 'usd',
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    fullName: '',
    specialization: '',
    consultationFeeCents: '5000',
    currency: 'usd',
  });

  useEffect(() => {
    listDoctors({ search, admin: true });
  }, [listDoctors, search]);

  const resetCreateForm = () => {
    setCreateFormData({
      email: '',
      password: '',
      fullName: '',
      specialization: '',
      consultationFeeCents: '5000',
      currency: 'usd',
    });
  };

  const handleCreateDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...createFormData,
      consultationFeeCents: Number(createFormData.consultationFeeCents) || 5000,
    };

    const created = await createDoctor(payload);
    if (created) {
      setIsCreateOpen(false);
      resetCreateForm();
    }
  };

  const handleEditDoctor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingDoctor) return;

    const updated = await updateDoctor(editingDoctor.id, {
      email: editFormData.email || undefined,
      fullName: editFormData.fullName || undefined,
      specialization: editFormData.specialization || undefined,
      consultationFeeCents: Number(editFormData.consultationFeeCents) || undefined,
      currency: editFormData.currency || undefined,
    });

    if (updated) {
      setIsEditOpen(false);
      setEditingDoctor(null);
    }
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      email: doctor.email,
      fullName: doctor.fullName,
      specialization: doctor.specialization || '',
      consultationFeeCents: doctor.consultationFeeCents.toString(),
      currency: doctor.currency,
    });
    setIsEditOpen(true);
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!window.confirm('Delete this doctor?')) return;
    await deleteDoctor(doctorId);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Doctors</CardTitle>
            <CardDescription>
              Manage all doctors in the system
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create doctor</DialogTitle>
                  <DialogDescription>Add a new doctor account and profile.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateDoctor} className="space-y-4">
                  <Input placeholder="Full name" value={createFormData.fullName} onChange={(event) => setCreateFormData({ ...createFormData, fullName: event.target.value })} required />
                  <Input type="email" placeholder="Email" value={createFormData.email} onChange={(event) => setCreateFormData({ ...createFormData, email: event.target.value })} required />
                  <Input type="password" placeholder="Temporary password" value={createFormData.password} onChange={(event) => setCreateFormData({ ...createFormData, password: event.target.value })} required />
                  <Input placeholder="Specialization" value={createFormData.specialization} onChange={(event) => setCreateFormData({ ...createFormData, specialization: event.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="number" placeholder="Fee in cents" value={createFormData.consultationFeeCents} onChange={(event) => setCreateFormData({ ...createFormData, consultationFeeCents: event.target.value })} />
                    <Input placeholder="Currency" value={createFormData.currency} onChange={(event) => setCreateFormData({ ...createFormData, currency: event.target.value })} />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create doctor</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner text="Loading doctors..." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor: any) => (
                    <TableRow key={doctor.id}>
                      <TableCell>{doctor.id}</TableCell>
                      <TableCell>{doctor.fullName}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>{doctor.specialization || 'N/A'}</TableCell>
                      <TableCell>
                        ${(doctor.consultationFeeCents / 100).toFixed(2)} {doctor.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.isActive ? 'default' : 'secondary'}>
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctors/${doctor.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(doctor)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteDoctor(doctor.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>Update the selected doctor profile.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDoctor} className="space-y-4">
            <Input placeholder="Full name" value={editFormData.fullName} onChange={(event) => setEditFormData({ ...editFormData, fullName: event.target.value })} required />
            <Input type="email" placeholder="Email" value={editFormData.email} onChange={(event) => setEditFormData({ ...editFormData, email: event.target.value })} required />
            <Input placeholder="Specialization" value={editFormData.specialization} onChange={(event) => setEditFormData({ ...editFormData, specialization: event.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Fee in cents" value={editFormData.consultationFeeCents} onChange={(event) => setEditFormData({ ...editFormData, consultationFeeCents: event.target.value })} />
              <Input placeholder="Currency" value={editFormData.currency} onChange={(event) => setEditFormData({ ...editFormData, currency: event.target.value })} />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}