import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceId, serviceName, link, quantity, charge, customer } = body;

    if (!serviceId || !serviceName || !link || !quantity || charge === undefined || !customer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getPool();

    // 1. Get connection from pool for transaction
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 2. Lock the user record and check balance
      const [userRows] = await connection.query(
        'SELECT balance FROM users WHERE username = ? FOR UPDATE',
        [customer]
      );

      if (!Array.isArray(userRows) || userRows.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = parseFloat((userRows[0] as any).balance || 0);
      const chargeAmount = parseFloat(charge);

      if (currentBalance < chargeAmount) {
        throw new Error('Insufficient balance');
      }

      // 3. Deduct balance
      const newBalance = currentBalance - chargeAmount;
      await connection.query(
        'UPDATE users SET balance = ? WHERE username = ?',
        [newBalance, customer]
      );

      // 4. Generate order ID and insert order
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      await connection.query(
        'INSERT INTO orders (id, customer, serviceId, serviceName, link, quantity, charge, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, customer, serviceId, serviceName, link, quantity, chargeAmount, 'Pending']
      );

      await connection.commit();

      console.log(`Order ${orderId} created successfully for ${customer}. Charge: ${chargeAmount}`);

      return NextResponse.json({ 
        success: true, 
        orderId, 
        balance: newBalance,
        message: `Order #${orderId} placed successfully!` 
      });

    } catch (txError: any) {
      await connection.rollback();
      console.error('Transaction failed:', txError);
      return NextResponse.json({ error: txError.message || 'Transaction failed' }, { status: 400 });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('SMM API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
