import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = [
    { title: 'Setup project', description: 'Initialize repository and tools', priority: 'LOW' },
    { title: 'Fix production bug', description: 'Investigate crash on login', priority: 'CRITICAL' },
    { title: 'Add tests', description: 'Add unit tests for API routes', priority: 'MEDIUM' },
  ];
  for (const it of items) {
    await prisma.task.create({ data: it });
  }
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
