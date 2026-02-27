import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium } from 'playwright';

const PRINT_SECRET_HEADER = 'x-print-secret';

@Injectable()
export class CvPdfRenderService {
    private readonly frontendUrl: string;
    private readonly printSecret: string | undefined;

    constructor(private config: ConfigService) {
        this.frontendUrl = (this.config.get<string>('FRONTEND_URL') ?? '').replace(/\/$/, '');
        this.printSecret = this.config.get<string>('PRINT_SECRET');
    }

    async generatePdfBuffer(cvDataForPrint: {
        fullName: string;
        jobTitle: string;
        email: string;
        phone: string;
        location: string;
        summary: string;
        template: string;
        accentColor: string;
        photoUrl: string | null;
        experiences: unknown;
        education: unknown;
        skills: unknown;
        languages: unknown;
    }): Promise<Buffer> {
        if (!this.frontendUrl || !this.printSecret) {
            throw new BadRequestException('Configuration FRONTEND_URL ou PRINT_SECRET manquante');
        }
        const url = `${this.frontendUrl}/api/cv-print`;
        let html: string;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [PRINT_SECRET_HEADER]: this.printSecret,
                },
                body: JSON.stringify({ cv: cvDataForPrint }),
            });
            if (!res.ok) {
                throw new Error(`Print API returned ${res.status}`);
            }
            html = await res.text();
        } catch (err) {
            throw new BadRequestException(
                'Impossible de générer le PDF (service de rendu indisponible).',
            );
        }

        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'load' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0', right: '0', bottom: '0', left: '0' },
            });
            return Buffer.from(pdfBuffer);
        } finally {
            await browser.close();
        }
    }
}
