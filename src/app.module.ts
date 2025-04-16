import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { BlogModule } from './modules/blog/blog.module';
import { TagsModule } from './modules/tags/tags.module';
import { VaccinationsModule } from './modules/vaccinations/vaccinations.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MomoModule } from './modules/momo/momo.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CategoryVaccineModule } from './modules/category-vaccine/category-vaccine.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UserModule,
    RoleModule,
    BlogModule,
    TagsModule,
    VaccinationsModule,
    SupplierModule,
    ManufacturersModule,
    InventoryModule,
    BookingsModule,
    MomoModule,
    AppointmentsModule,
    NotificationsModule,
    CategoryVaccineModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    // config de dung duoc HttpException
  ],
})
export class AppModule {}
