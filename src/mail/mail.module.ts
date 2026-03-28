import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: config.get<string>('MAIL_USER'),
                        pass: config.get<string>('MAIL_PASS'),
                    },
                },
                defaults: {
                    from: `"Contact Form" <${config.get<string>('MAIL_USER')}>`,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    controllers: [MailController],
})
export class MailModule { }