import { db, tournaments, matches, goals, cards, tournamentStandings } from '@/db';
import { eq, and, count } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [t] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const matchList = await db.select().from(matches).where(eq(matches.tournamentId, id));
    const standings = await db.select().from(tournamentStandings).where(eq(tournamentStandings.tournamentId, id));

    // Top scorers
    const scorers = await db.select().from(goals)
      .where(and(eq(goals.isUndone, false)));

    return NextResponse.json({ tournament: t, matches: matchList, standings, scorers });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [t] = await db.update(tournaments).set(body).where(eq(tournaments.id, id)).returning();
    return NextResponse.json(t);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(tournaments).where(eq(tournaments.id, id));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
