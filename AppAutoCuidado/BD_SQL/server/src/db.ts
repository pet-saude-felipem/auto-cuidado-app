import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const pool = new Pool({
  host:     process.env.POSTGRES_HOST     ?? 'localhost',
  port:     Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB       ?? 'autocuidado',
  user:     process.env.POSTGRES_USER     ?? 'autocuidado_user',
  password: process.env.POSTGRES_PASSWORD ?? 'autocuidado_pass',
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL:', err);
});
