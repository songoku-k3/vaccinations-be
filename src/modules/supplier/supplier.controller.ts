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
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { ApiTagController } from 'src/decorator/common.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateSupllierDto } from 'src/modules/supplier/dto/create-supllier.dto';
import { SupplierPaginationResponse } from 'src/modules/supplier/dto/supplier.dto';
import { UpdateSupllierDto } from 'src/modules/supplier/dto/update-supllier.dto';
import { SupplierService } from 'src/modules/supplier/supplier.service';

@ApiTagController('supplier')
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách nhà cung cấp')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<SupplierPaginationResponse> {
    return this.supplierService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết nhà cung cấp')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.supplierService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Tạo nhà cung cấp')
  @Post()
  async createManufactures(@Body() data: CreateSupllierDto) {
    return this.supplierService.create(data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Cập nhật nhà cung cấp')
  @Put(':id')
  async updateManufactures(
    @Param('id') id: string,
    @Body() data: UpdateSupllierDto,
  ) {
    return this.supplierService.update(id, data);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa nhà cung cấp')
  @Delete(':id')
  async deleteManufactures(@Param('id') id: string) {
    return this.supplierService.delete(id);
  }
}
