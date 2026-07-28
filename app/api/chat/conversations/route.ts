import { NextResponse, NextRequest } from 'next/server';
import { getUserSession, getAccessToken } from '@/lib/session';

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function GET(req: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in to view negotiations.' },
        { status: 401 }
      );
    }

    const token = await getAccessToken();
    const cookieHeader = req.headers.get('cookie') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Proxy request to FastAPI backend with Bearer token authentication
    const res = await fetch(`${FASTAPI_URL}/chat/conversations`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: `FastAPI backend GET ${FASTAPI_URL}/chat/conversations returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch Conversations API Proxy Error:', error);
    return NextResponse.json(
      { message: 'FastAPI Backend Connection Unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const token = await getAccessToken();
    const cookieHeader = req.headers.get('cookie') || '';
    const body = await req.json();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${FASTAPI_URL}/chat/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: `FastAPI backend POST ${FASTAPI_URL}/chat/conversations returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error('Create Conversation API Proxy Error:', error);
    return NextResponse.json(
      { message: 'FastAPI Backend Connection Unavailable' },
      { status: 503 }
    );
  }
}
