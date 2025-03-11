import { Controller } from '@nestjs/common';
import { ApiTagController } from 'src/decorator/common.decorator';
import { AppointmentsService } from 'src/modules/appointments/appointments.service';

@ApiTagController('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}
}
