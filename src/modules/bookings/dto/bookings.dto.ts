import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';
import { PaginationResponse } from 'src/types/PaginationResponse';

export type BookingPaginationtype = PaginationResponse<Booking>;

export class ConfirmBookingDto {
  @ApiProperty()
  @IsNotEmpty()
  bookingId: string;
}
