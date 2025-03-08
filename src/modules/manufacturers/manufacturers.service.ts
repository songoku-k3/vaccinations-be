import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { CreateManufacturesDto } from 'src/modules/manufacturers/dto/create-manufactures.dto';
import { ManufacturerPaginationResponse } from 'src/modules/manufacturers/dto/manufactures.dto';
import { UpdateManufacturesDto } from 'src/modules/manufacturers/dto/update-manufactures.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ManufacturersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<ManufacturerPaginationResponse> {
    const { itemsPerPage, skip, search, page } = pagination;

    const manufacrures = await this.prismaService.manufacturer.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.manufacturer.count({
      where: {
        name: {
          contains: search,
        },
      },
    });
    return {
      data: manufacrures,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.manufacturer.findFirst({
      where: {
        id,
      },
    });
  }

  async create(data: CreateManufacturesDto) {
    return this.prismaService.manufacturer.create({
      data,
    });
  }

  async update(id: string, data: UpdateManufacturesDto) {
    return this.prismaService.manufacturer.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return this.prismaService.manufacturer.delete({
      where: {
        id,
      },
    });
  }
}
