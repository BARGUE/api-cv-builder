import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';

const PAYLOAD_LIMIT = '10mb';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', { limit: PAYLOAD_LIMIT });
  app.useBodyParser('urlencoded', { extended: true, limit: PAYLOAD_LIMIT });

  app.enableCors({
    origin: true, // en dev accepte toute origine (localhost:3000, localhost:3001, etc.)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // met en cache le preflight CORS 24h : évite un OPTIONS avant chaque requête
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;

  // Derrière un proxy (Render, Railway, Nginx…), req.ip vaudrait l'IP du proxy :
  // la limite anti-spam de /contact serait alors partagée par tous les visiteurs.
  const trustProxy = config.get<number>('TRUST_PROXY') ?? 0;
  if (trustProxy > 0) app.set('trust proxy', trustProxy);

  await app.listen(port);
}
bootstrap();
