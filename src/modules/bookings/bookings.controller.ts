import { Controller } from '@nestjs/common';
import { BookingsService } from 'src/modules/bookings/bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
}
