import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/auth';

export async function GET(req: Request) {
  try {
    // If a user is present, only return that user's tasks. Otherwise return all (dev/demo).
    const userId = await getCurrentUserId(req);
    const tasks = await prisma.task.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: 'desc' } });
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
    const userId = await getCurrentUserId(req);

    const task = await prisma.task.create({ data: { title, description: description || '', priority: priority || 'MEDIUM', aiAssigned: false, userId: userId ?? undefined } });
    return NextResponse.json(task);
  } catch (err: any) {
    console.error('POST /api/tasks error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
