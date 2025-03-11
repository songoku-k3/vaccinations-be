import { Controller } from '@nestjs/common';
import { InventoryService } from 'src/modules/inventory/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
}
