import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate';
import { medicationController } from './medication.controller';
import {
  createMedicationSchema,
  medicationIdParamSchema,
  updateMedicationSchema,
} from './medication.schema';

const router = Router();

router.get('/', medicationController.list);
router.get('/:id', validate(medicationIdParamSchema, 'params'), medicationController.getById);
router.post('/', validate(createMedicationSchema), medicationController.create);
router.patch(
  '/:id',
  validate(medicationIdParamSchema, 'params'),
  validate(updateMedicationSchema),
  medicationController.update,
);
router.delete('/:id', validate(medicationIdParamSchema, 'params'), medicationController.remove);

export default router;
