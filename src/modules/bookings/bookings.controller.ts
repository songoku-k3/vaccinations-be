import { Controller } from '@nestjs/common';
import { ApiTagController } from 'src/decorator/common.decorator';
import { BookingsService } from 'src/modules/bookings/bookings.service';

@ApiTagController('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}
}
