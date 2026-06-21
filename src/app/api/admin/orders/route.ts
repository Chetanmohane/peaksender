import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM orders ORDER BY createdAt DESC');

    const orders = (rows as any[]).map(r => ({
      id: r.id,
      serviceId: r.serviceId,
      serviceName: r.serviceName,
      link: r.link,
      quantity: r.quantity,
      charge: parseFloat(r.charge || 0),
      status: r.status,
      createdAt: new Date(r.createdAt).toISOString().replace('T', ' ').slice(0, 16)
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
