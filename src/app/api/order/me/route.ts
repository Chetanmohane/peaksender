import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const db = await getPool();
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE customer = ? ORDER BY createdAt DESC',
      [username]
    );

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
    console.error('Fetch user orders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
