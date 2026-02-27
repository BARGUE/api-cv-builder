import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    async register(email: string, password: string, firstName: string, lastName: string) {
        try {
            const hashed = await bcrypt.hash(password, 10);

            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashed,
                    profile: {
                        create: {
                            firstName: firstName || null,
                            lastName: lastName || null,
                        },
                    },
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            const payload = { sub: user.id, email: user.email };
            const access_token = this.jwt.sign(payload, { expiresIn: '1h' });

            return {
                access_token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.profile?.firstName ?? null,
                    lastName: user.profile?.lastName ?? null,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            };
        } catch (error) {
            if (error.code === 'P2002') {
                throw new UnauthorizedException('Cet email est déjà utilisé');
            }
            throw error;
        }
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        await this.prisma.profile.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
        });

        const userWithProfile = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                profile: { select: { firstName: true, lastName: true } },
            },
        });

        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwt.sign(payload, { expiresIn: '1h' });

        return {
            access_token,
            user: {
                id: userWithProfile!.id,
                email: userWithProfile!.email,
                firstName: userWithProfile!.profile?.firstName ?? null,
                lastName: userWithProfile!.profile?.lastName ?? null,
                createdAt: userWithProfile!.createdAt,
                updatedAt: userWithProfile!.updatedAt,
            },
        };
    }

    async changePassword(userId: string, newPassword: string) {
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
    }
}
