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
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { CurrentUserId } from 'src/decorator/current-user-id.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateVaccinationDto } from 'src/modules/vaccinations/dto/create-vaccinations.dto';
import { UpdateVaccinationDto } from 'src/modules/vaccinations/dto/update-caccinations.dto';
import { VaccinationPaginationResponseType } from 'src/modules/vaccinations/dto/vaccinations.dto';
import { VaccinationsService } from 'src/modules/vaccinations/vaccinations.service';
@ApiBearerAuth()
@ApiTags('vaccinations')
@Controller('vaccinations')
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách vắc xin')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<VaccinationPaginationResponseType> {
    return this.vaccinationsService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết vắc xin')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.vaccinationsService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Tạo vắc xin')
  @Post()
  async createBlog(
    @Body() data: CreateVaccinationDto,
    @CurrentUserId() userId: string,
  ) {
    return this.vaccinationsService.create(data, userId);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Cập nhật vắc xin')
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() data: UpdateVaccinationDto,
  ) {
    return this.vaccinationsService.update(id, data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa vắc xin')
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return this.vaccinationsService.delete(id);
  }
}
