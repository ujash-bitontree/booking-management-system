import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@Controller('doctors/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @Roles(Role.DOCTOR)
  create(@Req() request: Request & { user: { sub: string } }, @Body() dto: CreateSlotDto) {
    return this.slotsService.createDoctorSlot(request.user.sub, dto);
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  listMine(@Req() request: Request & { user: { sub: string } }) {
    return this.slotsService.listDoctorSlots(request.user.sub);
  }

  @Patch(':id')
  @Roles(Role.DOCTOR)
  update(
    @Req() request: Request & { user: { sub: string } },
    @Param('id') slotId: string,
    @Body() dto: UpdateSlotDto
  ) {
    return this.slotsService.updateDoctorSlot(request.user.sub, slotId, dto);
  }

  @Delete(':id')
  @Roles(Role.DOCTOR)
  remove(@Req() request: Request & { user: { sub: string } }, @Param('id') slotId: string) {
    return this.slotsService.deleteDoctorSlot(request.user.sub, slotId);
  }

  @Get('public/:doctorId')
  @Public()
  listByDoctor(@Param('doctorId') doctorId: string) {
    return this.slotsService.listPublicDoctorSlots(doctorId);
  }
}
