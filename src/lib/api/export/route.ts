import { db, tournaments, matches, players, goals, cards, substitutions, penaltyShootout, appSettings } from '@/db';
import { NextResponse } from '@/lib/next-mock';

export async function GET() {
  try {
    const [t, m, p, g, c, s, pen, settings] = await Promise.all([
      db.select().from(tournaments),
      db.select().from(matches),
      db.select().from(players),
      db.select().from(goals),
      db.select().from(cards),
      db.select().from(substitutions),
      db.select().from(penaltyShootout),
      db.select().from(appSettings),
    ]);
    return NextResponse.json({ tournaments: t, matches: m, players: p, goals: g, cards: c, substitutions: s, penalties: pen, settings });
  } catch (e) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
