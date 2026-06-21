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

    // 1. Get user balance
    const [userRows] = await db.query(
      'SELECT balance FROM users WHERE username = ?',
      [username]
    );

    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 444 });
    }

    const balance = parseFloat((userRows[0] as any).balance || 0);

    // 2. Get user total orders count
    const [orderRows] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE customer = ?',
      [username]
    );

    const totalOrders = (orderRows as any[])[0]?.count || 0;

    return NextResponse.json({
      success: true,
      balance,
      totalOrders
    });

  } catch (error) {
    console.error('Fetch user stats API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
