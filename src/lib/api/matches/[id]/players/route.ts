import { db, players } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await db.select().from(players).where(eq(players.matchId, id));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [p] = await db.insert(players).values({
      matchId: id,
      team: body.team,
      name: body.name,
      jerseyNo: body.jerseyNo ?? null,
    }).returning();
    return NextResponse.json(p, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
