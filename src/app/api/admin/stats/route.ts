import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const db = await getPool();

    // 1. Get total sales (sum of charge)
    const [salesRows] = await db.query('SELECT SUM(charge) as totalSales FROM orders');
    const totalSales = parseFloat((salesRows as any[])[0]?.totalSales || 0);

    // 2. Get total users count
    const [usersRows] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    const totalUsers = (usersRows as any[])[0]?.totalUsers || 0;

    // 3. Get total orders count
    const [ordersRows] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
    const totalOrders = (ordersRows as any[])[0]?.totalOrders || 0;

    // 4. Get recent 5 global orders
    const [recentRows] = await db.query('SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5');
    const recentOrders = (recentRows as any[]).map(r => ({
      id: r.id,
      serviceId: r.serviceId,
      serviceName: r.serviceName,
      link: r.link,
      quantity: r.quantity,
      charge: parseFloat(r.charge || 0),
      status: r.status,
      createdAt: new Date(r.createdAt).toISOString().replace('T', ' ').slice(0, 16)
    }));

    return NextResponse.json({
      success: true,
      totalSales,
      totalUsers,
      totalOrders,
      pendingTickets: 12, // Mock tickets count as there is no tickets table
      recentOrders
    });

  } catch (error) {
    console.error('Fetch admin stats API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
