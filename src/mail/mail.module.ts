import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
    imports: [
        // Anti-spam du formulaire de contact : compteur en mémoire, par IP.
        ThrottlerModule.forRoot({
            throttlers: [{ ttl: 60 * 60_000, limit: 5 }],
            errorMessage: 'Trop de messages envoyés, réessayez dans une heure',
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    // Connexion SMTP réutilisée entre les envois : évite le handshake TLS à chaque message.
                    pool: true,
                    connectionTimeout: 10_000,
                    greetingTimeout: 10_000,
                    socketTimeout: 15_000,
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