import 'server-only';
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    console.log('Failed to verify session')
    return null
  }
}

export async function createSession(userId: string) {
  const user = await prisma.user.findFirst({
    where: { uid: Number(userId) }
  })
  const uid = user?.uid;
  const uname = user?.uname;
  const uloc = user?.uloc;
  const userDetails = { uid, uname,uloc };
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userDetails, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getUserSession(){
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get('session')?.value;

  if(!sessionCookie) return null;

  const session = await decrypt(sessionCookie);

  return session?.userDetails as {uid: number; uname : string} | null;
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}


export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}