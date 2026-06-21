import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username/Email and password are required' }, { status: 400 });
    }

    const db = await getPool();

    // 1. Find user by username or email
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Invalid username/email or password' }, { status: 401 });
    }

    const user = rows[0] as any;

    // 2. Validate password
    const incomingHash = crypto.createHash('sha256').update(password).digest('hex');
    if (incomingHash !== user.password) {
      return NextResponse.json({ error: 'Invalid username/email or password' }, { status: 401 });
    }

    // 3. Check if banned
    if (user.status === 'Banned') {
      return NextResponse.json({ error: 'Your account has been suspended' }, { status: 403 });
    }

    console.log('User Login Successful in MySQL:', user.username);

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful!',
      user: {
        name: user.username,
        email: user.email,
        balance: parseFloat(user.balance || 0),
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
