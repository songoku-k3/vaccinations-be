import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppointmentStatus, BookingStatus } from '@prisma/client';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { BookingPaginationtype } from 'src/modules/bookings/dto/bookings.dto';
import { CreateVaccinationBookingDto } from 'src/modules/bookings/dto/create-booking.dto';
import { PrismaService } from 'src/prisma.service';
import { mailService } from '../../lib/mail.service';

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

  async confirmBooking(bookingId: string, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        Vaccination: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    await this.prismaService.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.WAITING_PAYMENT,
      },
    });

    const formattedTotalAmount = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(booking.totalAmount);

    let productName = '';

    const totalProducts = booking.vaccinationQuantity;

    if (booking.Vaccination) productName = booking.Vaccination.vaccineName;

    await mailService.sendMail({
      to: booking.user.email,
      subject: 'Xác nhận đặt chỗ thành công!',
      html: `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; }
        a { text-decoration: none; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(90deg, #007bff, #0056b3); padding: 30px; text-align: center; }
        .header img { max-width: 150px; height: auto; }
        .content { padding: 30px 20px; }
        .content h2 { color: #1a2a44; font-size: 24px; margin: 0 0 10px; }
        .content p { color: #555; font-size: 16px; line-height: 1.6; margin: 10px 0; }
        .order-details { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details h3 { color: #1a2a44; font-size: 18px; margin: 0 0 15px; }
        .order-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .order-table td { padding: 12px 0; border-bottom: 1px solid #eee; color: #555; }
        .order-table td.label { font-weight: bold; width: 40%; }
        .order-table td.value { color: #1a2a44; }
        .order-table tr:last-child td { border-bottom: none; }
        .total { color: #e74c3c; font-weight: bold; font-size: 16px; }
        .cta-button { text-align: center; margin: 20px 0; }
        .cta-button a { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; font-size: 16px; font-weight: bold; border-radius: 25px; }
        .cta-button a:hover { background-color: #0056b3; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777; }
        .footer a { color: #007bff; }
        @media only screen and (max-width: 600px) {
          .container { margin: 10px; }
          .header { padding: 20px; }
          .content { padding: 20px; }
          .order-table td { display: block; width: 100%; }
          .order-table td.label { font-weight: normal; margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://ecopharma.com.vn/wp-content/uploads/2024/02/vac-xin-hpv-dung-phong-ngua-vi-rut-u-nhu.jpg" alt="Company Logo">
        </div>
        <div class="content">
          <h2>Xin chào, ${booking.user.name}</h2>
          <p>Cảm ơn bạn đã đặt chỗ trên hệ thống của chúng tôi! Dưới đây là thông tin chi tiết về đơn đặt hàng của bạn:</p>
          <div class="order-details">
            <h3>Thông tin đơn hàng</h3>
            <table class="order-table">
              <tr>
                <td class="label">Mã đơn hàng:</td>
                <td class="value">${booking.id}</td>
              </tr>
              <tr>
                <td class="label">Tên vaccine:</td>
                <td class="value">${productName}</td>
              </tr>
              <tr>
                <td class="label">Số lượng vaccine:</td>
                <td class="value">${totalProducts}</td>
              </tr>
              <tr>
                <td class="label">Ngày đặt:</td>
                <td class="value">${new Date(booking.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              </tr>
              <tr>
                <td class="label">Tổng số tiền:</td>
                <td class="value total">${formattedTotalAmount}</td>
              </tr>
            </table>
          </div>
          <div class="cta-button">
            <a href="https://t.vercel.app/orders/${booking.id}" target="_blank">Xem chi tiết đơn hàng</a>
          </div>
          <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại bên dưới.</p>
          <p>Chúc bạn có một trải nghiệm tuyệt vời!</p>
        </div>
        <div class="footer">
          <p>Đội ngũ Hỗ trợ Khách hàng</p>
          <p><a href="https://t.vercel.app">t.vercel.app</a></p>
          <p>Email: <a href="mailto:support@example.com">support@example.com</a> | Hotline: <a href="tel:123456789">123-456-789</a></p>
        </div>
      </div>
    </body>
  </html>
`,
    });

    return { message: 'Booking confirmed and email sent successfully' };
  }
}
