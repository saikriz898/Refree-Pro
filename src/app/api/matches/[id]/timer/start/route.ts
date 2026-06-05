import { db, matchTimerState, matches } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const now = Date.now();

    const [existing] = await db.select().from(matchTimerState).where(eq(matchTimerState.matchId, id));

    if (existing) {
      // Resuming: accumulate paused time
      const additionalPaused = existing.pausedAtUnix
        ? now - (existing.pausedAtUnix as number)
        : 0;
      const newTotalPaused = (existing.totalPausedMs as number ?? 0) + additionalPaused;

      await db.update(matchTimerState).set({
        isRunning: true,
        pausedAtUnix: null,
        totalPausedMs: newTotalPaused,
        updatedAt: new Date(),
      }).where(eq(matchTimerState.matchId, id));
    } else {
      // First start
      await db.insert(matchTimerState).values({
        matchId: id,
        startedAtUnix: now,
        isRunning: true,
        totalPausedMs: 0,
        currentHalf: 1,
        half1StartedAtUnix: now,
        updatedAt: new Date(),
      });
      await db.update(matches).set({ status: 'live', startedAt: new Date() }).where(eq(matches.id, id));
    }

    const [t] = await db.select().from(matchTimerState).where(eq(matchTimerState.matchId, id));
    return NextResponse.json(t);
  } catch (e: any) {
    console.error('Timer start error:', e);
    return NextResponse.json({ error: e.message || 'Failed', detail: String(e) }, { status: 500 });
  }
}
