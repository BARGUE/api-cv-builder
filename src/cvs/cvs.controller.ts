import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, StreamableFile } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Controller('cvs')
export class CvsController {
    constructor(private cvs: CvsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Req() req: any) {
        return this.cvs.findAll(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/download')
    async downloadPdf(@Param('id') id: string, @Req() req: any): Promise<StreamableFile> {
        const buffer = await this.cvs.getPdfBuffer(id, req.user.userId);
        const filename = `cv-${id}.pdf`;
        return new StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="${filename}"`,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: any) {
        return this.cvs.findOne(id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateCvDto, @Req() req: any) {
        return this.cvs.create(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCvDto, @Req() req: any) {
        return this.cvs.update(id, req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.cvs.remove(id, req.user.userId);
    }
}
