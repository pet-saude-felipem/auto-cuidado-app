const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.$transaction(async (db) => {
    const logs = await db.medicationLog.deleteMany();
    const medications = await db.medication.deleteMany();
    const weights = await db.weightRecord.deleteMany();
    return { logs: logs.count, medications: medications.count, weights: weights.count };
  });
  console.log(`Registros removidos: ${deleted.weights} pesos, ${deleted.medications} medicações, ${deleted.logs} usos de medicação.`);
}

main()
  .catch((error) => {
    console.error('Não foi possível limpar os registros:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
