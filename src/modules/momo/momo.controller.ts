import { Controller } from '@nestjs/common';
import { ApiTagController } from 'src/decorator/common.decorator';
import { MomoService } from 'src/modules/momo/momo.service';

@ApiTagController('momo')
@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}
}
