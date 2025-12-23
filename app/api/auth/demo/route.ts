import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function POST(req: Request) {
  // Create or find a demo user and set a dev_user_id cookie for local testing.
  const demoId = process.env.DEV_USER_ID || 'demo-user-0001';
  let user = await prisma.user.findUnique({ where: { id: demoId } }).catch(() => null as any);
  if (!user) {
    // create a demo user with predictable id so the cookie maps
    user = await prisma.user.create({ data: { id: demoId, name: 'Demo User', email: 'demo@local' } });
  }

  const res = NextResponse.json({ ok: true, id: user.id });
  // set cookie readable by server and client for convenience
  res.headers.set('Set-Cookie', `dev_user_id=${user.id}; Path=/; Max-Age=${60 * 60 * 24 * 30}`);
  return res;
}
