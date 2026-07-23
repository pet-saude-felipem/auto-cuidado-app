import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const medications = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Losartana',
    dosage: '50mg',
    frequency: '1x',
    times: ['08:00'],
    notes: 'Tomar em jejum',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'Metformina',
    dosage: '500mg',
    frequency: '2x',
    times: ['08:00', '20:00'],
    notes: null,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Vitamina D',
    dosage: '2000UI',
    frequency: '1x',
    times: ['12:00'],
    notes: 'Tomar após o almoço',
  },
];

const medicationLogs = [
  { id: 'b1000000-0000-0000-0000-000000000001', medicationId: 'a1000000-0000-0000-0000-000000000001', date: '2026-02-18', time: '08:00', status: 'taken' },
  { id: 'b1000000-0000-0000-0000-000000000002', medicationId: 'a1000000-0000-0000-0000-000000000002', date: '2026-02-18', time: '08:00', status: 'taken' },
  { id: 'b1000000-0000-0000-0000-000000000003', medicationId: 'a1000000-0000-0000-0000-000000000002', date: '2026-02-17', time: '20:00', status: 'missed' },
  { id: 'b1000000-0000-0000-0000-000000000004', medicationId: 'a1000000-0000-0000-0000-000000000003', date: '2026-02-17', time: '12:00', status: 'taken' },
  { id: 'b1000000-0000-0000-0000-000000000005', medicationId: 'a1000000-0000-0000-0000-000000000001', date: '2026-02-17', time: '08:00', status: 'taken' },
  { id: 'b1000000-0000-0000-0000-000000000006', medicationId: 'a1000000-0000-0000-0000-000000000002', date: '2026-02-17', time: '08:00', status: 'taken' },
  { id: 'b1000000-0000-0000-0000-000000000007', medicationId: 'a1000000-0000-0000-0000-000000000001', date: '2026-02-16', time: '08:00', status: 'taken' },
  { id: 'b1000000-0000-0000-0000-000000000008', medicationId: 'a1000000-0000-0000-0000-000000000003', date: '2026-02-16', time: '12:00', status: 'taken' },
];

function toDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  for (const medication of medications) {
    await prisma.medication.upsert({
      where: { id: medication.id },
      update: {},
      create: medication,
    });
  }

  for (const log of medicationLogs) {
    await prisma.medicationLog.upsert({
      where: { id: log.id },
      update: {},
      create: {
        id: log.id,
        medicationId: log.medicationId,
        date: toDate(log.date),
        time: log.time,
        status: log.status,
      },
    });
  }

  console.log('✅ Seed concluído.');
}

main()
  .catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
