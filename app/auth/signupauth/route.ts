import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { apiClient } from '@/lib/api/apiClient';

export async function POST(req: Request) {
  try {
    const userdetails = await req.json();
    const { uname, uemail, password, uphone, ugeo, uloc, role } = userdetails;

    const apiRes = await apiClient.post<Record<string, unknown>>('/auth/signup', {
      uname,
      name: uname,
      email: uemail,
      uemail,
      password,
      uphone,
      ugeo,
      uloc,
      role: role || 'BUYER',
    });

    if (apiRes.error || !apiRes.data) {
      return NextResponse.json(
        { error: apiRes.error || 'Signup failed' },
        { status: apiRes.status || 500 }
      );
    }

    const uid = Number(apiRes.data.uid || apiRes.data.id || apiRes.data.user_id || 0);
    if (uid <= 0) {
      return NextResponse.json(
        { error: 'Signup succeeded but no user ID was returned' },
        { status: 500 }
      );
    }

    await createSession(String(uid), uname, uloc, uemail, role || 'BUYER');

    return NextResponse.json({
      success: true,
      user: {
        uid,
        uname,
        uemail,
        uloc,
        role: role || 'BUYER',
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}