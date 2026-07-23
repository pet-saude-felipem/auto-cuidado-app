import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middlewares/async-handler';
import { weightRecordService } from './weight-record.service';
import {
  CreateWeightRecordInput,
  UpdateWeightRecordInput,
} from './weight-record.schema';

export const weightRecordController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const records = await weightRecordService.list();
    res.json(records);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const record = await weightRecordService.getById(req.params.id);
    res.json(record);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await weightRecordService.create(req.body as CreateWeightRecordInput);
    res.status(201).json(record);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const record = await weightRecordService.update(
      req.params.id,
      req.body as UpdateWeightRecordInput,
    );
    res.json(record);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await weightRecordService.remove(req.params.id);
    res.status(204).send();
  }),
};
