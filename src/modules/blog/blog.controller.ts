import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Blog } from '@prisma/client';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { CurrentUserId } from 'src/decorator/current-user-id.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { BlogService } from 'src/modules/blog/blog.service';
import { CreateBlogDto } from 'src/modules/blog/dto/create-blog.dto';
import { UpdateBlogDto } from 'src/modules/blog/dto/update-blog.dto';

@ApiBearerAuth()
@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách blog')
  @Get()
  async getAll(@Pagination() filter: PaginationParams) {
    return this.blogService.getAll(filter);
  }

  @ApiCommonResponses('Lấy chi tiết blog')
  @Get(':id')
  async getDetail(@Param('id') id: string): Promise<Blog> {
    return this.blogService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Tạo blog')
  @Post()
  async createBlog(
    @Body() data: CreateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    return this.blogService.create(data, userId);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Cập nhật blog')
  @Put(':id')
  async updateBlog(@Param('id') id: string, @Body() data: UpdateBlogDto) {
    return this.blogService.update(id, data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa blog')
  @Delete(':id')
  async deleteBlog(@Param('id') id: string): Promise<{ message: string }> {
    return this.blogService.delete(id);
  }
}
