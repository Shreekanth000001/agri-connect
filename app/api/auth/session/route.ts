import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, username, userLoc, email, role, accessToken } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await createSession(
      String(userId),
      username,
      userLoc,
      email,
      role,
      accessToken
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Session Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
