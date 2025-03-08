import { Module } from '@nestjs/common';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [VaccinationsController],
  providers: [VaccinationsService, PrismaService, JwtService],
})
export class VaccinationsModule {}
