import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Vaccination, Prisma } from '@prisma/client';
import { numberConstants } from 'src/configs/consts';
import {
  Pagination,
  PaginationParams,
} from 'src/decorator/pagination.decorator';
import { FileUploadService } from 'src/lib/file-upload.service';
import { CreateVaccinationDto } from 'src/modules/vaccinations/dto/create-vaccinations.dto';
import { UpdateVaccinationDto } from 'src/modules/vaccinations/dto/update-caccinations.dto';
import { VaccinationPaginationResponseType } from 'src/modules/vaccinations/dto/vaccinations.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VaccinationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService,
  ) {}

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
        include: {
          CategoryVaccination: true,
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
    imageFile?: Express.Multer.File,
  ): Promise<Vaccination> {
    try {
      let imageUrl = data.image;

      if (imageFile) {
        imageUrl = await this.fileUploadService.uploadImageToS3(
          imageFile,
          'vaccinations',
        );
      }

      return await this.prismaService.vaccination.create({
        data: {
          ...data,
          userId,
          image: imageUrl,
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Vaccine name already exists');
        }
      }
      throw new Error(`Failed to create vaccination: ${error.message}`);
    }
  }

  async update(
    id: string,
    data: UpdateVaccinationDto,
    imageFile?: Express.Multer.File,
  ): Promise<Vaccination> {
    try {
      await this.getById(id);

      let imageUrl = data.image;

      if (imageFile) {
        imageUrl = await this.fileUploadService.uploadImageToS3(
          imageFile,
          'vaccinations',
        );
      }

      return await this.prismaService.vaccination.update({
        where: { id },
        data: {
          ...data,
          image: imageUrl,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Vaccine name already exists');
        }
      }
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
