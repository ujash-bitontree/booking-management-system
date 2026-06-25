import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminService } from './admin.service';
import { CreateDoctorAdminDto } from './dto/create-doctor-admin.dto';
import { UpdateDoctorAdminDto } from './dto/update-doctor-admin.dto';
import { CreatePatientAdminDto } from './dto/create-patient-admin.dto';
import { UpdatePatientAdminDto } from './dto/update-patient-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @Roles(Role.ADMIN)
  stats() {
    return this.adminService.dashboardStats();
  }

  @Get('doctors')
  @Roles(Role.ADMIN)
  listDoctors() {
    return this.adminService.listDoctors();
  }

  @Post('doctors')
  @Roles(Role.ADMIN)
  createDoctor(@Body() dto: CreateDoctorAdminDto) {
    return this.adminService.createDoctor(dto);
  }

  @Patch('doctors/:id')
  @Roles(Role.ADMIN)
  updateDoctor(@Param('id') doctorId: string, @Body() dto: UpdateDoctorAdminDto) {
    return this.adminService.updateDoctor(doctorId, dto);
  }

  @Delete('doctors/:id')
  @Roles(Role.ADMIN)
  deleteDoctor(@Param('id') doctorId: string) {
    return this.adminService.deleteDoctor(doctorId);
  }

  @Get('patients')
  @Roles(Role.ADMIN)
  listPatients() {
    return this.adminService.listPatients();
  }

  @Post('patients')
  @Roles(Role.ADMIN)
  createPatient(@Body() dto: CreatePatientAdminDto) {
    return this.adminService.createPatient(dto);
  }

  @Patch('patients/:id')
  @Roles(Role.ADMIN)
  updatePatient(@Param('id') patientId: string, @Body() dto: UpdatePatientAdminDto) {
    return this.adminService.updatePatient(patientId, dto);
  }

  @Delete('patients/:id')
  @Roles(Role.ADMIN)
  deletePatient(@Param('id') patientId: string) {
    return this.adminService.deletePatient(patientId);
  }
}
