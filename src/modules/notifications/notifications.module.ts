import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, JwtService],
})
export class NotificationsModule {}
