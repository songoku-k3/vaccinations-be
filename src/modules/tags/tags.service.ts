import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { CreateTagDto } from 'src/modules/tags/dto/create-tag.dto';
import { TagPaginationResponseType } from 'src/modules/tags/dto/tag.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<TagPaginationResponseType> {
    const { itemsPerPage, skip, search, page } = pagination;

    const tags = await this.prismaService.tag.findMany({
      where: {
        name: {
          contains: search,
        },
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.tag.count({
      where: {
        name: {
          contains: search,
        },
      },
    });

    return {
      data: tags,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.tag.findFirst({
      where: {
        id,
      },
    });
  }

  async createTag(data: CreateTagDto) {
    return this.prismaService.tag.create({
      data,
    });
  }

  async updateTag(id: string, data: CreateTagDto) {
    return this.prismaService.tag.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteTag(id: string): Promise<{ message: string }> {
    await this.prismaService.tag.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Xóa tag thành công',
    };
  }
}
