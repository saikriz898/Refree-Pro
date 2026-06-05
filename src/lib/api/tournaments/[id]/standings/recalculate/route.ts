import { db, matches, goals, tournamentStandings } from '@/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tournamentId } = await params;

    const completedMatches = await db.select().from(matches)
      .where(and(eq(matches.tournamentId, tournamentId), eq(matches.status, 'completed')));

    // Build standings map
    const statsMap: Record<string, {
      played: number; won: number; drawn: number; lost: number;
      goalsFor: number; goalsAgainst: number; points: number;
    }> = {};

    for (const m of completedMatches) {
      const scoreA = m.scoreA ?? 0;
      const scoreB = m.scoreB ?? 0;
      for (const [team, scored, conceded] of [[m.teamA, scoreA, scoreB], [m.teamB, scoreB, scoreA]] as [string, number, number][]) {
        if (!statsMap[team]) statsMap[team] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        const s = statsMap[team];
        s.played++;
        s.goalsFor += scored;
        s.goalsAgainst += conceded;
        if (scored > conceded) { s.won++; s.points += 3; }
        else if (scored === conceded) { s.drawn++; s.points += 1; }
        else s.lost++;
      }
    }

    // Upsert standings
    for (const [teamName, s] of Object.entries(statsMap)) {
      const existing = await db.select().from(tournamentStandings)
        .where(and(eq(tournamentStandings.tournamentId, tournamentId), eq(tournamentStandings.teamName, teamName)));

      const data = {
        tournamentId,
        teamName,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalsFor - s.goalsAgainst,
        points: s.points,
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(tournamentStandings).set(data)
          .where(and(eq(tournamentStandings.tournamentId, tournamentId), eq(tournamentStandings.teamName, teamName)));
      } else {
        await db.insert(tournamentStandings).values(data);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Recalculation failed' }, { status: 500 });
  }
}
