import { Medication, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateMedicationInput, UpdateMedicationInput } from './medication.schema';

export class MedicationRepository {
  async findAll(): Promise<Medication[]> {
    return prisma.medication.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Medication | null> {
    return prisma.medication.findUnique({ where: { id } });
  }

  async create(data: CreateMedicationInput): Promise<Medication> {
    return prisma.medication.create({
      data: {
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        times: data.times,
        notes: data.notes ?? null,
      },
    });
  }

  async update(id: string, data: UpdateMedicationInput): Promise<Medication> {
    return prisma.medication.update({
      where: { id },
      data: data as Prisma.MedicationUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.medication.delete({ where: { id } });
  }
}

export const medicationRepository = new MedicationRepository();
