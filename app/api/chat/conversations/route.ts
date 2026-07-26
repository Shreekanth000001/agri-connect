import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';
import { INITIAL_CONVERSATIONS } from '@/app/chat/mockData';

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in to view negotiations.' },
        { status: 401 }
      );
    }

    // Proxy or return conversations data
    return NextResponse.json(INITIAL_CONVERSATIONS, { status: 200 });
  } catch (error) {
    console.error('Fetch Conversations API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error fetching conversations' },
      { status: 500 }
    );
  }
}
