import { Module } from '@nestjs/common';
import { CategoryVaccineController } from './category-vaccine.controller';
import { CategoryVaccineService } from './category-vaccine.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CategoryVaccineController],
  providers: [CategoryVaccineService, PrismaService, JwtService],
})
export class CategoryVaccineModule {}
