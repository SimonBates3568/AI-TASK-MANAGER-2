import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
  const obj: Record<string,string> = {};
  settings.forEach((s: any) => obj[s.key] = s.value);
    return NextResponse.json(obj);
  } catch (err) {
    console.error('GET /api/settings error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    // body expected to be { key: string, value: string }
    const { key, value } = body;
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (existing) {
      const updated = await prisma.setting.update({ where: { key }, data: { value } });
      return NextResponse.json(updated);
    }
    const created = await prisma.setting.create({ data: { key, value } });
    return NextResponse.json(created);
  } catch (err) {
    console.error('PUT /api/settings error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
