import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { balance } = body;

    if (balance === undefined) {
      return NextResponse.json({ error: 'Balance is required' }, { status: 400 });
    }

    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      return NextResponse.json({ error: 'Invalid balance value' }, { status: 400 });
    }

    const db = await getPool();
    const [result] = await db.query(
      'UPDATE users SET balance = ? WHERE id = ?',
      [parsedBalance, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, balance: parsedBalance });
  } catch (error) {
    console.error('Update user balance error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
