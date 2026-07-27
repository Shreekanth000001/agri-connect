import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const secretKey = process.env.SESSION_SECRET || 'agri-secret-key-default-2026-antigravity';
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    console.log('Failed to verify session');
    return null;
  }
}

export async function createSession(
  userId: string,
  username?: string,
  userLoc?: string,
  email?: string,
  role?: string,
  accessToken?: string
) {
  const uid = Number(userId);
  const uemail = email || '';
  const uname = username || (uemail ? uemail.split('@')[0] : `User #${uid}`);
  const uloc = userLoc || 'India';
  const urole = role || (uname.toLowerCase().includes('farmer') ? 'FARMER' : 'BUYER');

  const userDetails = { uid, uname, uloc, uemail, role: urole };
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userDetails, accessToken: accessToken || '', expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getUserSession() {
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get('session')?.value;

  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);

  return session?.userDetails as { uid: number; uname: string; uloc?: string; uemail?: string; role?: string } | null;
}

export async function getAccessToken(): Promise<string | null> {
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get('session')?.value;

  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);
  return (session?.accessToken as string) || null;
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function logout() {
  await deleteSession();
  redirect('/');
}