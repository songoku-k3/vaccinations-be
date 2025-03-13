import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import {
  MomoDto,
  MomoIpnDto,
  PaymentPaginationResponse,
} from 'src/modules/momo/dto/momo';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MomoService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly YOUR_SECRET_KEY = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  private readonly PARTNER_CODE = 'MOMO';
  private readonly ACCESS_KEY = 'F8BBA842ECF85';
  private readonly REDIRECT_URL = 'http://localhost:4040';
  private readonly IPN_URL =
    'https://ceaa-103-156-46-86.ngrok-free.app/api/momo/ipn';

  async createPayment(data: MomoDto, userId: string) {
    const booking = await this.prismaService.booking.findUnique({
      where: { id: data.bookingId },
      select: { totalAmount: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const { totalAmount } = booking;

    const orderId = `${this.PARTNER_CODE}_${data.bookingId}_${Date.now()}`;
    const requestId = orderId;
    const extraData = '';

    const signature = this.generateSignatureForPayment(
      totalAmount,
      orderId,
      requestId,
      extraData,
    );

    const requestBody = {
      partnerCode: this.PARTNER_CODE,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: totalAmount,
      orderId,
      orderInfo: 'pay with MoMo',
      redirectUrl: this.REDIRECT_URL,
      ipnUrl: this.IPN_URL,
      lang: 'vi',
      requestType: 'payWithMethod',
      autoCapture: true,
      extraData,
      orderGroupId: '',
      signature,
    };

    try {
      const { data: response } = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
      );
      const paymentUrl = response.payUrl;

      await this.prismaService.payment.create({
        data: {
          bookingId: data.bookingId,
          userId,
          amount: totalAmount,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PaymentStatus.PENDING,
          orderId,
        },
      });

      return {
        partnerCode: this.PARTNER_CODE,
        orderId,
        totalAmount,
        requestId,
        paymentUrl,
      };
    } catch (error) {
      console.error(
        'Error creating payment:',
        error.response?.data || error.message,
      );
      throw new Error('Payment creation failed');
    }
  }

  async checkPaymentStatus(orderId: string, requestId: string) {
    const signature = this.generateSignatureForStatus(orderId, requestId);

    const requestBody = {
      partnerCode: this.PARTNER_CODE,
      accessKey: this.ACCESS_KEY,
      orderId,
      requestId,
      signature,
    };

    try {
      const { data: response } = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody,
      );
      const paymentStatus = response?.status;

      if (paymentStatus === 'COMPLETED') {
        await this.prismaService.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.COMPLETED },
        });
      }

      return response;
    } catch (error) {
      console.error(
        'Error checking payment status:',
        error.response?.data || error.message,
      );
      throw new Error('Error checking payment status');
    }
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus) {
    const payment = await this.prismaService.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    const updatedPayment = await this.prismaService.payment.update({
      where: { orderId },
      data: { status },
    });

    if (status === PaymentStatus.COMPLETED) {
      const bookingId = payment.bookingId;

      await this.prismaService.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmationTime: new Date(),
        },
      });
    }

    return updatedPayment;
  }

  private generateSignatureForPayment(
    amount: number,
    orderId: string,
    requestId: string,
    extraData: string,
  ): string {
    const rawSignature = `accessKey=${this.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.IPN_URL}&orderId=${orderId}&orderInfo=pay with MoMo&partnerCode=${this.PARTNER_CODE}&redirectUrl=${this.REDIRECT_URL}&requestId=${requestId}&requestType=payWithMethod`;
    return this.createSignature(rawSignature);
  }

  private generateSignatureForStatus(
    orderId: string,
    requestId: string,
  ): string {
    const rawSignature = `accessKey=${this.ACCESS_KEY}&orderId=${orderId}&partnerCode=${this.PARTNER_CODE}&requestId=${requestId}`;
    return this.createSignature(rawSignature);
  }

  async handleIpn(ipnData: MomoIpnDto): Promise<void> {
    if (ipnData.resultCode === 0) {
      console.log('Payment successful:', ipnData);

      // Lấy thông tin thanh toán
      const payment = await this.prismaService.payment.findUnique({
        where: { orderId: ipnData.orderId },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Cập nhật trạng thái thanh toán thành COMPLETED
      await this.updatePaymentStatus(ipnData.orderId, PaymentStatus.COMPLETED);

      console.log(
        'Payment status updated to COMPLETED for orderId:',
        ipnData.orderId,
      );
    } else {
      console.error(
        `Payment failed with resultCode ${ipnData.resultCode}:`,
        ipnData.message,
      );
    }
  }

  private createSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.YOUR_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');
  }

  async getPaymentAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<PaymentPaginationResponse> {
    const { itemsPerPage, skip, search, page } = pagination;
    const payments = await this.prismaService.payment.findMany({
      take: itemsPerPage,
      skip,
      where: {
        OR: [
          {
            booking: {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            bookingId: null,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    const total = await this.prismaService.payment.count({
      where: {
        OR: [
          {
            booking: {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            bookingId: null,
          },
        ],
      },
    });
    return {
      data: payments,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getPaymentById(paymentId: string) {
    return this.prismaService.payment.findUnique({
      where: { id: paymentId },
    });
  }

  async getPaymentUser(userId: string) {
    const [payments, total] = await Promise.all([
      this.prismaService.payment.findMany({
        where: {
          userId,
          status: PaymentStatus.COMPLETED,
        },
        include: {
          booking: {
            select: {
              id: true,
              Vaccination: true,
              totalAmount: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.payment.count({
        where: {
          userId,
          status: PaymentStatus.COMPLETED,
        },
      }),
    ]);

    const responseData = payments
      .filter((payment) => payment.booking)
      .map((payment) => ({
        paymentId: payment.id,
        bookingId: payment.booking.id,
        totalAmount: payment.booking.totalAmount,
        createdAt: payment.booking.createdAt,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
      }));

    return { data: responseData, total };
  }

  async getCountPaymentDone(): Promise<{ data: { total: number } }> {
    const total = await this.prismaService.payment.count({
      where: { status: PaymentStatus.COMPLETED },
    });
    return { data: { total } };
  }
}
