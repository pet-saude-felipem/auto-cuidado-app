import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/async-handler';
import { medicationService } from './medication.service';
import {
  CreateMedicationInput,
  UpdateMedicationInput,
} from './medication.schema';

export const medicationController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const medications = await medicationService.list();
    res.json(medications);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const medication = await medicationService.getById(req.params.id);
    res.json(medication);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const medication = await medicationService.create(req.body as CreateMedicationInput);
    res.status(201).json(medication);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const medication = await medicationService.update(
      req.params.id,
      req.body as UpdateMedicationInput,
    );
    res.json(medication);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await medicationService.remove(req.params.id);
    res.status(204).send();
  }),
};
