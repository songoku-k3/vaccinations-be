import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
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
}
