import { Module } from '@nestjs/common';
import { CvsController } from './cvs.controller';
import { CvsService } from './cvs.service';
import { CvPdfRenderService } from './services/cv-pdf-render.service';

@Module({
    controllers: [CvsController],
    providers: [CvsService, CvPdfRenderService],
    exports: [CvsService],
})
export class CvsModule {}
