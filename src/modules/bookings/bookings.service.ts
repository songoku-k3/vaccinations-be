import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
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
import {
  CreateVaccinationBookingDto,
  CreateBookingByAdminDto,
} from 'src/modules/bookings/dto/create-booking.dto';
import { PrismaService } from 'src/prisma.service';
import { mailService } from '../../lib/mail.service';
import { USER_FIELDS, VACCINE_FIELDS } from 'src/configs/const';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import {
  BookingConfirmationTemplateParams,
  getBookingConfirmationTemplate,
} from 'src/templates/booking-confirmation-template';

@Injectable()
export class BookingsService {
  constructor(private readonly prismaService: PrismaService) {
    // Đảm bảo thư mục QR code tồn tại
    const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }
  }

  @Cron('0 * * * *')
  async deleteExpiredBookings() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const deletedBookings = await this.prismaService.booking.deleteMany({
      where: {
        createdAt: { lt: twentyFourHoursAgo },
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
      where: { vaccinationId: { contains: search } },
      include: {
        user: { select: USER_FIELDS },
        Vaccination: {
          select: { ...VACCINE_FIELDS, supplier: true, manufacturer: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.booking.count({
      where: { vaccinationId: { contains: search } },
    });

    return { data: bookings, total, currentPage: page, itemsPerPage };
  }

  async getById(id: string) {
    return this.prismaService.booking.findFirst({
      where: { id },
      select: {
        user: { select: USER_FIELDS },
        Vaccination: {
          select: { ...VACCINE_FIELDS, supplier: true, manufacturer: true },
        },
      },
    });
  }

  async bookVaccination(data: CreateVaccinationBookingDto, userId: string) {
    const { vaccinationId, vaccinationQuantity = 1, appointmentDate } = data;

    const vaccination = await this.prismaService.vaccination.findFirst({
      where: { id: vaccinationId },
    });

    if (!vaccination) {
      throw new NotFoundException('Không tìm thấy vaccine');
    }

    if (vaccination.remainingQuantity < vaccinationQuantity) {
      throw new BadRequestException('Không đủ liều vaccine');
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
          vaccinationDate: new Date(appointmentDate),
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
        user: { select: USER_FIELDS },
        Vaccination: {
          select: { ...VACCINE_FIELDS, supplier: true, manufacturer: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Không tìm thấy đặt chỗ');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập đặt chỗ này');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Đặt chỗ không ở trạng thái PENDING');
    }

    await this.prismaService.$transaction(async (prisma) => {
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.WAITING_PAYMENT },
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

      const qrCodeData = JSON.stringify({
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
        paymentMethod: 'CASH',
        userId,
      });

      const qrCodeFileName = `booking-qr-${booking.id}.png`;
      const qrCodeFilePath = path.join(
        process.cwd(),
        'public',
        'qrcodes',
        qrCodeFileName,
      );

      await QRCode.toFile(qrCodeFilePath, qrCodeData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return updatedBooking;
    });

    const qrCodeData = JSON.stringify({
      bookingId: booking.id,
      totalAmount: booking.totalAmount,
      paymentMethod: 'CASH',
      userId,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    const formattedTotalAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(booking.totalAmount);

    const formattedCreatedAt = new Date(booking.createdAt).toLocaleString(
      'vi-VN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    );

    const productName = booking.Vaccination?.vaccineName || '';

    const templateParams: BookingConfirmationTemplateParams = {
      userName: booking.user.name,
      bookingId: booking.Vaccination.batchNumber,
      productName,
      vaccinationQuantity: booking.vaccinationQuantity,
      createdAt: formattedCreatedAt,
      totalAmount: formattedTotalAmount,
      paymentMethod: 'Tiền mặt (CASH)',
      qrCode: qrCodeDataUrl,
    };

    const emailHtml = getBookingConfirmationTemplate(templateParams);

    try {
      await mailService.sendMail({
        to: booking.user.email,
        subject: 'Xác nhận đặt vaccine thành công!',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Gửi email xác nhận thất bại:', emailError);
      throw new InternalServerErrorException('Không thể gửi email xác nhận');
    }

    return {
      message:
        'Đặt chỗ đã được xác nhận, mã QR thanh toán đã được tạo, phương thức thanh toán là CASH, và email đã được gửi thành công',
    };
  }

  async deleteBooking(bookingId: string) {
    return this.prismaService.booking.delete({
      where: { id: bookingId },
    });
  }

  async createBookingByAdmin(data: CreateBookingByAdminDto) {
    const {
      vaccinationId,
      vaccinationQuantity = 1,
      appointmentDate,
      userId: userAdmin,
    } = data;

    const vaccination = await this.prismaService.vaccination.findFirst({
      where: { id: vaccinationId },
    });

    if (!vaccination) {
      throw new NotFoundException('Không tìm thấy vaccine');
    }

    const totalAmount = vaccination.price * vaccinationQuantity;

    const booking = await this.prismaService.$transaction(async (prisma) => {
      const booking = await prisma.booking.create({
        data: {
          userId: userAdmin,
          status: BookingStatus.WAITING_PAYMENT,
          vaccinationPrice: vaccination.price,
          vaccinationDate: new Date(appointmentDate),
          vaccinationQuantity,
          appointmentDate,
          vaccinationId,
          totalAmount,
          confirmationTime: new Date(Date.now() + 3 * 60 * 1000),
        },
      });

      await prisma.appointment.create({
        data: {
          userId: userAdmin,
          appointmentDate,
          status: AppointmentStatus.PENDING,
          vaccinationId,
        },
      });

      await prisma.payment.create({
        data: {
          userId: userAdmin,
          bookingId: booking.id,
          paymentMethod: PaymentMethod.CASH,
          status: PaymentStatus.PENDING,
          amount: totalAmount,
        },
      });

      return booking;
    });

    return booking;
  }
}
