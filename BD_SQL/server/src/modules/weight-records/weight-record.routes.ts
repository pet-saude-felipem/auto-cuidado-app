import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate';
import { weightRecordController } from './weight-record.controller';
import {
  createWeightRecordSchema,
  updateWeightRecordSchema,
  weightRecordIdParamSchema,
} from './weight-record.schema';

const router = Router();

router.get('/', weightRecordController.list);
router.get('/:id', validate(weightRecordIdParamSchema, 'params'), weightRecordController.getById);
router.post('/', validate(createWeightRecordSchema), weightRecordController.create);
router.patch(
  '/:id',
  validate(weightRecordIdParamSchema, 'params'),
  validate(updateWeightRecordSchema),
  weightRecordController.update,
);
router.delete('/:id', validate(weightRecordIdParamSchema, 'params'), weightRecordController.remove);

export default router;
