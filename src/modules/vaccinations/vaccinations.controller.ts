import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { CurrentUserId } from 'src/decorator/current-user-id.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { CreateVaccinationDto } from 'src/modules/vaccinations/dto/create-vaccinations.dto';
import { UpdateVaccinationDto } from 'src/modules/vaccinations/dto/update-caccinations.dto';
import { VaccinationPaginationResponseType } from 'src/modules/vaccinations/dto/vaccinations.dto';
import { VaccinationsService } from 'src/modules/vaccinations/vaccinations.service';
import { FileUploadService } from 'src/lib/file-upload.service';
@ApiBearerAuth()
@ApiTags('vaccinations')
@Controller('vaccinations')
export class VaccinationsController {
  constructor(
    private readonly vaccinationsService: VaccinationsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

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

  @Put(':id')
  @UseGuards(HandleAuthGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateVaccinationDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.vaccinationsService.update(id, data, image);
  }

  @Post('vaccine-image')
  @UseGuards(HandleAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiCommonResponses('Tải lên ảnh vắc xin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadVaccineImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    const imageUrl = await this.fileUploadService.uploadImageToS3(
      file,
      'vaccinations',
    );
    return { imageUrl };
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa vắc xin')
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    return this.vaccinationsService.delete(id);
  }
}
