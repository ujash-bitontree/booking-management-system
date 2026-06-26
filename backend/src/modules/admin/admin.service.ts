import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
import * as bcrypt from 'bcryptjs'
import { User } from '../users/entities/user.entity';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity';
import { PatientProfile } from '../patients/entities/patient-profile.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Role } from '../../common/enums/role.enum';
import { CreateDoctorAdminDto } from './dto/create-doctor-admin.dto';
import { UpdateDoctorAdminDto } from './dto/update-doctor-admin.dto';
import { CreatePatientAdminDto } from './dto/create-patient-admin.dto';
import { UpdatePatientAdminDto } from './dto/update-patient-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(DoctorProfile)
    private readonly doctorProfilesRepository: Repository<DoctorProfile>,
    @InjectRepository(PatientProfile)
    private readonly patientProfilesRepository: Repository<PatientProfile>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly dataSource: DataSource
  ) {}

  async dashboardStats() {
    const [users, doctors, patients, appointments] = await Promise.all([
      this.usersRepository.count(),
      this.doctorProfilesRepository.count(),
      this.patientProfilesRepository.count(),
      this.appointmentsRepository.count()
    ]);

    return {
      users,
      doctors,
      patients,
      appointments,
      totalDoctors: doctors,
      totalPatients: patients,
      totalAppointments: appointments,
      totalRevenue: 0
    };
  }

  async listDoctors() {
    const doctors = await this.doctorProfilesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    return {
      items: doctors.map((doctor) => this.toDoctorResponse(doctor)),
      count: doctors.length
    };
  }

  async createDoctor(dto: CreateDoctorAdminDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        role: Role.DOCTOR,
        isActive: true
      });
      const savedUser = await manager.save(user);

      const profile = manager.create(DoctorProfile, {
        userId: savedUser.id,
        fullName: dto.fullName,
        specialization: dto.specialization ?? null,
        bio: dto.bio ?? null,
        experienceYears: dto.experienceYears ?? null,
        consultationFeeCents: dto.consultationFeeCents ?? 5000,
        currency: dto.currency ?? 'usd'
      }as any);
      const savedProfile = await manager.save(profile);

      return {
        ...this.toDoctorResponse({ ...savedProfile, user: savedUser }),
        access: 'created'
      };
    });
  }

  async updateDoctor(doctorId: string, dto: UpdateDoctorAdminDto) {
    const doctor = await this.doctorProfilesRepository.findOne({
      where: { id: doctorId },
      relations: ['user']
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (dto.email && dto.email !== doctor.user.email) {
      const conflict = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (conflict) {
        throw new ConflictException('Email is already registered');
      }
      doctor.user.email = dto.email;
      await this.usersRepository.save(doctor.user);
    }

    if (dto.fullName !== undefined) doctor.fullName = dto.fullName;
    if (dto.specialization !== undefined) doctor.specialization = dto.specialization;
    if (dto.bio !== undefined) doctor.bio = dto.bio;
    if (dto.experienceYears !== undefined) doctor.experienceYears = dto.experienceYears;
    if (dto.consultationFeeCents !== undefined) doctor.consultationFeeCents = dto.consultationFeeCents;
    if (dto.currency !== undefined) doctor.currency = dto.currency;

    await this.doctorProfilesRepository.save(doctor);
    return this.toDoctorResponse(doctor);
  }

  async deleteDoctor(doctorId: string) {
    return this.dataSource.transaction(async (manager) => {
      const doctor = await manager.findOne(DoctorProfile, { where: { id: doctorId } });
      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      const user = await manager.findOne(User, { where: { id: doctor.userId } as any});
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isActive = false;
      await manager.save(user);
      await manager.softDelete(DoctorProfile, { id: doctor.id });

      return { deleted: true, doctorId };
    });
  }

  async listPatients() {
    const patients = await this.patientProfilesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    return {
      items: patients.map((patient) => this.toPatientResponse(patient)),
      count: patients.length
    };
  }

  async createPatient(dto: CreatePatientAdminDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        passwordHash,
        role: Role.PATIENT,
        isActive: true
      });
      const savedUser = await manager.save(user);

      const profile = manager.create(PatientProfile, {
        userId: savedUser.id,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber ?? null
      }as any);
      const savedProfile = await manager.save(profile);

      return {
        ...this.toPatientResponse({ ...savedProfile, user: savedUser }),
        access: 'created'
      };
    });
  }

  async updatePatient(patientId: string, dto: UpdatePatientAdminDto) {
    const patient = await this.patientProfilesRepository.findOne({
      where: { id: patientId },
      relations: ['user']
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (dto.email && dto.email !== patient.user.email) {
      const conflict = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (conflict) {
        throw new ConflictException('Email is already registered');
      }
      patient.user.email = dto.email;
      await this.usersRepository.save(patient.user);
    }

    if (dto.fullName !== undefined) patient.fullName = dto.fullName;
    if (dto.phoneNumber !== undefined) patient.phoneNumber = dto.phoneNumber;

    await this.patientProfilesRepository.save(patient);
    return this.toPatientResponse(patient);
  }

  async deletePatient(patientId: string) {
    return this.dataSource.transaction(async (manager) => {
      const patient = await manager.findOne(PatientProfile, { where: { id: patientId } });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const user = await manager.findOne(User, { where: { id: patient.userId } as any });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.isActive = false;
      await manager.save(user);
      await manager.softDelete(PatientProfile, { id: patient.id });

      return { deleted: true, patientId };
    });
  }

  private toDoctorResponse(doctor: DoctorProfile) {
    return {
      id: doctor.id,
      userId: doctor.userId,
      email: doctor.user.email,
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      bio: doctor.bio,
      experienceYears: doctor.experienceYears,
      consultationFeeCents: doctor.consultationFeeCents,
      currency: doctor.currency,
      isActive: doctor.user.isActive
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
