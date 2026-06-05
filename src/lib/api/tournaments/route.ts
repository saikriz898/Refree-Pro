import { db, tournaments } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';
import { cookies } from '@/lib/next-mock';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const deviceId = cookieStore.get('device_id')?.value;
    
    let query = db.select().from(tournaments).$dynamic();
    if (deviceId) query = query.where(eq(tournaments.deviceId, deviceId));
    
    const data = await query.orderBy(desc(tournaments.createdAt));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [t] = await db.insert(tournaments).values({
      name: body.name,
      venue: body.venue,
      startDate: body.startDate,
      endDate: body.endDate,
      status: 'active',
      deviceId: (await cookies()).get('device_id')?.value || null,
    }).returning();
    return NextResponse.json(t, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}
