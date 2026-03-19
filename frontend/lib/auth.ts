import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        // Parse expiry from the backend JWT payload
        try {
          const payload = JSON.parse(
            Buffer.from((user as any).accessToken.split('.')[1], 'base64').toString(),
          );
          token.accessTokenExpires = payload.exp * 1000; // ms
        } catch {
          token.accessTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000;
        }
      }
      // If backend token is still valid, return as-is
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      // Backend token expired — signal frontend to re-login
      return { ...token, error: 'AccessTokenExpired' };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).accessToken = token.error ? null : token.accessToken;
        (session as any).error = token.error ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name: string; role: string };
    accessToken: string;
  }
}
