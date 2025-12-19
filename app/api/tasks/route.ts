import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error('GET /api/tasks error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority } = body;
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

  const task = await prisma.task.create({ data: { title, description: description || '', priority: priority || 'MEDIUM', aiAssigned: false } });
    return NextResponse.json(task);
  } catch (err: any) {
    console.error('POST /api/tasks error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
