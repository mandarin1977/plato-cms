const CSRF_COOKIE_NAME = 'plato_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

function getCsrfToken(): string {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? match.split('=')[1] : '';
}

/**
 * CSRF 토큰을 자동으로 포함하는 fetch 래퍼
 * 토큰이 없으면 GET 요청으로 쿠키를 먼저 받아온 뒤 재시도
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  const method = (options.method || 'GET').toUpperCase();

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    let token = getCsrfToken();

    // CSRF 쿠키가 아직 없으면 가벼운 GET 요청으로 쿠키를 받아옴
    if (!token) {
      await fetch('/api/auth/me', { credentials: 'same-origin' });
      token = getCsrfToken();
    }

    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }
  }

  return fetch(url, { ...options, headers });
}
