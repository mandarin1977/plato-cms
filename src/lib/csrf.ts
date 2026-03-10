import { NextRequest, NextResponse } from 'next/server';

const CSRF_COOKIE_NAME = 'plato_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * API 라우트에서 CSRF 검증
 * - Origin 헤더 검증
 * - Double Submit Cookie (쿠키 vs 헤더 토큰 비교)
 *
 * 검증 실패 시 403 Response 반환, 성공 시 null 반환
 */
export function verifyCsrfForApi(request: NextRequest): NextResponse | null {
  // 외부 API 요청 (x-api-key)은 CSRF 검증 제외
  if (request.headers.get('x-api-key')) {
    return null;
  }

  // 1) Origin 헤더 검증
  const origin = request.headers.get('origin');
  if (origin) {
    const allowedOrigin = new URL(request.url).origin;
    if (origin !== allowedOrigin) {
      return NextResponse.json(
        { error: 'CSRF 검증 실패: Origin이 일치하지 않습니다.' },
        { status: 403 }
      );
    }
  }

  // 2) Double Submit Cookie 검증
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json(
      { error: 'CSRF 검증 실패: 토큰이 유효하지 않습니다.' },
      { status: 403 }
    );
  }

  return null; // 검증 통과
}

/**
 * 인증 API용 (로그인/회원가입) — Origin만 검증, 토큰은 생략
 */
export function verifyCsrfOriginOnly(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  if (origin) {
    const allowedOrigin = new URL(request.url).origin;
    if (origin !== allowedOrigin) {
      return NextResponse.json(
        { error: 'CSRF 검증 실패: Origin이 일치하지 않습니다.' },
        { status: 403 }
      );
    }
  }
  return null;
}
