import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/async-handler';
import { medicationLogService } from './medication-log.service';
import {
  CreateMedicationLogInput,
  MedicationLogQuery,
} from './medication-log.schema';

export const medicationLogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const logs = await medicationLogService.list(req.query as MedicationLogQuery);
    res.json(logs);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const log = await medicationLogService.create(req.body as CreateMedicationLogInput);
    res.status(201).json(log);
  }),
};
