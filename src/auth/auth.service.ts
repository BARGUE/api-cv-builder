import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { isPrismaError } from '../prisma/prisma-errors';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

// Hash factice comparé quand l'email est inconnu : le temps de réponse du login
// reste identique, ce qui empêche de deviner quels emails ont un compte.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', BCRYPT_ROUNDS);

const authUserSelect = {
    id: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    profile: { select: { firstName: true, lastName: true } },
} as const;

type AuthUser = {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    profile: { firstName: string | null; lastName: string | null } | null;
};

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    async register(email: string, password: string, firstName: string, lastName: string) {
        const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

        try {
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
                select: authUserSelect,
            });
            return this.toAuthResponse(user);
        } catch (error) {
            if (isPrismaError(error, 'P2002')) {
                throw new ConflictException('Cet email est déjà utilisé');
            }
            throw error;
        }
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { ...authUserSelect, password: true },
        });

        const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !valid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Comptes anciens sans profil : on le crée une seule fois.
        if (!user.profile) {
            user.profile = await this.prisma.profile.create({
                data: { userId: user.id },
                select: { firstName: true, lastName: true },
            });
        }

        return this.toAuthResponse(user);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            throw new UnauthorizedException('Mot de passe actuel incorrect');
        }
        if (currentPassword === newPassword) {
            throw new BadRequestException("Le nouveau mot de passe doit être différent de l'actuel");
        }

        const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
    }

    private toAuthResponse(user: AuthUser) {
        return {
            access_token: this.jwt.sign({ sub: user.id, email: user.email }),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.profile?.firstName ?? null,
                lastName: user.profile?.lastName ?? null,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
}
