import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  AppointmentStatus,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { BookingPaginationtype } from 'src/modules/bookings/dto/bookings.dto';
import { CreateVaccinationBookingDto } from 'src/modules/bookings/dto/create-booking.dto';
import { PrismaService } from 'src/prisma.service';
import { mailService } from '../../lib/mail.service';
import { USER_FIELDS, VACCINE_FIELDS } from 'src/configs/const';
import {
  BookingConfirmationTemplateParams,
  getBookingConfirmationTemplate,
} from 'src/modules/vaccinations/booking-confirmation-template';

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
      include: {
        user: {
          select: USER_FIELDS,
        },
        Vaccination: {
          select: {
            ...VACCINE_FIELDS,
            supplier: true,
            manufacturer: true,
          },
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
      select: {
        user: {
          select: USER_FIELDS,
        },
        Vaccination: {
          select: {
            ...VACCINE_FIELDS,
            supplier: true,
            manufacturer: true,
          },
        },
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

  async confirmBooking(bookingId: string, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: USER_FIELDS,
        },
        Vaccination: {
          select: {
            ...VACCINE_FIELDS,
            supplier: true,
            manufacturer: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt chỗ');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập đặt chỗ này');
    }

    await this.prismaService.$transaction(async (prisma) => {
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.WAITING_PAYMENT,
        },
        include: {
          user: { select: USER_FIELDS },
          Vaccination: {
            select: { ...VACCINE_FIELDS, supplier: true, manufacturer: true },
          },
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: bookingId,
          userId,
          amount: booking.totalAmount,
          paymentMethod: PaymentMethod.CASH,
          status: PaymentStatus.PENDING,
          appointmentDate: booking.appointmentDate,
        },
      });

      await prisma.appointment.updateMany({
        where: { vaccinationId: booking.vaccinationId, userId },
        data: { status: AppointmentStatus.CONFIRMED },
      });

      return updatedBooking;
    });

    const formattedTotalAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(booking.totalAmount);

    const productName = booking.Vaccination?.vaccineName || '';

    const formattedCreatedAt = new Date(booking.createdAt).toLocaleString(
      'vi-VN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    );

    const templateParams: BookingConfirmationTemplateParams = {
      userName: booking.user.name,
      bookingId: booking.id,
      productName,
      vaccinationQuantity: booking.vaccinationQuantity,
      createdAt: formattedCreatedAt,
      totalAmount: formattedTotalAmount,
      paymentMethod: 'Tiền mặt (CASH)',
    };

    const emailHtml = getBookingConfirmationTemplate(templateParams);

    try {
      await mailService.sendMail({
        to: booking.user.email,
        subject: 'Xác nhận đặt vaccine thành công!',
        html: emailHtml,
      });
    } catch (error) {
      console.error('Gửi email xác nhận thất bại:', error);
      throw new InternalServerErrorException('Không thể gửi email xác nhận');
    }

    return {
      message:
        'Đặt chỗ đã được xác nhận, phương thức thanh toán là CASH, và email đã được gửi thành công',
    };
  }
}
