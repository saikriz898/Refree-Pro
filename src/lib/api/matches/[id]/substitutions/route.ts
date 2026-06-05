import { db, substitutions } from '@/db';
import { NextResponse } from '@/lib/next-mock';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [sub] = await db.insert(substitutions).values({
      matchId: id,
      team: body.team,
      playerOut: body.playerOut,
      playerIn: body.playerIn,
      minute: body.minute,
      elapsedMs: body.elapsedMs ?? null,
    }).returning();
    return NextResponse.json(sub, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
