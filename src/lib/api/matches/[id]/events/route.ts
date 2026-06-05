import { db, goals, cards, substitutions } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [gs, cs, ss] = await Promise.all([
      db.select().from(goals).where(eq(goals.matchId, id)),
      db.select().from(cards).where(eq(cards.matchId, id)),
      db.select().from(substitutions).where(eq(substitutions.matchId, id)),
    ]);

    const events = [
      ...gs.map((g) => ({ ...g, eventType: 'goal' })),
      ...cs.map((c) => ({ ...c, eventType: 'card' })),
      ...ss.map((s) => ({ ...s, eventType: 'sub' })),
    ].sort((a, b) => {
      if (a.elapsedMs !== null && b.elapsedMs !== null && a.elapsedMs !== undefined && b.elapsedMs !== undefined) {
        return a.elapsedMs - b.elapsedMs;
      }
      return a.minute - b.minute;
    });

    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
