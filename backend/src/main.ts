import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL,
      'https://xcardgen.com',
    ].filter(Boolean) as string[],
    credentials: true,
  });

  // Registers Cookie Parser
  app.use(cookieParser());

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  new Logger().log(`Listening on port ${port}`);

  await app.listen(port);
}
bootstrap();
