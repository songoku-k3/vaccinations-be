import { Controller, Get } from '@nestjs/common';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { ApiTagController } from 'src/decorator/common.decorator';
import { InventoryService } from 'src/modules/inventory/inventory.service';

@ApiTagController('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiCommonResponses('Lấy tổng số lượng từng loại vaccine')
  @Get('/total')
  async getTotalInventory() {
    return this.inventoryService.getTotalInventory();
  }
}
