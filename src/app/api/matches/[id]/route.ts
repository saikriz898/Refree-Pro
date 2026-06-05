import { db, matches, players, goals, cards, substitutions, matchTimerState } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [m] = await db.select().from(matches).where(eq(matches.id, id));
    if (!m) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [ps, gs, cs, ss, ts] = await Promise.all([
      db.select().from(players).where(eq(players.matchId, id)),
      db.select().from(goals).where(eq(goals.matchId, id)),
      db.select().from(cards).where(eq(cards.matchId, id)),
      db.select().from(substitutions).where(eq(substitutions.matchId, id)),
      db.select().from(matchTimerState).where(eq(matchTimerState.matchId, id)),
    ]);

    return NextResponse.json({ match: m, players: ps, goals: gs, cards: cs, substitutions: ss, timer: ts[0] ?? null });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Convert timestamp strings to Date objects for Drizzle
    if (body.completedAt) body.completedAt = new Date(body.completedAt);
    if (body.startedAt) body.startedAt = new Date(body.startedAt);
    if (body.halftimeAt) body.halftimeAt = new Date(body.halftimeAt);
    if (body.secondHalfStartedAt) body.secondHalfStartedAt = new Date(body.secondHalfStartedAt);
    if (body.extraTimeStartedAt) body.extraTimeStartedAt = new Date(body.extraTimeStartedAt);

    const [m] = await db.update(matches).set(body).where(eq(matches.id, id)).returning();
    return NextResponse.json(m);
  } catch (e: any) {
    console.error('PATCH Match Error:', e);
    return NextResponse.json({ error: 'Failed', detail: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(matches).where(eq(matches.id, id));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
