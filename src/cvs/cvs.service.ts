import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError } from '../prisma/prisma-errors';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

// Chaque requête est filtrée par { id, userId } : un CV d'un autre utilisateur
// est traité comme inexistant (404), sans requête de vérification préalable.
@Injectable()
export class CvsService {
    constructor(
        private prisma: PrismaService,
    ) { }

    findAll(userId: string) {
        return this.prisma.cv.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const cv = await this.prisma.cv.findFirst({ where: { id, userId } });
        if (!cv) throw new NotFoundException('CV introuvable');
        return cv;
    }

    create(userId: string, dto: CreateCvDto) {
        return this.prisma.cv.create({
            data: {
                userId,
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
        const { count } = await this.prisma.cv.deleteMany({ where: { id, userId } });
        if (count === 0) throw new NotFoundException('CV introuvable');
    }

    async update(id: string, userId: string, dto: UpdateCvDto) {
        try {
            return await this.prisma.cv.update({
                where: { id, userId },
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
                    ...(dto.experiences !== undefined && { experiences: dto.experiences ?? [] }),
                    ...(dto.education !== undefined && { education: dto.education ?? [] }),
                    ...(dto.skills !== undefined && { skills: dto.skills ?? [] }),
                    ...(dto.languages !== undefined && { languages: dto.languages ?? [] }),
                    ...(dto.currentStep !== undefined && { currentStep: dto.currentStep }),
                    ...(dto.completed !== undefined && { completed: dto.completed }),
                },
            });
        } catch (error) {
            if (isPrismaError(error, 'P2025')) throw new NotFoundException('CV introuvable');
            throw error;
        }
    }
}
