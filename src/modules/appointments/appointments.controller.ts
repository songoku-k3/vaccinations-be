import { Controller } from '@nestjs/common';
import { AppointmentsService } from 'src/modules/appointments/appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}
}
