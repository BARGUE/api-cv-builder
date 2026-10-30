import { Prisma } from '../../generated/prisma/client';

/** P2002 = contrainte d'unicité violée, P2025 = enregistrement introuvable. */
export function isPrismaError(error: unknown, code: 'P2002' | 'P2025'): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
