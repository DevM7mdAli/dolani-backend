import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const locs = await prisma.location.findMany({
    where: { type: { in: ['STAIRS', 'ELEVATOR'] } },
    select: { id: true, name: true, type: true, floor_id: true },
  });
  console.log(locs);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
