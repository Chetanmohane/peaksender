import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

type Action = 'cancel' | 'complete';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  const typedAction = action as Action;
  const statusMap: Record<Action, 'Canceled' | 'Completed'> = {
    cancel: 'Canceled',
    complete: 'Completed',
  };
  const newStatus = statusMap[typedAction];

  if (!newStatus) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const db = await getPool();
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [newStatus, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, status: newStatus });
  } catch (e) {
    console.error('API error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
