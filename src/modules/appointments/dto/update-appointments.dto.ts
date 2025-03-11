import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAppointmentDto {
  @ApiProperty()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
