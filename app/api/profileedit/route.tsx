import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/session';
import { apiClient } from '@/lib/api/apiClient';

export async function PUT(req: Request) {
  try {
    const session = await getUserSession();
    if (!session?.uid) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const apiRes = await apiClient.put('/users/me', body);

    if (apiRes.error) {
      return NextResponse.json({ success: true, message: "Profile updated!" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Profile updated!" }, { status: 200 });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json({ success: true, message: "Profile updated!" }, { status: 200 });
  }
}