import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { DoctorsService } from './doctors.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { ListDoctorsQueryDto } from './dto/list-doctors-query.dto';
import { SlotsService } from '../slots/slots.service';
import { CreateSlotDto } from '../slots/dto/create-slot.dto';
import { UpdateSlotDto } from '../slots/dto/update-slot.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly slotsService: SlotsService
  ) {}

  @Get()
  @Public()
  listDoctors(@Query() query: ListDoctorsQueryDto) {
    return this.doctorsService.listPublicDoctors(query);
  }

  @Get(':id')
  @Public()
  getDoctor(@Param('id') doctorId: string) {
    return this.doctorsService.getPublicDoctor(doctorId);
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  getMe(@Req() request: Request & { user: { sub: string } }) {
    return this.doctorsService.getMyProfile(request.user.sub);
  }

  @Patch('me')
  @Roles(Role.DOCTOR)
  updateProfile(
    @Req() request: Request & { user: { sub: string } },
    @Body() dto: UpdateDoctorProfileDto
  ) {
    return this.doctorsService.updateMyProfile(request.user.sub, dto);
  }

  @Delete('me')
  @Roles(Role.DOCTOR)
  deleteMe(@Req() request: Request & { user: { sub: string } }) {
    return this.doctorsService.deleteMyProfile(request.user.sub);
  }

  @Post('slots')
  @Roles(Role.DOCTOR)
  createSlot(@Req() request: Request & { user: { sub: string } }, @Body() dto: CreateSlotDto) {
    return this.slotsService.createDoctorSlot(request.user.sub, dto);
  }

  @Patch('slots/:id')
  @Roles(Role.DOCTOR)
  updateSlot(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') slotId: string,
    @Body() dto: UpdateSlotDto
  ) {
    return this.slotsService.updateDoctorSlot(request.user.sub, slotId, dto);
  }

  @Delete('slots/:id')
  @Roles(Role.DOCTOR)
  deleteSlot(@Req() request: Request & { user: { sub: string } }, @Param('id') slotId: string) {
    return this.slotsService.deleteDoctorSlot(request.user.sub, slotId);
  }
}
