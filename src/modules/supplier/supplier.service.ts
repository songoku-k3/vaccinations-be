import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { CreateSupllierDto } from 'src/modules/supplier/dto/create-supllier.dto';
import { SupplierPaginationResponse } from 'src/modules/supplier/dto/supplier.dto';
import { UpdateSupllierDto } from 'src/modules/supplier/dto/update-supllier.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SupplierService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<SupplierPaginationResponse> {
    const { itemsPerPage, skip, search, page } = pagination;

    const suppliers = await this.prismaService.supplier.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      orderBy: {
        name: 'desc',
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.supplier.count({
      where: {
        name: {
          contains: search,
        },
      },
    });
    return {
      data: suppliers,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.supplier.findFirst({
      where: {
        id,
      },
    });
  }

  async create(data: CreateSupllierDto) {
    return this.prismaService.supplier.create({
      data,
    });
  }

  async update(id: string, data: UpdateSupllierDto) {
    return this.prismaService.supplier.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return this.prismaService.supplier.delete({
      where: {
        id,
      },
    });
  }
}
