import { Injectable } from '@nestjs/common';
import { Blog } from '@prisma/client';
import { USER_FIELDS } from 'src/configs/const';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { BlogPaginationResponseType } from 'src/modules/blog/dto/blog.dto';
import { CreateBlogDto } from 'src/modules/blog/dto/create-blog.dto';
import { UpdateBlogDto } from 'src/modules/blog/dto/update-blog.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BlogService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<BlogPaginationResponseType> {
    const { itemsPerPage, skip, search, page } = pagination;

    const blogs = await this.prismaService.blog.findMany({
      where: {
        title: {
          contains: search,
        },
      },
      include: {
        user: {
          select: USER_FIELDS,
        },
        tag: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.blog.count({
      where: {
        title: {
          contains: search,
        },
      },
    });

    return {
      data: blogs,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string): Promise<Blog> {
    const blog = await this.prismaService.blog.findFirst({
      where: {
        id,
      },
      include: {
        user: {
          select: USER_FIELDS,
        },
        tag: true,
      },
    });

    return blog;
  }

  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {
    const { title, content, tagId } = createBlogDto;

    const blog = await this.prismaService.blog.create({
      data: {
        title,
        content,
        user: {
          connect: { id: userId },
        },
        tag: tagId
          ? {
              connect: { id: tagId },
            }
          : undefined,
      },
      include: {
        user: {
          select: USER_FIELDS,
        },
        tag: true,
      },
    });

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const { title, content, tagId } = updateBlogDto;

    const blog = await this.prismaService.blog.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        tag: tagId
          ? {
              connect: { id: tagId },
            }
          : undefined,
      },
      include: {
        user: {
          select: USER_FIELDS,
        },
        tag: true,
      },
    });

    return blog;
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.prismaService.blog.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Xóa blog thành công',
    };
  }
}
