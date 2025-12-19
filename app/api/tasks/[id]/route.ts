import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const data = await req.json();
  const updated = await prisma.task.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
