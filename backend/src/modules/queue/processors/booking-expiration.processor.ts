import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
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
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async process(job: Job<{ appointmentId: string }>) {
    return this.dataSource.transaction(async (manager) => {
      const appointment = await manager.findOne(Appointment, {
        where: { id: job.data.appointmentId },
        relations: ['payment'],
        lock: { mode: 'pessimistic_write' }
      });

      if (!appointment || appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
        return { processed: false };
      }

      if (appointment.expiresAt && appointment.expiresAt > new Date()) {
        return { processed: false };
      }

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
  }
}
