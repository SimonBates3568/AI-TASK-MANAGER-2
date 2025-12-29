import { NextResponse } from 'next/server';
import { parseNaturalLanguageTask } from '../../../lib/nlp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;
    if (!text || typeof text !== 'string') return NextResponse.json({ error: 'Missing text' }, { status: 400 });

    const parsed = await parseNaturalLanguageTask(text);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('POST /api/nlp error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
