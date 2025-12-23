import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';
import { getCurrentUserId } from '../../../../lib/auth.js';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await req.json();
  // If user scoping is enabled, ensure the task belongs to them before updating.
  const userId = await getCurrentUserId(req);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (userId && task.userId && task.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await prisma.task.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const userId = await getCurrentUserId(req);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (userId && task.userId && task.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
