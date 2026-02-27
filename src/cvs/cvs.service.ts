import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CvPdfRenderService } from './services/cv-pdf-render.service';

@Injectable()
export class CvsService {
    constructor(
        private prisma: PrismaService,
        private cvPdfRender: CvPdfRenderService,
    ) {}

    async findAll(userId: string) {
        const profileUserId = await this.getProfileUserId(userId);
        if (!profileUserId) return [];
        return this.prisma.cv.findMany({
            where: { userId: profileUserId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    private async getProfileUserId(userId: string): Promise<string | null> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        return profile?.userId ?? null;
    }

    async findOne(id: string, userId: string) {
        const profileUserId = await this.getProfileUserId(userId);
        if (!profileUserId) throw new ForbiddenException('Profil requis');
        const cv = await this.prisma.cv.findUnique({ where: { id } });
        if (!cv) throw new NotFoundException('CV introuvable');
        if (cv.userId !== profileUserId) throw new ForbiddenException('Accès refusé');
        return cv;
    }

    async create(userId: string, dto: CreateCvDto) {
        const profileUserId = await this.getProfileUserId(userId);
        if (!profileUserId) throw new ForbiddenException('Profil requis');
        return this.prisma.cv.create({
            data: {
                userId: profileUserId,
                title: dto.title,
                template: dto.template ?? 'classic',
                accentColor: dto.accentColor ?? '#4F46E5',
                photoUrl: dto.photoUrl ?? null,
                fullName: dto.fullName ?? '',
                jobTitle: dto.jobTitle ?? '',
                email: dto.email ?? '',
                phone: dto.phone ?? '',
                location: dto.location ?? '',
                summary: dto.summary ?? '',
                experiences: dto.experiences ?? [],
                education: dto.education ?? [],
                skills: dto.skills ?? [],
                languages: dto.languages ?? [],
                currentStep: dto.currentStep ?? 1,
                completed: dto.completed ?? false,
            },
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);
        await this.prisma.cv.delete({ where: { id } });
    }

    async update(id: string, userId: string, dto: UpdateCvDto) {
        await this.findOne(id, userId);
        return this.prisma.cv.update({
            where: { id },
            data: {
                ...(dto.title != null && { title: dto.title }),
                ...(dto.template != null && { template: dto.template }),
                ...(dto.accentColor != null && { accentColor: dto.accentColor }),
                ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
                ...(dto.fullName != null && { fullName: dto.fullName }),
                ...(dto.jobTitle != null && { jobTitle: dto.jobTitle }),
                ...(dto.email != null && { email: dto.email }),
                ...(dto.phone != null && { phone: dto.phone }),
                ...(dto.location != null && { location: dto.location }),
                ...(dto.summary != null && { summary: dto.summary }),
                ...(dto.experiences !== undefined && { experiences: (dto.experiences ?? []) as object }),
                ...(dto.education !== undefined && { education: (dto.education ?? []) as object }),
                ...(dto.skills !== undefined && { skills: (dto.skills ?? []) as object }),
                ...(dto.languages !== undefined && { languages: (dto.languages ?? []) as object }),
                ...(dto.currentStep !== undefined && { currentStep: dto.currentStep }),
                ...(dto.completed !== undefined && { completed: dto.completed }),
            },
        });
    }

    async getPdfBuffer(id: string, userId: string): Promise<Buffer> {
        const cv = await this.findOne(id, userId);
        return this.cvPdfRender.generatePdfBuffer({
            fullName: cv.fullName,
            jobTitle: cv.jobTitle,
            email: cv.email,
            phone: cv.phone,
            location: cv.location,
            summary: cv.summary,
            template: cv.template,
            accentColor: cv.accentColor,
            photoUrl: cv.photoUrl,
            experiences: cv.experiences,
            education: cv.education,
            skills: cv.skills,
            languages: cv.languages,
        });
    }
}
