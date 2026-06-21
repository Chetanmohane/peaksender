import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const db = await getPool();

    if (username) {
      const [rows] = await db.query(
        'SELECT * FROM deposits WHERE customer = ? ORDER BY date DESC',
        [username]
      );
      return NextResponse.json(rows);
    } else {
      const [rows] = await db.query(
        'SELECT * FROM deposits ORDER BY date DESC'
      );
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error('Fetch deposits API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, customer, method, amount, transactionId, status } = body;

    if (!id || !customer || !method || !amount || !transactionId) {
      return NextResponse.json({ error: 'Missing deposit details' }, { status: 400 });
    }

    const db = await getPool();
    await db.query(
      'INSERT INTO deposits (id, customer, method, amount, transactionId, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, customer, method, amount, transactionId, status || 'Pending']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create deposit API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body; // action is 'Approve' or 'Reject'

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing deposit ID or action' }, { status: 400 });
    }

    const db = await getPool();

    // 1. Fetch deposit to get details
    const [depRows] = await db.query('SELECT * FROM deposits WHERE id = ?', [id]);
    if (!Array.isArray(depRows) || depRows.length === 0) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 444 });
    }
    const dep = depRows[0] as any;

    if (dep.status !== 'Pending') {
      return NextResponse.json({ error: 'Deposit is already processed' }, { status: 400 });
    }

    if (action === 'Approve') {
      // 2. Fetch customer to get current balance
      const [userRows] = await db.query('SELECT balance FROM users WHERE username = ?', [dep.customer]);
      if (!Array.isArray(userRows) || userRows.length === 0) {
        return NextResponse.json({ error: 'Customer user not found' }, { status: 444 });
      }
      const currentBalance = parseFloat((userRows[0] as any).balance || 0);
      const newBalance = currentBalance + parseFloat(dep.amount);

      // 3. Update customer balance in database
      await db.query('UPDATE users SET balance = ? WHERE username = ?', [newBalance, dep.customer]);

      // 4. Update deposit status to Completed
      await db.query('UPDATE deposits SET status = ? WHERE id = ?', ['Completed', id]);

      return NextResponse.json({ success: true, message: 'Deposit approved and user credited.' });
    } else if (action === 'Reject') {
      // 4. Update deposit status to Rejected
      await db.query('UPDATE deposits SET status = ? WHERE id = ?', ['Rejected', id]);
      return NextResponse.json({ success: true, message: 'Deposit rejected.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update deposit API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
