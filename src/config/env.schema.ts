import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(3000),
    // Nombre de reverse proxies devant l'API (0 = accès direct). Nécessaire pour lire la vraie IP client.
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]?$/).default('1h'),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    MAIL_USER: z.string().email(),
    MAIL_PASS: z.string().min(1),
    MAIL_TO: z.string().email(),
});

export type Env = z.infer<typeof envSchema>;
