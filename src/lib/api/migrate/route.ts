import { ensureTables } from '@/db';
import { NextResponse } from '@/lib/next-mock';

export async function GET() {
  try {
    await ensureTables();
    return NextResponse.json({ success: true, message: 'All tables ready' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST() {
  try {
    await ensureTables();
    return NextResponse.json({ success: true, message: 'All tables ready' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
