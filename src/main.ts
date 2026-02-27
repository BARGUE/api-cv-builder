import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

const PAYLOAD_LIMIT = '10mb';

async function bootstrap() {
  const expressAdapter = new ExpressAdapter();
  const instance = expressAdapter.getInstance();
  const jsonParser = json({ limit: PAYLOAD_LIMIT });
  const urlencodedParser = urlencoded({ extended: true, limit: PAYLOAD_LIMIT });
  Object.defineProperty(jsonParser, 'name', { value: 'jsonParser', configurable: true });
  Object.defineProperty(urlencodedParser, 'name', { value: 'urlencodedParser', configurable: true });
  instance.use(jsonParser);
  instance.use(urlencodedParser);

  const app = await NestFactory.create(AppModule, expressAdapter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;

  await app.listen(port);
}
bootstrap();
