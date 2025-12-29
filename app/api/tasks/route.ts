import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/auth';

export async function GET(req: Request) {
  try {
    // If a user is present, only return that user's tasks. Otherwise return all (dev/demo).
    let userId = await getCurrentUserId(req);
    // If a userId was provided but the user record does not exist in the DB,
    // avoid inserting a dangling foreign key. In development it's common to
    // have a DEV_USER_ID set but forget to seed the corresponding user.
    if (userId) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId } });
        if (!u) {
          console.warn('User id provided but not found in DB, creating task without userId:', userId);
          userId = undefined as any;
        }
      } catch (e) {
        // In case of any unexpected error, clear userId to avoid FK failure.
        console.warn('Error checking user existence, proceeding without userId', e);
        userId = undefined as any;
      }
    }
    const tasks = await prisma.task.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        completed: true,
        aiAssigned: true,
        aiSuggestion: true,
        aiConfidence: true,
        aiResponse: true,
        aiEvaluatedAt: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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
    let userId = await getCurrentUserId(req);
    // Ensure the user exists before attaching userId to avoid FK errors.
    if (userId) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId } });
        if (!u) {
          console.warn('User id provided but not found in DB, creating task without userId:', userId);
          userId = undefined as any;
        }
      } catch (e) {
        console.warn('Error checking user existence, proceeding without userId', e);
        userId = undefined as any;
      }
    }

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
      const task = await prisma.task.create({
        data,
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          completed: true,
          aiAssigned: true,
          aiSuggestion: true,
          aiConfidence: true,
          aiResponse: true,
          aiEvaluatedAt: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return NextResponse.json(task);
    } catch (createErr: any) {
      // If the DB schema doesn't have dueDate/tags (migration not applied), retry without those fields.
      console.warn('Create with extended fields failed, retrying without dueDate/tags', createErr);
      const safeData: any = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        aiAssigned: data.aiAssigned,
        userId: data.userId,
      };
      try {
        const task = await prisma.task.create({
          data: safeData,
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            completed: true,
            aiAssigned: true,
            aiSuggestion: true,
            aiConfidence: true,
            aiResponse: true,
            aiEvaluatedAt: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return NextResponse.json(task);
      } catch (retryErr: any) {
        console.error('Retry create failed', retryErr);
        // If this is a Prisma schema mismatch (P2022), return a helpful message
        if (retryErr?.code === 'P2022' || createErr?.code === 'P2022') {
          const meta = (retryErr?.meta ?? createErr?.meta) || {};
          const col = meta.column || 'unknown';
          const model = meta.modelName || 'Task';
          return NextResponse.json({ error: 'P2022', message: `Database column missing: ${model}.${col}. Please run Prisma migrations (prisma migrate deploy).` }, { status: 500 });
        }
        return NextResponse.json({ error: String(retryErr) }, { status: 500 });
      }
    }
  } catch (err: any) {
    console.error('POST /api/tasks error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
