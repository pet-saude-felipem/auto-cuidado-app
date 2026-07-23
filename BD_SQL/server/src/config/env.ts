import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const envSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default('autocuidado'),
  POSTGRES_USER: z.string().default('autocuidado_user'),
  POSTGRES_PASSWORD: z.string().default('autocuidado_pass'),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const base = parsed.data;

export const env = {
  ...base,
  DATABASE_URL:
    base.DATABASE_URL ??
    `postgresql://${base.POSTGRES_USER}:${base.POSTGRES_PASSWORD}@${base.POSTGRES_HOST}:${base.POSTGRES_PORT}/${base.POSTGRES_DB}?schema=public`,
};
