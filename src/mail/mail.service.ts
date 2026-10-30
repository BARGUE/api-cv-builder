import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from './dto/contact.dto';

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly config: ConfigService,
    ) { }

    async sendContact(dto: ContactDto) {
        const name = escapeHtml(dto.name);
        const email = escapeHtml(dto.email);
        const message = escapeHtml(dto.message);
        const appName = 'CV Builder';
        const date = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Message de contact – ${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body {
      background-color: #F7F6F3;
      font-family: Georgia, 'Times New Roman', serif;
      color: #1A1A1A;
    }
    .wrapper { width: 100%; padding: 48px 16px; background-color: #F7F6F3; }
    .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E6E1; }
    .header { padding: 40px 48px 32px; border-bottom: 1px solid #E8E6E1; }
    .logo-mark { display: inline-block; width: 32px; height: 32px; background: #1A1A1A; margin-bottom: 24px; }
    .logo-name { font-family: Georgia, serif; font-size: 13px; font-weight: normal; letter-spacing: 0.18em; text-transform: uppercase; color: #1A1A1A; }
    .body { padding: 40px 48px; }
    .label { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B6B6B; margin-bottom: 6px; }
    .title { font-family: Georgia, serif; font-size: 26px; font-weight: normal; line-height: 1.3; color: #1A1A1A; margin-bottom: 32px; }
    .meta-row { display: flex; border-top: 1px solid #E8E6E1; padding: 14px 0; gap: 16px; }
    .meta-row:last-child { border-bottom: 1px solid #E8E6E1; }
    .meta-key { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #6B6B6B; min-width: 80px; padding-top: 2px; }
    .meta-val { font-family: Georgia, serif; font-size: 14px; color: #1A1A1A; line-height: 1.5; }
    .meta-val a { color: #1A1A1A; text-decoration: underline; text-underline-offset: 3px; }
    .message-wrap { margin-top: 32px; }
    .message-body { font-family: Georgia, serif; font-size: 15px; line-height: 1.75; color: #1A1A1A; white-space: pre-wrap; background: #F7F6F3; border-left: 2px solid #1A1A1A; padding: 20px 24px; }
    .cta-wrap { margin-top: 32px; }
    .cta-btn { display: inline-block; background: #1A1A1A; color: #FFFFFF !important; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; padding: 14px 28px; }
    .footer { padding: 24px 48px; border-top: 1px solid #E8E6E1; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .footer-note { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.12em; color: #6B6B6B; line-height: 1.6; }
    .footer-date { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 0.1em; color: #B0AEA9; white-space: nowrap; }
    @media (max-width: 600px) {
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
      .meta-row { flex-direction: column; gap: 4px; }
      .footer { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo-mark" role="img" aria-label="${appName} logo"></div>
      <div class="logo-name">${appName}</div>
    </div>
    <div class="body">
      <p class="label">Nouveau message</p>
      <h1 class="title">Vous avez reçu<br>une demande de contact.</h1>
      <div>
        <div class="meta-row">
          <span class="meta-key">De</span>
          <span class="meta-val">${name}</span>
        </div>
        <div class="meta-row">
          <span class="meta-key">Email</span>
          <span class="meta-val"><a href="mailto:${email}">${email}</a></span>
        </div>
      </div>
      <div class="message-wrap">
        <p class="label" style="margin-bottom:12px;">Message</p>
        <div class="message-body">${message}</div>
      </div>
      <div class="cta-wrap">
        <a href="mailto:${email}" class="cta-btn">Répondre au message</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-note">
        Ce message a été envoyé via le formulaire de contact de ${appName}.<br>
        Si vous n'attendiez pas ce message, vous pouvez l'ignorer.
      </p>
      <span class="footer-date">${date}</span>
    </div>
  </div>
</div>
</body>
</html>`;

        try {
            await this.mailerService.sendMail({
                to: this.config.get<string>('MAIL_TO'),
                replyTo: dto.email,
                subject: `[Contact] Message de ${dto.name}`,
                html,
            });
        } catch (error) {
            this.logger.error(`Échec de l'envoi du mail de contact`, error instanceof Error ? error.stack : error);
            throw new ServiceUnavailableException("Le message n'a pas pu être envoyé, réessayez plus tard");
        }
    }
}