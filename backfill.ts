import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.event.updateMany({
    where: {
      isDeleted: null
    } as any, // bypassing ts checks just in case
    data: {
      isDeleted: false
    }
  });
  console.log(`Updated ${result.count} events to isDeleted: false`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
