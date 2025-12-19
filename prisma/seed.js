const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.task.create({ data: { title: 'Setup project', description: 'Initialize repository and tools', priority: 'LOW' } });
  await prisma.task.create({ data: { title: 'Fix production bug', description: 'Investigate crash on login', priority: 'CRITICAL' } });
  await prisma.task.create({ data: { title: 'Add tests', description: 'Add unit tests for API routes', priority: 'MEDIUM' } });
  console.log('Seeded tasks');

  const demoId = process.env.DEV_USER_ID || 'demo-user-0001';
  const demo = await prisma.user.upsert({ where: { id: demoId }, update: {}, create: { id: demoId, name: 'Demo User', email: 'demo@local' } });
  const existing = await prisma.task.findFirst({ where: { userId: demoId } });
  if (!existing) {
    await prisma.task.create({ data: { title: 'Demo: Review AI suggestions', description: 'See how AI ranks tasks', priority: 'MEDIUM', userId: demoId } });
    await prisma.task.create({ data: { title: 'Demo: Finish onboarding', description: 'Complete profile and settings', priority: 'LOW', userId: demoId } });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
