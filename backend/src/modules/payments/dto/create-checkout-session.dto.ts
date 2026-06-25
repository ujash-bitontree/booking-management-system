import { IsString, IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsString()
  appointmentId!: string;
}
