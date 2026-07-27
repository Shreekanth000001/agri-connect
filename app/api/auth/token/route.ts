import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/session';

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ token });
}
