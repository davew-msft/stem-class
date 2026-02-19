import { PrismaClient } from '@prisma/client';
import { RIC_CODES, SAMPLE_RECYCLING_FACILITIES } from '../src/lib/recycling-data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed RIC codes
  console.log('📦 Creating RIC codes...');
  for (const ricCode of RIC_CODES) {
    await prisma.ricCode.upsert({
      where: { code: ricCode.code },
      update: ricCode,
      create: ricCode,
    });
  }

  // Seed sample recycling facilities
  console.log('🏢 Creating recycling facilities...');
  for (const facility of SAMPLE_RECYCLING_FACILITIES) {
    await prisma.recyclingCapability.upsert({
      where: { id: facility.id },
      update: facility,
      create: facility,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });