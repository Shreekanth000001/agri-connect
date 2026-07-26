import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';
import { INITIAL_MESSAGES } from '@/app/chat/mockData';
import { ChatMessage } from '@/app/chat/types';

// In-memory store for dev/testing REST integration
const messageStore: Record<string, ChatMessage[]> = { ...INITIAL_MESSAGES };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const conversationMessages = messageStore[id] || [];

    return NextResponse.json(conversationMessages, { status: 200 });
  } catch (error) {
    console.error('Fetch Messages API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json(
        { message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { text, offer } = body;

    if (!text && !offer) {
      return NextResponse.json(
        { message: 'Message text or offer proposal is required.' },
        { status: 400 }
      );
    }

    const newMessage: ChatMessage = {
      id: `msg-api-${Date.now()}`,
      conversationId: id,
      senderId: session.uid,
      senderName: session.uname || 'You',
      senderRole: 'BUYER',
      text: text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      offer: offer || undefined,
    };

    if (!messageStore[id]) {
      messageStore[id] = [];
    }
    messageStore[id].push(newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Send Message API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error sending message' },
      { status: 500 }
    );
  }
}
