import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import {
  AppointmentStatus,
  Notification,
  NotificationType,
} from '@prisma/client';
import { mailService } from 'src/lib/mail.service';
import { getAppointmentReminderTemplate } from 'src/templates/appointment-reminder.template';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async sendAppointmentReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const appointments = await this.prismaService.appointment.findMany({
      where: {
        appointmentDate: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        user: true,
        vaccination: true,
      },
    });

    for (const appointment of appointments) {
      const user = appointment.user;
      const vaccination = appointment.vaccination;

      const { subject, html } = getAppointmentReminderTemplate(
        user.name,
        vaccination.vaccineName,
        appointment.appointmentDate,
        vaccination.location,
      );

      try {
        await mailService.sendMail({
          to: user.email,
          subject,
          html,
        });

        await this.createNotification(
          user.id,
          `Nhắc nhở: Bạn có lịch hẹn tiêm ${vaccination.vaccineName} vào ${appointment.appointmentDate.toLocaleString()}`,
          'REMINDER',
        );
      } catch (error) {
        console.error(`Failed to send reminder to ${user.email}:`, error);
      }
    }
  }

  async createNotification(
    userId: string,
    message: string,
    type: NotificationType,
  ): Promise<Notification> {
    return this.prismaService.notification.create({
      data: {
        userId,
        message,
        type,
        sentAt: new Date(),
        isRead: false,
      },
    });
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.prismaService.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.prismaService.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { sentAt: 'desc' },
    });
  }
}
