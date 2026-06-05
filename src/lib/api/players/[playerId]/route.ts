import { db, players, goals, cards, substitutions } from '@/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function PATCH(req: Request, { params }: { params: Promise<{ playerId: string }> }) {
  try {
    const { playerId } = await params;
    const body = await req.json();
    const [p] = await db.update(players).set({ name: body.name, jerseyNo: body.jerseyNo }).where(eq(players.id, playerId)).returning();
    return NextResponse.json(p);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ playerId: string }> }) {
  try {
    const { playerId } = await params;
    const [p] = await db.select().from(players).where(eq(players.id, playerId));
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check if player has any events
    const [goal] = await db.select().from(goals)
      .where(and(eq(goals.matchId, p.matchId), eq(goals.playerName, p.name)));
    if (goal) return NextResponse.json({ error: 'Player has recorded events' }, { status: 400 });

    await db.delete(players).where(eq(players.id, playerId));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
