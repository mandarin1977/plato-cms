import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

const PROTECTED_PATHS = ['/cms'];
const AUTH_PATHS = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  // 보호된 라우트: 미인증 시 로그인으로 리다이렉트
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 인증 페이지: 이미 로그인된 경우 대시보드로 리다이렉트
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (session) {
      return NextResponse.redirect(new URL('/cms', request.url));
    }
  }

  // CSRF 쿠키가 없으면 심어줌
  const response = NextResponse.next();
  const csrfCookie = request.cookies.get('plato_csrf')?.value;
  if (!csrfCookie) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    response.cookies.set('plato_csrf', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/cms/:path*', '/login', '/register'],
};
