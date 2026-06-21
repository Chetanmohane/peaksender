import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, orders } = body;

    if (!customer || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'Missing customer or orders list' }, { status: 400 });
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
      
      // Calculate total cost
      let totalCost = 0;
      orders.forEach((o: any) => {
        totalCost += parseFloat(o.charge || 0);
      });

      if (currentBalance < totalCost) {
        throw new Error(`Insufficient balance! Total required: ₹${totalCost.toFixed(2)}, available: ₹${currentBalance.toFixed(2)}.`);
      }

      // 3. Deduct total cost
      const newBalance = currentBalance - totalCost;
      await connection.query(
        'UPDATE users SET balance = ? WHERE username = ?',
        [newBalance, customer]
      );

      // 4. Insert each order
      const placedOrders = [];
      for (const order of orders) {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        await connection.query(
          'INSERT INTO orders (id, customer, serviceId, serviceName, link, quantity, charge, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orderId, customer, order.serviceId, order.serviceName, order.link, order.quantity, order.charge, 'Pending']
        );
        placedOrders.push({
          orderId,
          serviceId: order.serviceId,
          serviceName: order.serviceName,
          link: order.link,
          quantity: order.quantity,
          charge: order.charge
        });
      }

      await connection.commit();

      console.log(`Mass orders processed successfully for ${customer}. Total charge: ${totalCost}`);

      return NextResponse.json({
        success: true,
        balance: newBalance,
        placedOrders
      });

    } catch (txError: any) {
      await connection.rollback();
      console.error('Mass order transaction failed:', txError);
      return NextResponse.json({ error: txError.message || 'Transaction failed' }, { status: 400 });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Mass order API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
