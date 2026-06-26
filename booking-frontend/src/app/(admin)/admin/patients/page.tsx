'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import { usePatients } from '@/src/hooks/usePatients';
import { Patient } from '@/src/types/patient.types';

export default function AdminPatientsPage() {
  const { listPatients, patients, isLoading, createPatient, updatePatient, deletePatient } = usePatients();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [createFormData, setCreateFormData] = useState({ email: '', password: '', fullName: '', phoneNumber: '' });
  const [editFormData, setEditFormData] = useState({ email: '', fullName: '', phoneNumber: '' });

  useEffect(() => {
    listPatients();
  }, [listPatients]);

  const handleCreatePatient = async (event: React.FormEvent) => {
    event.preventDefault();
    const created = await createPatient(createFormData);
    if (created) {
      setIsCreateOpen(false);
      setCreateFormData({ email: '', password: '', fullName: '', phoneNumber: '' });
    }
  };

  const handleEditPatient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingPatient) return;

    const updated = await updatePatient(editingPatient.id, {
      email: editFormData.email || undefined,
      fullName: editFormData.fullName || undefined,
      phoneNumber: editFormData.phoneNumber || undefined,
    });

    if (updated) {
      setIsEditOpen(false);
      setEditingPatient(null);
    }
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setEditFormData({
      email: patient.email,
      fullName: patient.fullName,
      phoneNumber: patient.phoneNumber || '',
    });
    setIsEditOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm('Delete this patient?')) return;
    await deletePatient(patientId);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.fullName.toLowerCase().includes(search.toLowerCase()) ||
    patient.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading patients..." />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patients</CardTitle>
            <CardDescription>
              Manage all patients in the system
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create patient</DialogTitle>
                  <DialogDescription>Add a new patient account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePatient} className="space-y-4">
                  <Input placeholder="Full name" value={createFormData.fullName} onChange={(event) => setCreateFormData({ ...createFormData, fullName: event.target.value })} required />
                  <Input type="email" placeholder="Email" value={createFormData.email} onChange={(event) => setCreateFormData({ ...createFormData, email: event.target.value })} required />
                  <Input type="password" placeholder="Temporary password" value={createFormData.password} onChange={(event) => setCreateFormData({ ...createFormData, password: event.target.value })} required />
                  <Input placeholder="Phone number" value={createFormData.phoneNumber} onChange={(event) => setCreateFormData({ ...createFormData, phoneNumber: event.target.value })} />
                  <DialogFooter>
                    <Button type="submit">Create patient</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>{patient.fullName}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(patient)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePatient(patient.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit patient</DialogTitle>
            <DialogDescription>Update the selected patient profile.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPatient} className="space-y-4">
            <Input placeholder="Full name" value={editFormData.fullName} onChange={(event) => setEditFormData({ ...editFormData, fullName: event.target.value })} required />
            <Input type="email" placeholder="Email" value={editFormData.email} onChange={(event) => setEditFormData({ ...editFormData, email: event.target.value })} required />
            <Input placeholder="Phone number" value={editFormData.phoneNumber} onChange={(event) => setEditFormData({ ...editFormData, phoneNumber: event.target.value })} />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}