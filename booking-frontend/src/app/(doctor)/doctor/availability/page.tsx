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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Availability Slots</CardTitle>
            <CardDescription>
              Manage your available time slots for appointments
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) handleCancelEdit();
          }}>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Slot
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add New Slot'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...register('startTime')}
                  />
                  {errors.startTime && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...register('endTime')}
                  />
                  {errors.endTime && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    {...register('capacity', { valueAsNumber: true })}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" type="button" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No slots available. Add your first slot!
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot: any) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      {format(parseISO(slot.startTime), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(slot.startTime), 'hh:mm a')} -{' '}
                      {format(parseISO(slot.endTime), 'hh:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          slot.status === 'AVAILABLE'
                            ? 'default'
                            : slot.status === 'BOOKED'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {slot.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{slot.capacity}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(slot)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}