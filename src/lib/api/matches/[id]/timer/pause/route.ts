import { db, matchTimerState } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const now = Date.now();
    await db.update(matchTimerState).set({
      isRunning: false,
      pausedAtUnix: now,
      updatedAt: new Date(),
    }).where(eq(matchTimerState.matchId, id));
    const [t] = await db.select().from(matchTimerState).where(eq(matchTimerState.matchId, id));
    return NextResponse.json(t);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
