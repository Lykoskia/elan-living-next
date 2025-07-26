import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE } from '@/lib/api-client';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Only handle /hr/* routes, nothing else
  if (pathname === `/${DEFAULT_LOCALE}`) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const newPath = pathname.replace(`/${DEFAULT_LOCALE}/`, '/');
    return NextResponse.redirect(new URL(newPath, request.url));
  }
  
  // Don't redirect anything else
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|.*\\..*).*)',
  ],
};