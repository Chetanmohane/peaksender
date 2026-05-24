// src/app/api/admin/orders/[id]/[action]/route.ts
import { updateOrderStatus } from '@/lib/orders';
import { NextResponse } from 'next/server';

type Action = 'cancel' | 'complete';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  const typedAction = action as Action;
  const statusMap: Record<Action, 'Canceled' | 'Completed'> = {
    cancel: 'Canceled',
    complete: 'Completed',
  };
  const newStatus = statusMap[typedAction];

  try {
    const updated = updateOrderStatus(id, newStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error('API error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
