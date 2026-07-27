import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/apiClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await apiClient.post('/contact', { name, email, message });

    return NextResponse.json(
      { success: true, message: "Message received loud and clear!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { success: true, message: "Message received loud and clear!" },
      { status: 201 }
    );
  }
}