'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useDoctors } from '@/src/hooks/useDoctors';
import { useAuthStore } from '@/src/store/authStore';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Plus, Trash2, Pencil, Calendar, Clock } from 'lucide-react';

const slotSchema = z.object({
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
});

type SlotFormData = z.infer<typeof slotSchema>;

export default function DoctorAvailabilityPage() {
  const user = useAuthStore((state: any) => state.user);
  const { getDoctorSlots, createSlot, deleteSlot, updateSlot, slots, isLoading } = useDoctors();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      startTime: '',
      endTime: '',
      capacity: 1,
    },
  });

  useEffect(() => {
    if (user) {
      getDoctorSlots();
    }
  }, [user, getDoctorSlots]);

  const onSubmit = async (data: SlotFormData) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    console.log('Form data submitted:', data);
    console.log('Is editing:', !!editingSlot);

    try {
      if (editingSlot) {
        console.log('Updating slot with id:', editingSlot.id);
        await updateSlot(editingSlot.id, data);
      } else {
        console.log('Creating new slot');
        await createSlot(data);
      }
      setIsDialogOpen(false);
      reset();
      setEditingSlot(null);
      getDoctorSlots();
    } catch (error) {
      console.error('Failed to save slot:', error);
    }
  };

  const handleDelete = async (slotId: string) => {
    await deleteSlot(slotId);
    getDoctorSlots();
  };

  const handleEdit = (slot: any) => {
    setEditingSlot(slot);
    reset({
      startTime: format(parseISO(slot.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(parseISO(slot.endTime), "yyyy-MM-dd'T'HH:mm"),
      capacity: slot.capacity,
    });
    setIsDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    reset();
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading slots..." />;
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Availability Management</h1>
          <p className="text-slate-600 mt-2">
            Manage your available time slots for patient appointments
          </p>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Time Slots
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                {slots.length} {slots.length === 1 ? 'slot' : 'slots'} configured
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) handleCancelEdit();
            }}>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {editingSlot ? 'Edit Time Slot' : 'Create New Time Slot'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-sm font-medium text-slate-700">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        className="h-11"
                        {...register('startTime')}
                      />
                      {errors.startTime && (
                        <p className="text-sm text-red-500">
                          {errors.startTime.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium text-slate-700">
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        className="h-11"
                        {...register('endTime')}
                      />
                      {errors.endTime && (
                        <p className="text-sm text-red-500">
                          {errors.endTime.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-sm font-medium text-slate-700">
                        Capacity
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        min={1}
                        className="h-11"
                        {...register('capacity', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="text-slate-600 font-semibold text-sm">Date</TableHead>
                    <TableHead className="text-slate-600 font-semibold text-sm">Time</TableHead>
                    <TableHead className="text-slate-600 font-semibold text-sm">Status</TableHead>
                    <TableHead className="text-slate-600 font-semibold text-sm">Capacity</TableHead>
                    <TableHead className="text-right text-slate-600 font-semibold text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">No slots available</p>
                          <p className="text-slate-400 text-sm">Add your first time slot to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    slots.map((slot: any) => (
                      <TableRow
                        key={slot.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {format(parseISO(slot.startTime), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {format(parseISO(slot.startTime), 'hh:mm a')} -{' '}
                            {format(parseISO(slot.endTime), 'hh:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`
                              ${slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                              ${slot.status === 'BOOKED' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
                              ${slot.status === 'CANCELLED' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}
                            `}
                          >
                            {slot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-full bg-slate-100 text-sm font-medium">
                            {slot.capacity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slot)}
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <Pencil className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}