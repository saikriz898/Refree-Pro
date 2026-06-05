import { db, penaltyShootout } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await db.select().from(penaltyShootout).where(eq(penaltyShootout.matchId, id));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [p] = await db.insert(penaltyShootout).values({
      matchId: id,
      team: body.team,
      playerName: body.playerName,
      jerseyNo: body.jerseyNo ?? null,
      kickNumber: body.kickNumber,
      result: body.result,
    }).returning();
    return NextResponse.json(p, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
