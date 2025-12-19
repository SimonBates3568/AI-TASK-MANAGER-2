import { NextResponse } from 'next/server';
import { classifyPriority } from '../../../lib/openai';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description } = body;
  if (!title && !description) return NextResponse.json({ error: 'Missing input' }, { status: 400 });

  const result = await classifyPriority(title || '', description || '');

  try {
    // persist an audit row for traceability
    await prisma.aiAudit.create({ data: {
      taskId: body.taskId ?? null,
      priority: result.priority,
      confidence: result.confidence,
      raw: result.raw ?? null,
    } });
  } catch (err) {
    console.error('Failed to persist AI audit', err);
  }

  // include raw text if available
  return NextResponse.json(result);
}
