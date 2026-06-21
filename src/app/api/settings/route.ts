import { NextResponse } from 'next/server';
import { getKV, setKV } from '@/lib/db';

export async function GET() {
  try {
    const settingsStr = await getKV('peaksender:settings');
    if (settingsStr) {
      return NextResponse.json(JSON.parse(settingsStr));
    }
    return NextResponse.json({});
  } catch (e) {
    console.error('GET settings API error:', e);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const settings = await req.json();
    await setKV('peaksender:settings', JSON.stringify(settings));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('POST settings API error:', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
