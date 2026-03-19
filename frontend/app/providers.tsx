'use client';
import { useEffect } from 'react';
import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { setAuthToken } from '@/lib/api';

// Keeps the module-level axios token in sync with NextAuth session.
// Must be a child of NextAuthSessionProvider to use useSession().
function AuthSync() {
  const { data: session } = useSession();
  useEffect(() => {
    setAuthToken((session as any)?.accessToken ?? null);
  }, [(session as any)?.accessToken]);
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthSync />
      {children}
    </NextAuthSessionProvider>
  );
}
