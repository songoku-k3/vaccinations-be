import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  // config swagger api
  const config = new DocumentBuilder()
    .setTitle('Vaccination')
    .setDescription('The Vaccination API description')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('appointments')
    .addTag('blog')
    .addTag('bookings')
    .addTag('category-vaccine')
    .addTag('user')
    .addTag('inventory')
    .addTag('manufacturers')
    .addTag('momo')
    .addTag('notifications')
    .addTag('supplier')
    .addTag('tag')
    .addTag('role')
    .addTag('vaccinations')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Swagger | Vaccination',
  });

  // Configure port on Frontend access side
  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };

  app.enableCors(corsOptions);
  await app.listen(3001);
}

bootstrap();
