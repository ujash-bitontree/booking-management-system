import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PatientProfile } from './entities/patient-profile.entity';
import { User } from '../users/entities/user.entity';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientProfile)
    private readonly patientProfilesRepository: Repository<PatientProfile>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly dataSource: DataSource
  ) {}

  async getMyProfile(userId: string) {
    const patient = await this.patientProfilesRepository.findOne({
      where: { userId },
      relations: ['user']
    } as any);

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.toPatientResponse(patient);
  }

  async updateMyProfile(userId: string, dto: UpdatePatientProfileDto) {
    const patient = await this.patientProfilesRepository.findOne({
      where: { userId },
      relations: ['user']
    } as any);

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    if (dto.fullName !== undefined) {
      patient.fullName = dto.fullName;
    }
    if (dto.phoneNumber !== undefined) {
      patient.phoneNumber = dto.phoneNumber;
    }

    await this.patientProfilesRepository.save(patient);
    return this.toPatientResponse(patient);
  }

  async deleteMyProfile(userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const patient = await manager.findOne(PatientProfile, { where: { userId } } as any);
      if (!patient) {
        throw new NotFoundException('Patient profile not found');
      }

      const user = await manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isActive = false;
      await manager.save(user);
      await manager.softDelete(PatientProfile, { id: patient.id });

      return { deleted: true, patientId: patient.id };
    });
  }

  async listBookingHistory(userId: string, page: number = 1, limit: number = 5) {
    const patient = await this.patientProfilesRepository.findOne({
      where: { userId }
    }as any);

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await this.appointmentsRepository.findAndCount({
      where: { patientId: patient.id },
      relations: ['doctor', 'slot', 'payment'],
      order: { scheduledAt: 'DESC' },
      take: limit,
      skip
    }as any);

    return {
      items: appointments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async cancelAppointment(userId: string, appointmentId: string) {
    const patient = await this.patientProfilesRepository.findOne({
      where: { userId }
    }as any);

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId, patientId: patient.id },
      relations: ['payment']
    }as any);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (
      appointment.status !== AppointmentStatus.PENDING_PAYMENT &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      return { cancelled: false, appointmentId };
    }

    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentsRepository.save(appointment);

    return { cancelled: true, appointmentId };
  }

  async listPatients(query: ListPatientsQueryDto) {
    const qb = this.patientProfilesRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('patient.deletedAt IS NULL');

    if (query.search) {
      qb.andWhere('(patient.fullName ILIKE :search OR user.email ILIKE :search)', {
        search: `%${query.search}%`
      });
    }

    qb.orderBy('patient.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, count] = await qb.getManyAndCount();
    return {
      items: items.map((patient) => this.toPatientResponse(patient)),
      meta: { page: query.page, limit: query.limit, count }
    };
  }

  private toPatientResponse(patient: PatientProfile) {
    return {
      id: patient.id,
      userId: patient.userId,
      email: patient.user.email,
      fullName: patient.fullName,
      phoneNumber: patient.phoneNumber,
      isActive: patient.user.isActive
    };
  }
}
