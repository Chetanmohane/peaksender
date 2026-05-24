import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  // Simulate login
  console.log('User Login Attempt:', username);

  return NextResponse.json({ 
    success: true, 
    message: 'Login successful!' 
  });
}
