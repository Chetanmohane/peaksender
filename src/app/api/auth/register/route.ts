import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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

    // 3. Determine role based on email
    const role = email.toLowerCase() === 'peaksender27@gmail.com' ? 'Admin' : 'User';

    // 4. Insert new user into database
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    console.log('New User Registered in MySQL:', username);

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Redirecting...',
      user: {
        name: username,
        email: email,
        balance: 0.00,
        role: role
      }
    });

  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
