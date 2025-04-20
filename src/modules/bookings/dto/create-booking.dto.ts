import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateVaccinationBookingDto {
  @ApiProperty()
  @IsString()
  vaccinationId: string;

  @ApiProperty()
  @IsNumber()
  vaccinationQuantity?: number;

  @ApiProperty()
  @IsString()
  appointmentDate?: string;
}

export class CreateBookingByAdminDto extends CreateVaccinationBookingDto {
  @ApiProperty()
  @IsString()
  userId: string;
}
