import { db, goals, cards, substitutions, matches } from '@/db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Find the latest non-undone event across all event types
    const [latestGoal] = await db.select().from(goals)
      .where(and(eq(goals.matchId, id), eq(goals.isUndone, false)))
      .orderBy(desc(goals.createdAt)).limit(1);

    const [latestCard] = await db.select().from(cards)
      .where(and(eq(cards.matchId, id), eq(cards.isUndone, false)))
      .orderBy(desc(cards.createdAt)).limit(1);

    const [latestSub] = await db.select().from(substitutions)
      .where(and(eq(substitutions.matchId, id), eq(substitutions.isUndone, false)))
      .orderBy(desc(substitutions.createdAt)).limit(1);

    // Pick the most recent
    const candidates = [
      latestGoal && { type: 'goal', event: latestGoal, createdAt: new Date(latestGoal.createdAt!) },
      latestCard && { type: 'card', event: latestCard, createdAt: new Date(latestCard.createdAt!) },
      latestSub && { type: 'sub', event: latestSub, createdAt: new Date(latestSub.createdAt!) },
    ].filter(Boolean) as { type: string; event: { id: string }; createdAt: Date }[];

    if (candidates.length === 0) return NextResponse.json({ error: 'No events to undo' }, { status: 400 });

    candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const { type, event } = candidates[0];

    if (type === 'goal') {
      const g = event as typeof latestGoal;
      await db.update(goals).set({ isUndone: true }).where(eq(goals.id, g.id));
      // Revert score
      if (g.team === 'team_a') {
        await db.update(matches).set({ scoreA: sql`GREATEST(0, score_a - 1)` }).where(eq(matches.id, id));
      } else {
        await db.update(matches).set({ scoreB: sql`GREATEST(0, score_b - 1)` }).where(eq(matches.id, id));
      }
    } else if (type === 'card') {
      await db.update(cards).set({ isUndone: true }).where(eq(cards.id, event.id));
    } else {
      await db.update(substitutions).set({ isUndone: true }).where(eq(substitutions.id, event.id));
    }

    const [m] = await db.select().from(matches).where(eq(matches.id, id));
    return NextResponse.json({ success: true, type, scoreA: m.scoreA, scoreB: m.scoreB });
  } catch (e) {
    return NextResponse.json({ error: 'Undo failed' }, { status: 500 });
  }
}
