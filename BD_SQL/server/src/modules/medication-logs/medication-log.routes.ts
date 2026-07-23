import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate';
import { medicationLogController } from './medication-log.controller';
import {
  createMedicationLogSchema,
  medicationLogQuerySchema,
} from './medication-log.schema';

const router = Router();

router.get('/', validate(medicationLogQuerySchema, 'query'), medicationLogController.list);
router.post('/', validate(createMedicationLogSchema), medicationLogController.create);

export default router;
