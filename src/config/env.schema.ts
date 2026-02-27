import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z.string().min(16),
    JWT_EXPIRES_IN: z.string().default('1h'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    FRONTEND_URL: z.string().url().optional(),
    PRINT_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;
