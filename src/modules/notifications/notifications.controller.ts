import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTagController } from 'src/decorator/common.decorator';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { Notification } from '@prisma/client';

@ApiTagController('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Kích hoạt thủ công chức năng gửi nhắc nhở lịch hẹn
  @Post('send-reminders')
  @HttpCode(HttpStatus.OK)
  async sendAppointmentReminders(): Promise<{ message: string }> {
    await this.notificationsService.sendAppointmentReminders();
    return { message: 'Appointment reminders sent successfully' };
  }

  // Lấy tất cả thông báo của một người dùng
  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.getUserNotifications(userId);
  }

  // Lấy các thông báo chưa đọc của một người dùng
  @Get('user/:userId/unread')
  async getUnreadNotifications(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.getUnreadNotifications(userId);
  }
}
