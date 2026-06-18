import { Medication } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../shared/errors/app-error';
import { medicationRepository } from './medication.repository';
import { CreateMedicationInput, UpdateMedicationInput } from './medication.schema';

export class MedicationService {
  async list(): Promise<Medication[]> {
    return medicationRepository.findAll();
  }

  async getById(id: string): Promise<Medication> {
    const medication = await medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundError('Medicação não encontrada.');
    }
    return medication;
  }

  async create(data: CreateMedicationInput): Promise<Medication> {
    this.validateTimesAgainstFrequency(data.frequency, data.times);
    return medicationRepository.create(data);
  }

  async update(id: string, data: UpdateMedicationInput): Promise<Medication> {
    await this.getById(id);

    if (data.frequency && data.times) {
      this.validateTimesAgainstFrequency(data.frequency, data.times);
    } else if (data.times) {
      const current = await medicationRepository.findById(id);
      this.validateTimesAgainstFrequency(current!.frequency, data.times);
    }

    return medicationRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    await medicationRepository.delete(id);
  }

  private validateTimesAgainstFrequency(frequency: string, times: string[]): void {
    const expected = Number.parseInt(frequency.replace('x', ''), 10);
    if (times.length !== expected) {
      throw new BadRequestError(
        `A frequência ${frequency} exige exatamente ${expected} horário(s).`,
      );
    }
  }
}

export const medicationService = new MedicationService();
