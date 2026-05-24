import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  // Simulate user creation in DB
  console.log('New User Registered:', username);

  return NextResponse.json({ 
    success: true, 
    message: 'Registration successful! Redirecting...' 
  });
}
