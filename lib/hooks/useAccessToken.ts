"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

let cachedToken: string | null = null;
let fetchPromise: Promise<string | null> | null = null;

async function fetchTokenFromServer(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/token', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = data.token || null;
    return cachedToken;
  } catch {
    return null;
  }
}

/** Returns the FastAPI access_token from the session. Caches across components. */
export function useAccessToken() {
  const [token, setToken] = useState<string | null>(cachedToken);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (cachedToken) {
      setToken(cachedToken);
      return;
    }

    // Deduplicate concurrent fetches
    if (!fetchPromise) {
      fetchPromise = fetchTokenFromServer().finally(() => {
        fetchPromise = null;
      });
    }

    fetchPromise.then((t) => {
      if (mounted.current) setToken(t);
    });

    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshToken = useCallback(async () => {
    cachedToken = null;
    const t = await fetchTokenFromServer();
    setToken(t);
    return t;
  }, []);

  return { token, refreshToken };
}

/** Get cached token synchronously (for non-hook contexts) */
export function getCachedAccessToken(): string | null {
  return cachedToken;
}
