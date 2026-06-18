import { MedicationLog } from '@prisma/client';
import { prisma } from '../../config/database';
import { formatDateISO, parseDateInput } from '../../shared/utils/date-formatter';
import {
  CreateMedicationLogInput,
  MedicationLogQuery,
  MedicationLogResponse,
} from './medication-log.schema';

function toResponse(log: MedicationLog): MedicationLogResponse {
  return {
    id: log.id,
    medicationId: log.medicationId,
    date: formatDateISO(log.date),
    time: log.time,
    status: log.status,
  };
}

export class MedicationLogRepository {
  async findAll(filters: MedicationLogQuery): Promise<MedicationLogResponse[]> {
    const where: { medicationId?: string; date?: { gte: Date } } = {};

    if (filters.medicationId) {
      where.medicationId = filters.medicationId;
    }

    if (filters.days) {
      const since = new Date();
      since.setUTCDate(since.getUTCDate() - filters.days);
      since.setUTCHours(0, 0, 0, 0);
      where.date = { gte: since };
    }

    const logs = await prisma.medicationLog.findMany({
      where,
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });

    return logs.map(toResponse);
  }

  async create(data: CreateMedicationLogInput): Promise<MedicationLogResponse> {
    const log = await prisma.medicationLog.create({
      data: {
        medicationId: data.medicationId,
        date: parseDateInput(data.date),
        time: data.time,
        status: data.status,
      },
    });

    return toResponse(log);
  }
}

export const medicationLogRepository = new MedicationLogRepository();
