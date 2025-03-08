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
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateManufacturesDto } from 'src/modules/manufacturers/dto/create-manufactures.dto';
import { ManufacturerPaginationResponse } from 'src/modules/manufacturers/dto/manufactures.dto';
import { UpdateManufacturesDto } from 'src/modules/manufacturers/dto/update-manufactures.dto';
import { ManufacturersService } from 'src/modules/manufacturers/manufacturers.service';

@ApiBearerAuth()
@ApiTags('manufacturers')
@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufactureesService: ManufacturersService) {}

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách nhà sản xuất')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<ManufacturerPaginationResponse> {
    return this.manufactureesService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết nhà sản xuất')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.manufactureesService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Tạo nhà sản xuất')
  @Post()
  async createManufactures(@Body() data: CreateManufacturesDto) {
    return this.manufactureesService.create(data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Cập nhật nhà sản xuất')
  @Put(':id')
  async updateManufactures(
    @Param('id') id: string,
    @Body() data: UpdateManufacturesDto,
  ) {
    return this.manufactureesService.update(id, data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa nhà sản xuất')
  @Delete(':id')
  async deleteManufactures(@Param('id') id: string) {
    return this.manufactureesService.delete(id);
  }
}
