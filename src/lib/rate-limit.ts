/**
 * 인메모리 Rate Limiter (IP 기반)
 * 프로덕션에서는 Redis 사용 권장
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// 만료된 엔트리 주기적으로 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimitOptions {
  /** 윈도우 내 최대 요청 수 */
  maxAttempts: number;
  /** 윈도우 크기 (밀리초) */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // 엔트리가 없거나 윈도우가 만료되었으면 초기화
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.maxAttempts - 1, retryAfterSeconds: 0 };
  }

  // 제한 초과
  if (entry.count >= options.maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // 카운트 증가
  entry.count++;
  return {
    allowed: true,
    remaining: options.maxAttempts - entry.count,
    retryAfterSeconds: 0,
  };
}
