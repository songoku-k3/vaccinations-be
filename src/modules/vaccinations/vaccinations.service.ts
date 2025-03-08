import { Injectable, NotFoundException } from '@nestjs/common';
import { Vaccination } from '@prisma/client';
import { numberConstants } from 'src/configs/consts';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { CreateVaccinationDto } from 'src/modules/vaccinations/dto/create-vaccinations.dto';
import { UpdateVaccinationDto } from 'src/modules/vaccinations/dto/update-caccinations.dto';
import { VaccinationPaginationResponseType } from 'src/modules/vaccinations/dto/vaccinations.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VaccinationsService {
  constructor(private readonly prismaService: PrismaService) {}

  private generateBatchNumber(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = numberConstants.FIVE;
    const prefix = 'VAC-';
    const randomPart = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length)),
    ).join('');
    return `${prefix}${randomPart}`;
  }

  async getAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<VaccinationPaginationResponseType> {
    const { itemsPerPage, skip, search, page } = pagination;

    const [vaccinations, total] = await Promise.all([
      this.prismaService.vaccination.findMany({
        where: {
          vaccineName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        skip,
        take: itemsPerPage,
      }),
      this.prismaService.vaccination.count({
        where: {
          vaccineName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data: vaccinations,
      total,
      currentPage: page,
      itemsPerPage,
    };
  }

  async getById(id: string): Promise<Vaccination> {
    const vaccination = await this.prismaService.vaccination.findUnique({
      where: { id },
    });
    if (!vaccination) {
      throw new NotFoundException(`Vaccination with ID ${id} not found`);
    }
    return vaccination;
  }

  async create(
    data: CreateVaccinationDto,
    userId: string,
  ): Promise<Vaccination> {
    try {
      return await this.prismaService.vaccination.create({
        data: {
          ...data,
          userId,
          batchNumber: this.generateBatchNumber(),
          remainingQuantity: numberConstants.ONE,
          user: {
            create: {
              user: {
                connect: { id: userId },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to create vaccination: ${error.message}`);
    }
  }

  async update(id: string, data: UpdateVaccinationDto): Promise<Vaccination> {
    try {
      await this.getById(id);
      return await this.prismaService.vaccination.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to update vaccination: ${error.message}`);
    }
  }

  async delete(id: string): Promise<Vaccination> {
    try {
      await this.getById(id);
      return await this.prismaService.vaccination.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Failed to delete vaccination: ${error.message}`);
    }
  }
}
