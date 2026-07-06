import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z.string().min(16),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    MAIL_USER: z.string().email(),
    MAIL_PASS: z.string().min(1),
    MAIL_TO: z.string().email(),
});

export type Env = z.infer<typeof envSchema>;
