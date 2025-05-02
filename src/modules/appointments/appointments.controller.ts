import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { ApiTagController } from 'src/decorator/common.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { AppointmentsService } from 'src/modules/appointments/appointments.service';
import {
  AppointmentPaginationtype,
  DailyAppointmentsResponse,
} from 'src/modules/appointments/dto/appointments.dto';
import { UpdateAppointmentDto } from 'src/modules/appointments/dto/update-appointments.dto';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';

@ApiTagController('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @ApiCommonResponses('Lấy danh sách lịch hẹn hôm nay')
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @Get('daily')
  async getTodayAppointments(
    @Query('search') search?: string,
  ): Promise<DailyAppointmentsResponse> {
    return this.appointmentsService.getTodayAppointments(search);
  }

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách lịch hẹn')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<AppointmentPaginationtype> {
    return this.appointmentsService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết lịch hẹn')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.appointmentsService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Cập nhật lịch hẹn')
  @Put(':id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.UpdateAppointment(id, updateAppointmentDto);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Xóa lịch hẹn')
  @Delete(':id')
  async deleteAppointment(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    return this.appointmentsService.deleteAppointment(id);
  }
}
