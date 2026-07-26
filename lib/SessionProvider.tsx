"use client"
import { createContext, useContext } from 'react';
import { UserSession } from '@/lib/definitions';

const SessionContext = createContext<UserSession | null>(null);

export function SessionProvider({ children, session }: { children: React.ReactNode; session: UserSession | null }) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useUser() {
  return useContext(SessionContext);
}