import { Injectable } from '@nestjs/common';
import { numberConstants } from 'src/configs/consts';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTotalInventory() {
    try {
      const inventoryData = await this.prismaService.vaccination.groupBy({
        by: ['id', 'vaccineName'],
        _sum: {
          remainingQuantity: true,
        },
      });

      return {
        data: inventoryData.map((item) => ({
          vaccinationId: item.id,
          nameVaccine: item.vaccineName,
          totalQuantity: item._sum?.remainingQuantity ?? numberConstants.ZERO,
        })),
      };
    } catch (error) {
      console.error('Error fetching total inventory:', error);
      throw error;
    }
  }
}
