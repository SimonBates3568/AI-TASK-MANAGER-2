// Demo sign-in endpoint has been removed. Keep this route to return 404 so any accidental calls fail safely.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: false, error: 'Demo sign-in removed' }, { status: 404 });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Demo sign-in removed' }, { status: 404 });
}
