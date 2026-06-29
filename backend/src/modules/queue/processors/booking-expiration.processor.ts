import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { BOOKING_EXPIRATION_QUEUE } from '../queue.constants';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { AppointmentStatus } from '../../../common/enums/appointment-status.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

@Processor(BOOKING_EXPIRATION_QUEUE)
@Injectable()
export class BookingExpirationProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingExpirationProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<{ appointmentId: string; userId: string }>) {
    try {
      return this.dataSource.transaction(async (manager) => {
        const appointment = await manager.findOne(Appointment, {
          where: { id: job.data.appointmentId },
          // relations: ['payment'],
          lock: { mode: 'pessimistic_write' }
        });
        console.log(appointment, 'Appointment in processor ::::');

        if (!appointment || appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
          return { processed: false };
        }

        if (appointment.expiresAt && appointment.expiresAt.getTime() > Date.now()) {
          return { processed: false };
        }

        // // Get the patient profile to find the user ID
        // const patientProfile = await manager.findOne(PatientProfile, {
        //   where: { id: appointment.patientId },
        // }as any);

        // const userId = patientProfile?.userId?.toString() || job.data.userId;

        appointment.status = AppointmentStatus.EXPIRED;
        await manager.save(appointment);

        if (appointment.paymentId || appointment.payment) {
          await manager.update(
            Payment,
            { appointmentId: appointment.id },
            { status: PaymentStatus.CANCELLED }
          );
        }

        return { processed: true, appointmentId: appointment.id };
      });
    } catch (error) {
      this.logger.error(`Error in booking expiration processor: ${error}`);
      return error;
    }
  }
}
