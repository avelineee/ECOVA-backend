import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule);

  // =========================
  // CORS
  // =========================
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://192.168.56.1:3001',
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });

  // =========================
  // STATIC FILES
  // =========================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // =========================
  // GLOBAL VALIDATION
  // =========================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // =========================
  // SWAGGER
  // =========================
  const config = new DocumentBuilder()
    .setTitle('ECOVA API')
    .setDescription(
      'API Eco Collection, Value & Action - Digital Waste Bank Management System',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup('api', app, document);

  // =========================
  // SERVER
  // =========================
  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `ECOVA Backend running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `Swagger available at http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}

bootstrap();