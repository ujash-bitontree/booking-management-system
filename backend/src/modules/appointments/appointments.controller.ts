import { Body, Controller, Post, Req } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(Role.PATIENT)
  createPending(@Req() request: Request & { user: { sub: string } }, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createPendingAppointment(request.user.sub, dto);
  }
}
