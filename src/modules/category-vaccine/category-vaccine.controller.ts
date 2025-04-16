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
import { CategoryVaccineService } from './category-vaccine.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { Pagination } from 'src/decorator/pagination.decorator';
import { PaginationParams } from 'src/decorator/pagination.decorator';
import { CategoryVaccinationPaginationResponse } from 'src/modules/category-vaccine/dto/categoy-vaccine.dto';
import {
  CreateCategoryVaccineDto,
  UpdateCategoryVaccineDto,
} from 'src/modules/category-vaccine/dto/categoy-vaccine.request.dto';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';

@ApiBearerAuth()
@ApiTags('category-vaccine')
@Controller('category-vaccine')
export class CategoryVaccineController {
  constructor(
    private readonly categoryVaccineService: CategoryVaccineService,
  ) {}
  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách loại vắc xin')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<CategoryVaccinationPaginationResponse> {
    return this.categoryVaccineService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết loại vắc xin')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.categoryVaccineService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Tạo loại vắc xin')
  @Post()
  async createCategoryVaccine(@Body() data: CreateCategoryVaccineDto) {
    return this.categoryVaccineService.create(data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Cập nhật loại vắc xin')
  @Put(':id')
  async updateCategoryVaccine(
    @Param('id') id: string,
    @Body() data: UpdateCategoryVaccineDto,
  ) {
    return this.categoryVaccineService.update(id, data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa loại vắc xin')
  @Delete(':id')
  async deleteCategoryVaccine(@Param('id') id: string) {
    return this.categoryVaccineService.delete(id);
  }
}
