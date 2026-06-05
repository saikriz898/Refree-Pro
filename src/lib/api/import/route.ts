import { db, tournaments, matches, players, goals, cards, substitutions } from '@/db';
import { NextResponse } from '@/lib/next-mock';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const results = { imported: 0, failed: 0, errors: [] as string[] };

    if (body.tournaments) {
      for (const t of body.tournaments) {
        try {
          await db.insert(tournaments).values(t).onConflictDoNothing();
          results.imported++;
        } catch { results.failed++; }
      }
    }

    if (body.matches) {
      for (const m of body.matches) {
        try {
          await db.insert(matches).values(m).onConflictDoNothing();
          results.imported++;
        } catch { results.failed++; }
      }
    }

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
