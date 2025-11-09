import { NextResponse } from 'next/server';
import { getSaltForJwt } from '@/lib/salt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const jwt = body.jwt as string | undefined;
    const sub = body.sub as string | undefined;
    if (!jwt) return NextResponse.json({ error: 'Missing jwt' }, { status: 400 });

    const salt = await getSaltForJwt(jwt, sub);
    return NextResponse.json({ salt });
  } catch (e: any) {
    console.error('[salt] fetch failed', e?.message || e);
    return NextResponse.json({ error: 'salt_fetch_failed', details: e?.message || String(e) }, { status: 502 });
  }
}
