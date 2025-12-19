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
  // create or ensure a demo user exists (use DEV_USER_ID if provided)
  const demoId = process.env.DEV_USER_ID || 'demo-user-0001';
  const demo = await prisma.user.upsert({ where: { id: demoId }, update: {}, create: { id: demoId, name: 'Demo User', email: 'demo@local' } });
  // attach initial tasks to demo user if they don't already exist
  const existing = await prisma.task.findFirst({ where: { userId: demoId } });
  if (!existing) {
    const demoTasks = [
      { title: 'Demo: Review AI suggestions', description: 'See how AI ranks tasks', priority: 'MEDIUM', userId: demoId },
      { title: 'Demo: Finish onboarding', description: 'Complete profile and settings', priority: 'LOW', userId: demoId },
    ];
    for (const dt of demoTasks) {
      await prisma.task.create({ data: dt });
    }
  }
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
