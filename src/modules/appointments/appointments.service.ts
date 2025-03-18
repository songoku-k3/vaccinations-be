import { Injectable } from '@nestjs/common';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import {
  AppointmentPaginationtype,
  DailyAppointmentsResponse,
} from 'src/modules/appointments/dto/appointments.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateAppointmentDto } from './dto/update-appointments.dto';
import { getUTCDayRange } from 'src/utils/date-utils';

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
    return this.prismaService.$transaction(async (prisma) => {
      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...data,
          userId,
        },
        include: {
          vaccination: true,
        },
      });

      if (updatedAppointment.status === 'COMPLETED') {
        await prisma.vaccinationRecord.create({
          data: {
            userId: updatedAppointment.userId,
            vaccinationId: updatedAppointment.vaccinationId,
            doseNumber: 1,
            vaccinationDate: updatedAppointment.appointmentDate,
            location: updatedAppointment.vaccination?.location || 'Unknown',
            provider:
              updatedAppointment.vaccination?.manufacturerId || 'Unknown',
            certificate: `CERT-${updatedAppointment.id}-${Date.now()}`,
            createdAt: new Date(),
          },
        });
      }

      return updatedAppointment;
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

  async getTodayAppointments(
    search?: string,
  ): Promise<DailyAppointmentsResponse> {
    const today = new Date();
    const { startOfDay, endOfDay } = getUTCDayRange(today);

    const appointments = await this.prismaService.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(search && {
          vaccination: {
            vaccineName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vaccination: {
          select: {
            id: true,
            vaccineName: true,
            location: true,
            manufacturerId: true,
            price: true,
            expirationDate: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    const formattedDate = startOfDay.toISOString().split('T')[0];

    return {
      data: {
        date: formattedDate,
        total: appointments.length,
        appointments,
      },
    };
  }
}
