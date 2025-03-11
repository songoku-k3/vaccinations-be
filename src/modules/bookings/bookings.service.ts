import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { BookingPaginationtype } from 'src/modules/bookings/dto/bookings.dto';
import { CreateVaccinationBookingDto } from 'src/modules/bookings/dto/create-booking.dto';
import { PrismaService } from 'src/prisma.service';
import { Cron } from '@nestjs/schedule';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prismaService: PrismaService) {}

  @Cron('0 * * * *')
  async deleteExpiredBookings() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const deletedBookings = await this.prismaService.booking.deleteMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo,
        },
        status: 'PENDING',
      },
    });

    console.log(`Deleted ${deletedBookings.count} expired bookings`);
  }

  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<BookingPaginationtype> {
    const { itemsPerPage, skip, search, page } = pagination;

    const bookings = await this.prismaService.booking.findMany({
      where: {
        vaccinationId: {
          contains: search,
        },
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.booking.count({
      where: {
        vaccinationId: {
          contains: search,
        },
      },
    });
    return {
      data: bookings,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.booking.findFirst({
      where: {
        id,
      },
    });
  }

  async bookVaccination(data: CreateVaccinationBookingDto, userId: string) {
    const { vaccinationId, vaccinationQuantity, appointmentDate } = data;

    const vaccination = await this.prismaService.vaccination.findFirst({
      where: { id: vaccinationId },
    });

    if (!vaccination) {
      throw new Error('Vaccination not found');
    }

    if (vaccination.remainingQuantity < vaccinationQuantity) {
      throw new Error('Not enough vaccination doses available');
    }

    const totalAmount = vaccination.price * vaccinationQuantity;

    return this.prismaService.$transaction(async (prisma) => {
      await prisma.vaccination.update({
        where: { id: vaccinationId },
        data: {
          remainingQuantity:
            vaccination.remainingQuantity - vaccinationQuantity,
        },
      });

      const booking = await prisma.booking.create({
        data: {
          userId,
          vaccinationId,
          totalAmount,
          vaccinationQuantity,
          status: 'PENDING',
          vaccinationPrice: vaccination.price,
          appointmentDate,
          vaccinationDate: vaccination.createdAt,
          confirmationTime: new Date(Date.now() + 3 * 60 * 1000),
        },
      });

      await prisma.appointment.create({
        data: {
          vaccinationId: booking.vaccinationId,
          userId,
          appointmentDate,
          status: AppointmentStatus.PENDING,
        },
      });

      return booking;
    });
  }
}
