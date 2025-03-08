import { Module } from '@nestjs/common';
import { ManufacturersController } from './manufacturers.controller';
import { ManufacturersService } from './manufacturers.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ManufacturersController],
  providers: [ManufacturersService, PrismaService, JwtService],
})
export class ManufacturersModule {}
