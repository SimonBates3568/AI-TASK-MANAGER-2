import { NextResponse } from 'next/server';
import { classifyPriority } from '../../../lib/openai';

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description } = body;
  if (!title && !description) return NextResponse.json({ error: 'Missing input' }, { status: 400 });

  const priority = await classifyPriority(title || '', description || '');
  return NextResponse.json({ priority });
}
