import { Prisma, WeightRecord } from '@prisma/client';
import { prisma } from '../../config/database';
import { formatDateISO, parseDateInput } from '../../shared/utils/date-formatter';
import {
  CreateWeightRecordInput,
  UpdateWeightRecordInput,
  WeightRecordResponse,
} from './weight-record.schema';

function toResponse(record: WeightRecord): WeightRecordResponse {
  return {
    id: record.id,
    value: Number(record.value),
    date: formatDateISO(record.date),
    notes: record.notes,
  };
}

export class WeightRecordRepository {
  async findAll(): Promise<WeightRecordResponse[]> {
    const records = await prisma.weightRecord.findMany({
      orderBy: { date: 'desc' },
    });
    return records.map(toResponse);
  }

  async findById(id: string): Promise<WeightRecordResponse | null> {
    const record = await prisma.weightRecord.findUnique({ where: { id } });
    return record ? toResponse(record) : null;
  }

  async create(data: CreateWeightRecordInput): Promise<WeightRecordResponse> {
    const record = await prisma.weightRecord.create({
      data: {
        value: data.value,
        date: parseDateInput(data.date),
        notes: data.notes ?? null,
      },
    });
    return toResponse(record);
  }

  async update(id: string, data: UpdateWeightRecordInput): Promise<WeightRecordResponse> {
    const updateData: Prisma.WeightRecordUpdateInput = {};

    if (data.value !== undefined) updateData.value = data.value;
    if (data.date !== undefined) updateData.date = parseDateInput(data.date);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const record = await prisma.weightRecord.update({
      where: { id },
      data: updateData,
    });

    return toResponse(record);
  }

  async delete(id: string): Promise<void> {
    await prisma.weightRecord.delete({ where: { id } });
  }
}

export const weightRecordRepository = new WeightRecordRepository();
