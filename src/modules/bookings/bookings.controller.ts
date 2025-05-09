import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCommonResponses } from 'src/decorator/api-common-responses.decorator';
import { CommonPagination } from 'src/decorator/common-pagination.decorator';
import { ApiTagController } from 'src/decorator/common.decorator';
import { CurrentUserId } from 'src/decorator/current-user-id.decorator';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { HandleAuthGuard } from 'src/modules/auth/guard/auth.guard';
import { BookingsService } from 'src/modules/bookings/bookings.service';
import {
  BookingPaginationtype,
  ConfirmBookingDto,
} from 'src/modules/bookings/dto/bookings.dto';
import {
  CreateBookingByAdminDto,
  CreateVaccinationBookingDto,
} from 'src/modules/bookings/dto/create-booking.dto';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';

@ApiTagController('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @CommonPagination()
  @ApiCommonResponses('Lấy danh sách booking')
  @Get()
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<BookingPaginationtype> {
    return this.bookingsService.getAll(pagination);
  }

  @ApiCommonResponses('Lấy chi tiết booking')
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.bookingsService.getById(id);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Đặt lịch tiêm chủng')
  @Post('/vacination')
  async createBooking(
    @Body() createBookingDto: CreateVaccinationBookingDto,
    @CurrentUserId() userId: string,
  ) {
    return this.bookingsService.bookVaccination(createBookingDto, userId);
  }

  @UseGuards(HandleAuthGuard)
  @ApiCommonResponses('Đặt lịch trả tiền mặt')
  @Post('confirm')
  async confirmBooking(
    @Body() body: ConfirmBookingDto,
    @CurrentUserId() userId: string,
  ) {
    return this.bookingsService.confirmBooking(body.bookingId, userId);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCommonResponses('Xóa booking')
  @Delete(':id')
  async deleteBooking(@Param('id') id: string) {
    return this.bookingsService.deleteBooking(id);
  }

  @UseGuards(HandleAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiCommonResponses('Tạo booking')
  @Post('admin')
  async createBookingByAdmin(@Body() body: CreateBookingByAdminDto) {
    return this.bookingsService.createBookingByAdmin(body);
  }
}
