import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MailService } from './mail.service';
import { ContactDto } from './dto/contact.dto';

@UseGuards(ThrottlerGuard)
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
