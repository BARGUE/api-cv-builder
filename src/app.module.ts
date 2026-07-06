import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { formatError } from 'zod';

import { AuthModule } from './auth/auth.module';
import { CvsModule } from './cvs/cvs.module';
import { AppController } from './app.controller';
import { envSchema } from './config/env.schema';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);
        if (!parsed.success) {
          console.error(formatError(parsed.error));
          throw new Error('Invalid environment variables');
        }
        return parsed.data;
      },
    }),
    PrismaModule,
    AuthModule,
    CvsModule,
    MailModule
  ],
  controllers: [AppController],
})
export class AppModule { }
