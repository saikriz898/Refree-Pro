import { db, tournamentStandings } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await db.select().from(tournamentStandings)
      .where(eq(tournamentStandings.tournamentId, id));
    const sorted = data.sort((a, b) =>
      (b.points ?? 0) - (a.points ?? 0) ||
      (b.headToHeadPts ?? 0) - (a.headToHeadPts ?? 0) ||
      (b.headToHeadGd ?? 0) - (a.headToHeadGd ?? 0) ||
      (b.goalDifference ?? 0) - (a.goalDifference ?? 0) ||
      (b.goalsFor ?? 0) - (a.goalsFor ?? 0)
    );
    return NextResponse.json(sorted);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
