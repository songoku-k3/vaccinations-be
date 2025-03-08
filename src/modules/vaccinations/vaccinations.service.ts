import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { VaccinationPaginationResponseType } from 'src/modules/vaccinations/dto/vaccinations.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VaccinationsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<VaccinationPaginationResponseType> {
    const { itemsPerPage, skip, search, page } = pagination;

    const vaccinations = await this.prismaService.vaccination.findMany({
      where: {
        vaccineName: {
          contains: search,
        },
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.vaccination.count({
      where: {
        vaccineName: {
          contains: search,
        },
      },
    });

    return {
      data: vaccinations,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.vaccination.findFirst({
      where: {
        id,
      },
    });
  }
}
