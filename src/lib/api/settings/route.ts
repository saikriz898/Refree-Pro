import { db, appSettings } from '@/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from '@/lib/next-mock';

export async function GET() {
  try {
    const settings = await db.select().from(appSettings);
    const map = Object.fromEntries(settings.map((s) => [s.settingKey, s.settingValue]));
    return NextResponse.json(map);
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();
    const [existing] = await db.select().from(appSettings).where(eq(appSettings.settingKey, key));
    if (existing) {
      await db.update(appSettings).set({ settingValue: value, updatedAt: new Date() }).where(eq(appSettings.settingKey, key));
    } else {
      await db.insert(appSettings).values({ settingKey: key, settingValue: value });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
