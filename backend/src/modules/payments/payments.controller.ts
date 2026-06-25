import { Body, Controller, Post, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout-session')
  @Roles(Role.PATIENT)
  createCheckoutSession(
    @Req() request: Request & { user: { sub: string } },
    @Body() dto: CreateCheckoutSessionDto
  ) {
    return this.paymentsService.createCheckoutSession(request.user.sub, dto.appointmentId);
  }
}
