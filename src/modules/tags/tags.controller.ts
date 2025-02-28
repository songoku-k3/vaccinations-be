import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { CreateTagDto } from 'src/modules/tags/dto/create-tag.dto';
import { TagPaginationResponseType } from 'src/modules/tags/dto/tag.dto';
import { UpdateTagDto } from 'src/modules/tags/dto/update-tag.dto';
import { TagsService } from 'src/modules/tags/tags.service';

@ApiBearerAuth()
@ApiTags('tag')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagsService) {}

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách tag')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<TagPaginationResponseType> {
    return this.tagService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết tag')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.tagService.getById(id);
  }

  @ApiCommonResponses('Tạo tag')
  @Post()
  async createTag(@Body() data: CreateTagDto) {
    return this.tagService.createTag(data);
  }

  @ApiCommonResponses('Cập nhật tag')
  @Put(':id')
  async updateTag(@Param('id') id: string, @Body() data: UpdateTagDto) {
    return this.tagService.updateTag(id, data);
  }

  @ApiCommonResponses('Xóa tag')
  @Delete(':id')
  async deleteTag(@Param('id') id: string): Promise<{ message: string }> {
    return this.tagService.deleteTag(id);
  }
}
