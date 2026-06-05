import { db, matchTimerState, matches } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const now = Date.now();
    await db.update(matchTimerState).set({
      isRunning: true,
      startedAtUnix: now,
      pausedAtUnix: null,
      totalPausedMs: 0,
      currentHalf: 3,
      extraStartedAtUnix: now,
      updatedAt: new Date(),
    }).where(eq(matchTimerState.matchId, id));
    await db.update(matches).set({ status: 'extra_time', extraTimeStartedAt: new Date() }).where(eq(matches.id, id));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
