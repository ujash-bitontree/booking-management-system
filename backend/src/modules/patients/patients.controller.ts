import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from './patients.service';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { ListPatientsQueryDto } from './dto/list-patients-query.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { ListDoctorsQueryDto } from '../doctors/dto/list-doctors-query.dto';

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService
  ) {}

  @Get('me')
  @Roles(Role.PATIENT)
  getMe(@Req() request: Request & { user: { sub: string } }) {
    return this.patientsService.getMyProfile(request.user.sub);
  }

  @Patch('me')
  @Roles(Role.PATIENT)
  updateMe(
    @Req() request: Request & { user: { sub: string } },
    @Body() dto: UpdatePatientProfileDto
  ) {
    return this.patientsService.updateMyProfile(request.user.sub, dto);
  }

  @Delete('me')
  @Roles(Role.PATIENT)
  deleteMe(@Req() request: Request & { user: { sub: string } }) {
    return this.patientsService.deleteMyProfile(request.user.sub);
  }

  @Get('me/wallet')
  @Roles(Role.PATIENT)
  getMyWallet(@Req() request: Request & { user: { sub: string } }) {
    return this.patientsService.getWalletBalance(request.user.sub);
  }

  @Get('doctors')
  @Public()
  searchDoctors(@Query() query: ListDoctorsQueryDto) {
    return this.doctorsService.listPublicDoctors(query);
  }

  @Get('appointments')
  @Roles(Role.PATIENT)
  bookingHistory(
    @Req() request: Request & { user: { sub: string } },
    @Query() query: ListPatientsQueryDto
  ) {
    const page = query.page ? parseInt(query.page as any) : 1;
    const limit = query.limit ? parseInt(query.limit as any) : 5;
    return this.patientsService.listBookingHistory(request.user.sub, page, limit);
  }

  @Post('appointments/:id/cancel')
  @Roles(Role.PATIENT)
  cancelAppointment(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') appointmentId: string
  ) {
    return this.patientsService.cancelAppointment(request.user.sub, appointmentId);
  }
}
