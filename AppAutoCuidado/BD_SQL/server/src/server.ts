import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';

async function bootstrap() {
  const app = createApp();

  try {
    await connectDatabase();
    console.log('✅ Conectado ao PostgreSQL via Prisma');
  } catch {
    console.error('❌ Falha ao conectar ao PostgreSQL. Verifique o .env e se o serviço está rodando.');
  }

  const server = app.listen(env.API_PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${env.API_PORT}`);
  });

  const shutdown = async () => {
    await disconnectDatabase();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
