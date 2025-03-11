import { Controller } from '@nestjs/common';
import { ApiTagController } from 'src/decorator/common.decorator';
import { InventoryService } from 'src/modules/inventory/inventory.service';

@ApiTagController('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
}
