import { Module } from '@nestjs/common';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FileUploadService } from 'src/lib/file-upload.service';
@Module({
  controllers: [VaccinationsController],
  providers: [
    VaccinationsService,
    PrismaService,
    JwtService,
    FileUploadService,
  ],
})
export class VaccinationsModule {}
