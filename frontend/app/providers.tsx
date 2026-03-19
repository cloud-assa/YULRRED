'use client';
import { useLayoutEffect } from 'react';
import { SessionProvider as NextAuthSessionProvider, useSession, signOut } from 'next-auth/react';
import { setAuthToken } from '@/lib/api';

function AuthSync() {
  const { data: session } = useSession();
  useLayoutEffect(() => {
    if ((session as any)?.error === 'AccessTokenExpired') {
      // Backend JWT expired — clear token and redirect to login
      setAuthToken(null);
      signOut({ callbackUrl: '/login' });
      return;
    }
    setAuthToken((session as any)?.accessToken ?? null);
  }, [session]);
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
