import { apiClient, ApiClientResponse } from './apiClient';

export interface SignupParams {
  uname: string;
  uemail: string;
  password: string;
  uphone?: string;
  ugeo?: string;
  uloc?: string;
  role: 'FARMER' | 'BUYER';
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  user_id?: number;
  user?: {
    id?: number;
    uid?: number;
    name?: string;
    email?: string;
    role?: string;
    location?: string;
  };
  error?: string;
}

/**
 * Save access_token to client storage and document.cookie
 */
export function saveClientAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('agri_access_token', token);
    document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
}

/**
 * Perform direct signup call to FastAPI backend using centralized apiClient (NEXT_PUBLIC_API_URL)
 */
export async function signupUser(params: SignupParams): Promise<ApiClientResponse<AuthResponse>> {
  const cleanEmail = params.uemail.trim().toLowerCase();
  const payload = {
    username: cleanEmail,
    email: cleanEmail,
    uemail: cleanEmail,
    name: params.uname,
    uname: params.uname,
    password: params.password,
    uphone: params.uphone,
    ugeo: params.ugeo,
    uloc: params.uloc,
    role: params.role,
  };

  const res = await apiClient.post<AuthResponse>('/auth/register', payload);

  if (res.data) {
    const rawUser = (res.data.user || res.data) as Record<string, unknown>;
    const token = String(res.data.access_token || res.data.token_type || '');
    if (token && token !== 'bearer') {
      saveClientAccessToken(token);
    }

    const uid = Number(res.data.user_id || rawUser.id || rawUser.uid || rawUser.user_id || 0);

    // Synchronize HTTP-only server session cookie
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: String(uid || 1),
        username: params.uname,
        userLoc: params.uloc || 'India',
        email: cleanEmail,
        role: params.role,
        accessToken: token && token !== 'bearer' ? token : '',
      }),
    }).catch(() => {});
  }

  return res;
}

/**
 * Perform direct login call to FastAPI backend using centralized apiClient (NEXT_PUBLIC_API_URL)
 */
export async function loginUser(params: LoginParams): Promise<ApiClientResponse<AuthResponse>> {
  const cleanEmail = params.email.trim().toLowerCase();
  const payload = {
    username: cleanEmail,
    email: cleanEmail,
    password: params.password,
  };

  const res = await apiClient.post<AuthResponse>('/auth/login', payload);

  if (res.data) {
    const rawUser = (res.data.user || res.data) as Record<string, unknown>;
    const token = String(res.data.access_token || '');
    if (token) {
      saveClientAccessToken(token);
    }

    const uid = Number(res.data.user_id || rawUser.id || rawUser.uid || rawUser.user_id || 0);
    const uname = String(rawUser.name || rawUser.uname || rawUser.full_name || cleanEmail.split('@')[0]);
    const uloc = String(rawUser.location || rawUser.uloc || 'India');
    const role = String(rawUser.role || (cleanEmail.includes('farmer') ? 'FARMER' : 'BUYER'));

    // Synchronize HTTP-only server session cookie
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: String(uid || 1),
        username: uname,
        userLoc: uloc,
        email: cleanEmail,
        role,
        accessToken: token,
      }),
    }).catch(() => {});
  }

  return res;
}
