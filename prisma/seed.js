const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.task.create({ data: { title: 'Setup project', description: 'Initialize repository and tools', priority: 'LOW' } });
  await prisma.task.create({ data: { title: 'Fix production bug', description: 'Investigate crash on login', priority: 'CRITICAL' } });
  await prisma.task.create({ data: { title: 'Add tests', description: 'Add unit tests for API routes', priority: 'MEDIUM' } });
  console.log('Seeded tasks');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
