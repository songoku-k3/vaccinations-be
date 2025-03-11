import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { AppointmentPaginationtype } from 'src/modules/appointments/dto/appointments.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateAppointmentDto } from './dto/update-appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<AppointmentPaginationtype> {
    const { itemsPerPage, skip, search, page } = pagination;

    const appointments = await this.prismaService.appointment.findMany({
      where: {
        vaccinationId: {
          contains: search,
        },
      },
      skip,
      take: itemsPerPage,
    });

    const total = await this.prismaService.appointment.count({
      where: {
        vaccinationId: {
          contains: search,
        },
      },
    });
    return {
      data: appointments,
      total,
      currentPage: page,
      itemsPerPage: itemsPerPage,
    };
  }

  async getById(id: string) {
    return this.prismaService.appointment.findFirst({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            address: true,
            avatar: true,
            name: true,
            date_of_birth: true,
            country: true,
            createAt: true,
            updateAt: true,
            verificationCode: true,
            verificationCodeExpiresAt: true,
            isVerified: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        vaccination: true,
      },
    });
  }

  async UpdateAppointment(
    id: string,
    data: UpdateAppointmentDto,
    userId: string,
  ) {
    return this.prismaService.appointment.update({
      where: {
        id,
      },
      data: {
        ...data,
        userId,
      },
    });
  }

  async deleteAppointment(id: string): Promise<{ message: string }> {
    await this.prismaService.appointment.delete({
      where: {
        id,
      },
    });
    return {
      message: 'Delete appointment successfully',
    };
  }
}
