"use server";

import { createSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';

export async function signup(formData: FormData) {
  try {
    const name = String(formData.get('name'));
    const email = String(formData.get('email'));
    const password = String(formData.get('password') || '');
    const ph = String(formData.get('ph'));
    const loc = String(formData.get('loc'));

    const apiRes = await apiClient.post<Record<string, unknown>>('/auth/signup', {
      name,
      uname: name,
      email,
      password,
      ph,
      loc,
    });

    const uid = Number(apiRes.data?.uid || apiRes.data?.id || Date.now());
    await createSession(String(uid), name, loc);
  } catch (error) {
    console.error("Signup error:", error);
  }

  redirect('/');
}
