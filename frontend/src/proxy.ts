import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/courses',
  '/test-series',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/refund',
  '/cookies',
  '/free-tests',
  '/current-affairs',
  '/blog',
  '/careers',
  '/help',
];

// Auth pages - redirect to dashboard if already logged in
const AUTH_ROUTES = ['/login'];

// Admin auth page - redirect to admin if already logged in
const ADMIN_AUTH_ROUTES = ['/admin/login'];

// Protected routes - require login
const PROTECTED_ROUTES = ['/dashboard'];

// Admin routes - require admin login
const ADMIN_ROUTES = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has refresh token cookie (indicates logged in)
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isLoggedIn = !!refreshToken;

  // 1. Public routes with dynamic segments (e.g., /courses/[slug])
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. User auth page (/login) - redirect to dashboard if already logged in
  if (AUTH_ROUTES.some(route => pathname === route)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 3. Admin auth page (/admin/login) - let client handle role check
  if (ADMIN_AUTH_ROUTES.some(route => pathname === route)) {
    // Client-side useRedirectIfAdmin will handle admin role check
    return NextResponse.next();
  }

  // 4. Protected user routes (/dashboard/*) - redirect to login if not logged in
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Admin routes (/admin/*) - redirect to admin login if not logged in
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  const isAdminAuthRoute = ADMIN_AUTH_ROUTES.some(route => pathname === route);

  if (isAdminRoute && !isAdminAuthRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Client-side useRequireAdmin will verify admin role
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon, images, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.ico$|.*\\.webp$).*)',
  ],
};
