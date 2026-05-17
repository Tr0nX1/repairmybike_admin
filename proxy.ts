import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('rmb_token')?.value;
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Path: ${pathname}, Token present: ${!!token}`);

  // Protect all /dashboard/* routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('[Middleware] No token found, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle /login redirect if already authenticated
  if (pathname === '/login' && token) {
    console.log('[Middleware] Token found on login page, redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
