'use client';
import { useLayoutEffect } from 'react';
import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';
import { setAuthToken } from '@/lib/api';

/**
 * AuthSync — renders null, but fires useLayoutEffect on every session change.
 * useLayoutEffect runs synchronously before ALL useEffect hooks in the app,
 * so _authToken is always populated before any page fires an API call.
 */
function AuthSync() {
  const { data: session } = useSession();
  useLayoutEffect(() => {
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
