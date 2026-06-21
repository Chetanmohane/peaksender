import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const db = await getPool();
    const [rows] = await db.query(
      'SELECT id, username, email, balance, role, status, createdAt FROM users ORDER BY id ASC'
    );

    const users = (rows as any[]).map(u => ({
      id: String(u.id),
      username: u.username,
      email: u.email,
      balance: parseFloat(u.balance || 0),
      status: u.status,
      role: u.role,
      createdAt: new Date(u.createdAt).toISOString().split('T')[0]
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, balance, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email and password are required' }, { status: 400 });
    }

    const db = await getPool();

    // 1. Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    // 2. Hash password with SHA-256
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // 3. Set balance and role defaults if not provided
    const startingBalance = balance !== undefined ? parseFloat(balance) : 0.00;
    const userRole = role || 'User';

    // 4. Insert new user into database
    await db.query(
      'INSERT INTO users (username, email, password, balance, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, startingBalance, userRole]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
