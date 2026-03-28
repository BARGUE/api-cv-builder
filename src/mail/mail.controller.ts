import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import type { ContactDto } from './mail.service';

@Controller('contact')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    async sendContact(@Body() dto: ContactDto) {
        await this.mailService.sendContact(dto);
        return { success: true };
    }
}