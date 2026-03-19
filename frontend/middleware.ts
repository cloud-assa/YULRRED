export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/deals/:path*', '/admin/:path*', '/notifications/:path*'],
};
