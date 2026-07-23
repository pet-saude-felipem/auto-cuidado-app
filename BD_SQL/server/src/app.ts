import cors from 'cors';
import express from 'express';
import { errorHandler } from './shared/middlewares/error-handler';
import medicationRoutes from './modules/medications/medication.routes';
import medicationLogRoutes from './modules/medication-logs/medication-log.routes';
import weightRecordRoutes from './modules/weight-records/weight-record.routes';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:8081', 'http://10.0.2.2:8081'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/medications', medicationRoutes);
  app.use('/medication-logs', medicationLogRoutes);
  app.use('/weight-records', weightRecordRoutes);

  app.use(errorHandler);

  return app;
}
