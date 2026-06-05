import { db, goals, cards, substitutions, penaltyShootout, players, matchTimerState, matches, tournamentStandings, tournaments } from '@/db';
import { NextResponse } from '@/lib/next-mock';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Server-side security validation of the confirmation token
    if (body.confirmText !== 'CONFIRM') {
      return NextResponse.json({ error: 'Forbidden: Confirmation mismatch' }, { status: 403 });
    }

    // Clean up dependent tables first, then parent tables
    await db.delete(goals);
    await db.delete(cards);
    await db.delete(substitutions);
    await db.delete(penaltyShootout);
    await db.delete(players);
    await db.delete(matchTimerState);
    await db.delete(tournamentStandings);
    await db.delete(matches);
    await db.delete(tournaments);

    return NextResponse.json({ success: true, message: 'All match and tournament data has been cleared.' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed to clear database data', details: msg }, { status: 500 });
  }
}
