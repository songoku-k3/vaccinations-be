import { Injectable } from '@nestjs/common';
import { PaginationParams } from 'src/decorator/pagination.decorator';
import { Pagination } from 'src/decorator/pagination.decorator';
import { CategoryVaccinationPaginationResponse } from 'src/modules/category-vaccine/dto/categoy-vaccine.dto';
import { CreateCategoryVaccineDto } from 'src/modules/category-vaccine/dto/categoy-vaccine.request.dto';
import { UpdateCategoryVaccineDto } from 'src/modules/category-vaccine/dto/categoy-vaccine.request.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CategoryVaccineService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<CategoryVaccinationPaginationResponse> {
    const { itemsPerPage, skip, search, page } = pagination;

    const categoryVaccines =
      await this.prismaService.categoryVaccination.findMany({
        where: {
          name: {
            contains: search,
          },
        },
        skip,
        take: itemsPerPage,
      });

    const total = await this.prismaService.categoryVaccination.count({
      where: {
        name: {
          contains: search,
        },
      },
    });
    return {
      data: categoryVaccines,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.categoryVaccination.findFirst({
      where: {
        id,
      },
      include: {
        vaccines: true,
      },
    });
  }

  async create(data: CreateCategoryVaccineDto) {
    return this.prismaService.categoryVaccination.create({
      data,
    });
  }

  async update(id: string, data: UpdateCategoryVaccineDto) {
    return this.prismaService.categoryVaccination.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return this.prismaService.categoryVaccination.delete({
      where: {
        id,
      },
    });
  }
}
