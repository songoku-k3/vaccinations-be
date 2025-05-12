import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVaccinationBookingDto {
  @ApiProperty()
  @IsString()
  vaccinationId: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  vaccinationQuantity: number = 1;

  @ApiProperty()
  @IsString()
  appointmentDate?: string;
}

export class CreateBookingByAdminDto extends CreateVaccinationBookingDto {
  @ApiProperty()
  @IsString()
  userId: string;
}
