import { db, matches } from '@/db';
import { eq, desc, and, SQL } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';
import { cookies } from '@/lib/next-mock';
import { neon } from '@/lib/next-mock';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const tournamentId = url.searchParams.get('tournamentId');

    const cookieStore = await cookies();
    const deviceId = cookieStore.get('device_id')?.value;

    let conditions: (SQL<unknown> | undefined)[] = [];
    if (status) conditions.push(eq(matches.status, status));
    if (tournamentId) conditions.push(eq(matches.tournamentId, tournamentId));
    if (deviceId) conditions.push(eq(matches.deviceId, deviceId));

    const finalCondition = conditions.length > 0 ? and(...conditions) : undefined;
    let query = db.select().from(matches).$dynamic();
    if (finalCondition) query = query.where(finalCondition);

    const data = await query.orderBy(desc(matches.createdAt));

    // Sort: running matches first (live, halftime, extra_time), then scheduled, then completed, then others.
    // Within same priority, sort by createdAt descending.
    const getStatusPriority = (s: string) => {
      if (['live', 'halftime', 'extra_time'].includes(s)) return 1;
      if (s === 'scheduled') return 2;
      if (s === 'completed') return 3;
      return 4;
    };

    data.sort((a, b) => {
      const pA = getStatusPriority(a.status ?? 'scheduled');
      const pB = getStatusPriority(b.status ?? 'scheduled');
      if (pA !== pB) return pA - pB;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Failed', detail: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const missing = ['venue', 'matchDate', 'matchTime', 'teamA', 'teamB', 'squadFormat'].filter(f => !body[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }
    if (!body.matchNumber || isNaN(body.matchNumber)) {
      return NextResponse.json({ error: 'matchNumber must be a valid integer' }, { status: 400 });
    }

    // Sanitize nullable fields — empty string must become null
    const tournamentId = body.tournamentId && String(body.tournamentId).trim() !== '' ? String(body.tournamentId).trim() : null;
    const refereeName = body.refereeName && String(body.refereeName).trim() !== '' ? String(body.refereeName).trim() : null;
    const extraTime = body.extraTime !== null && body.extraTime !== undefined && body.extraTime !== '' ? Number(body.extraTime) : null;

    const cookieStore = await cookies();
    const deviceId = cookieStore.get('device_id')?.value;

    // Use raw neon SQL to avoid any ORM type coercion issues
    const sql = neon(process.env.DATABASE_URL!);

    // Check for slot booking conflict (same date, time, and venue)
    const existingConflicts = await sql`
      SELECT id FROM matches 
      WHERE match_date = ${body.matchDate} 
        AND match_time = ${body.matchTime} 
        AND LOWER(TRIM(venue)) = LOWER(TRIM(${body.venue}))
        AND device_id = ${deviceId}
    `;

    if (existingConflicts && existingConflicts.length > 0) {
      return NextResponse.json({ 
        error: 'Slot conflict', 
        detail: 'This time slot at the selected venue is already booked for another match.' 
      }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO matches (
        tournament_id, match_number, match_date, match_time, venue,
        referee_name, team_a, team_b, team_a_color, team_b_color,
        squad_format, match_duration, break_duration, extra_time, device_id
      ) VALUES (
        ${tournamentId}, ${Number(body.matchNumber)}, ${body.matchDate}, ${body.matchTime}, ${body.venue.trim()},
        ${refereeName}, ${body.teamA.trim()}, ${body.teamB.trim()}, ${body.teamAColor ?? '#0F8A5F'}, ${body.teamBColor ?? '#E74C3C'},
        ${body.squadFormat}, ${Number(body.matchDuration)}, ${Number(body.breakDuration)}, ${extraTime}, ${deviceId}
      ) RETURNING *
    `;

    const m = rows[0];

    // Insert players if provided
    if (body.players && Array.isArray(body.players) && body.players.length > 0) {
      for (const p of body.players) {
        if (!p.name?.trim()) continue;
        await sql`
          INSERT INTO players (match_id, team, name, jersey_no)
          VALUES (${m.id}, ${p.team}, ${p.name.trim()}, ${p.jerseyNo ? Number(p.jerseyNo) : null})
        `;
      }
    }

    return NextResponse.json(m, { status: 201 });
  } catch (e: unknown) {
    const err = e as Record<string, unknown>;
    const msg = err?.message ?? err?.toString?.() ?? 'Unknown error';
    const detail = err?.cause ?? err?.code ?? '';
    console.error('[POST /api/matches] Full error:', JSON.stringify(err, null, 2));
    return NextResponse.json({ error: 'Failed to create match', detail: `${msg} ${detail}` }, { status: 500 });
  }
}
