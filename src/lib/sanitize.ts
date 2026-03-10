/**
 * 텍스트 입력에서 위험한 HTML/스크립트 태그 제거
 * richtext 필드는 별도 처리 (허용된 태그만 남김)
 */

// 위험한 태그/속성 패턴
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URL_PATTERN = /href\s*=\s*["']javascript:[^"']*["']/gi;
const DATA_URL_SCRIPT_PATTERN = /src\s*=\s*["']data:text\/html[^"']*["']/gi;

/**
 * 일반 텍스트 필드 sanitize
 * HTML 태그를 전부 이스케이프
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * 리치텍스트(HTML) 필드 sanitize
 * script 태그, 이벤트 핸들러, javascript: URL 제거
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(SCRIPT_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .replace(JAVASCRIPT_URL_PATTERN, '')
    .replace(DATA_URL_SCRIPT_PATTERN, '');
}

/**
 * 콘텐츠 엔트리 데이터 전체를 sanitize
 * 필드 타입에 따라 적절한 sanitize 적용
 */
export function sanitizeEntryData(
  data: Record<string, unknown>,
  fields: { name: string; type: string }[]
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const field of fields) {
    const value = data[field.name];
    if (value === undefined || value === null) {
      sanitized[field.name] = value;
      continue;
    }

    switch (field.type) {
      case 'richtext':
        sanitized[field.name] = typeof value === 'string' ? sanitizeHtml(value) : value;
        break;
      case 'text':
      case 'url':
        sanitized[field.name] = typeof value === 'string' ? sanitizeText(value) : value;
        break;
      case 'select':
        sanitized[field.name] = typeof value === 'string' ? sanitizeText(value) : value;
        break;
      case 'list':
        if (Array.isArray(value)) {
          sanitized[field.name] = value.map((v) =>
            typeof v === 'string' ? sanitizeText(v) : v
          );
        } else {
          sanitized[field.name] = value;
        }
        break;
      default:
        // number, boolean, date, datetime, json, image — 그대로
        sanitized[field.name] = value;
        break;
    }
  }

  return sanitized;
}

/**
 * 모델 이름/설명 등 일반 문자열 입력 sanitize
 */
export function sanitizeModelInput(input: string): string {
  return sanitizeText(input.trim());
}
