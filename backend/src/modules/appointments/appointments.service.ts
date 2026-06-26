import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { DataSource } from 'typeorm';
import { Queue } from 'bullmq';
import { Appointment } from './entities/appointment.entity';
import { AvailabilitySlot, SlotStatus } from '../slots/entities/availability-slot.entity';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { BOOKING_EXPIRATION_QUEUE } from '../queue/queue.constants';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @InjectQueue(BOOKING_EXPIRATION_QUEUE) 
    private readonly bookingExpirationQueue: Queue
  ) { }

  async createPendingAppointment(patientId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    console.log(patientId, 'PATENT ID HERE <<<<<')
    const holdMinutes = this.configService.getOrThrow<number>('booking.holdMinutes');

    const appointment = await this.dataSource.transaction(async (manager) => {
      // const slot = await manager.findOne(AvailabilitySlot, {
      //   where: { id: dto.slotId, doctorId: dto.doctorId },
      //   relations: ['doctor'],
      //   lock: { mode: 'pessimistic_write' }
      // }as any);

      const slot = await manager.createQueryBuilder(AvailabilitySlot, 'slot')
        .leftJoinAndSelect('slot.doctor', 'doctor')
        .where('slot.id = :slotId AND slot.doctorId = :doctorId', {
          slotId: dto.slotId,
          doctorId: dto.doctorId
        })
        // 💡 Pass ['slot'] as the third argument to lock ONLY the slot table
        .setLock('pessimistic_write', undefined, ['slot'])
        .getOne();

      if (!slot) {
        throw new NotFoundException('Slot not found');
      }

      if (slot.status !== SlotStatus.AVAILABLE) {
        throw new BadRequestException('Selected slot is not available');
      }

      // if (slot.startTime.toISOString() !== new Date(dto.scheduledAt).toISOString()) {
      //   throw new BadRequestException('Scheduled time does not match the slot');
      // }

      const existingBookedAppointment = await manager.findOne(Appointment, {
        where: [
          { slotId: slot.id, status: AppointmentStatus.CONFIRMED },
          { slotId: slot.id, status: AppointmentStatus.COMPLETED }
        ],
        lock: { mode: 'pessimistic_read' }
      } as any);

      if (existingBookedAppointment) {
        throw new ConflictException('Slot has already been booked');
      }

      const doctor = slot.doctor as DoctorProfile | undefined;
      if (!doctor) {
        throw new NotFoundException('Doctor profile not found');
      }

      const scheduledAt = slot.startTime;
      const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

      const patientProfile = await manager.findOne(PatientProfile, {
        where: {
          userId: Number(patientId),
        },
      });

      if (!patientProfile) {
        throw new NotFoundException('Patient profile not found');
      }

      const savedAppointment = await manager.save(
        manager.create(Appointment, {
          patientId: patientProfile.id,
          doctorId: dto.doctorId,
          slotId: dto.slotId,
          scheduledAt,
          expiresAt,
          status: AppointmentStatus.PENDING_PAYMENT
        } as any)
      );

      const savedPayment = await manager.save(
        manager.create(Payment, {
          appointmentId: savedAppointment.id,
          amount: doctor.consultationFeeCents,
          currency: doctor.currency,
          status: PaymentStatus.INITIATED,
          stripeCheckoutSessionId: null,
          stripePaymentIntentId: null,
          rawStripePayload: null
        } as any)
      );

      savedAppointment.paymentId = savedPayment.id as any;
      await manager.save(savedAppointment);

      return savedAppointment;
    });

    const delay = Math.max(
      0,
      appointment.expiresAt ? appointment.expiresAt.getTime() - Date.now() : 0
    );

    const addToexpiredBQueue = await this.bookingExpirationQueue.add(
      'expire-appointment',
      { appointmentId: appointment.id },
      {
        delay,
        removeOnComplete: true,
        removeOnFail: false
      }
    );
    console.log(addToexpiredBQueue, 'Added to booking expiration queue <<<<<');
    return appointment;
  }

  async expireAppointment(appointmentId: string): Promise<{ expired: boolean }> {
    return this.dataSource.transaction(async (manager) => {
      const appointment = await manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: ['slot', 'payment'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!appointment) {
        return { expired: false };
      }

      if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
        return { expired: false };
      }

      if (appointment.expiresAt && appointment.expiresAt > new Date()) {
        return { expired: false };
      }

      appointment.status = AppointmentStatus.EXPIRED;
      await manager.save(appointment);

      if (appointment.payment) {
        appointment.payment.status = PaymentStatus.CANCELLED;
        await manager.save(appointment.payment);
      }

      return { expired: true };
    });
  }
}
