import weightRoutes from './routes/weight-records'; // ANDERSON
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './db';
import medicationsRouter from './routes/medications';
import medicationLogsRouter from './routes/medication-logs';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = Number(process.env.API_PORT ?? 3001);

// ----------------------------------------------------------
// Middlewares globais
// ------------------------------------------------------------
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// Rotas
// ------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/medications',      medicationsRouter);
app.use('/medication-logs',  medicationLogsRouter);
app.use('/weight-records', weightRoutes); // ANDERSON

// ------------------------------------------------------------
// Inicialização
// ------------------------------------------------------------
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`✅ Conectado ao PostgreSQL`);
  } catch {
    console.error('❌ Falha ao conectar ao PostgreSQL. Verifique o .env e o docker-compose.');
  }
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});


// ------------------------------------------------------------
// Inicialização
// ------------------------------------------------------------