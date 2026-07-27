import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { apiClient } from '@/lib/api/apiClient';

export async function POST(req: Request) {
  try {
    const usercred = await req.json();
    const { email, password } = usercred;
    const cleanEmail = String(email || '').trim().toLowerCase();

    const apiRes = await apiClient.post<Record<string, unknown>>('/auth/login', {
      username: cleanEmail,
      email: cleanEmail,
      password,
    });

    if (apiRes.data) {
      const rawUser = (apiRes.data.user || apiRes.data) as Record<string, unknown>;
      const uid = Number(apiRes.data.user_id || rawUser.id || rawUser.uid || rawUser.user_id || 0);

      const uname = String(rawUser.name || rawUser.uname || rawUser.full_name || rawUser.username || cleanEmail.split('@')[0]);
      const uloc = String(rawUser.location || rawUser.uloc || 'India');
      const role = String(rawUser.role || (cleanEmail.includes('farmer') ? 'FARMER' : 'BUYER'));

      if (uid > 0) {
        const accessToken = String(apiRes.data.access_token || '');
        await createSession(String(uid), uname, uloc, cleanEmail, role, accessToken);
        return NextResponse.json("logged in", { status: 200 });
      }
    }

    if (apiRes.error && apiRes.error.includes('401')) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({ error: apiRes.error || "Login failed" }, { status: apiRes.status || 400 });
  } catch (error) {
    console.error("login auth error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}