import { db, goals, matches } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [goal] = await db.insert(goals).values({
      matchId: id,
      playerName: body.playerName,
      jerseyNo: body.jerseyNo ?? null,
      team: body.team,
      goalType: body.goalType ?? 'normal',
      minute: body.minute,
      elapsedMs: body.elapsedMs ?? null,
    }).returning();

    // Update score atomically
    if (body.team === 'team_a') {
      await db.update(matches).set({ scoreA: sql`score_a + 1` }).where(eq(matches.id, id));
    } else {
      await db.update(matches).set({ scoreB: sql`score_b + 1` }).where(eq(matches.id, id));
    }

    const [m] = await db.select().from(matches).where(eq(matches.id, id));
    return NextResponse.json({ goal, scoreA: m.scoreA, scoreB: m.scoreB }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
