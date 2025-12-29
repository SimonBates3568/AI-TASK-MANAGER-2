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
    const { title, description, priority, dueDate, tags } = body;
    if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    const userId = await getCurrentUserId(req);

    const data: any = {
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      aiAssigned: false,
      userId: userId ?? undefined,
    };

    if (dueDate) {
      // accept ISO string or Date
      data.dueDate = new Date(dueDate);
    }
    if (Array.isArray(tags)) {
      data.tags = tags;
    }

    try {
      const task = await prisma.task.create({ data });
      return NextResponse.json(task);
    } catch (createErr) {
      // If the DB schema doesn't have dueDate/tags (migration not applied), retry without those fields.
      console.warn('Create with extended fields failed, retrying without dueDate/tags', createErr);
      const safeData: any = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        aiAssigned: data.aiAssigned,
        userId: data.userId,
      };
      const task = await prisma.task.create({ data: safeData });
      return NextResponse.json(task);
    }
  } catch (err: any) {
    console.error('POST /api/tasks error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
