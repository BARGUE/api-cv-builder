import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(3000),
    JWT_SECRET: z.string().min(16),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;
