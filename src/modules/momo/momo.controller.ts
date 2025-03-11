import { Controller } from '@nestjs/common';
import { MomoService } from 'src/modules/momo/momo.service';

@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}
}
