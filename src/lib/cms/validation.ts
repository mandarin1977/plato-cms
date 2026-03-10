import { FieldDefinition } from '@/types/cms';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEntryData(
  data: Record<string, unknown>,
  fields: FieldDefinition[]
): ValidationResult {
  const errors: string[] = [];

  for (const field of fields) {
    const value = data[field.name];

    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label} 필드는 필수입니다.`);
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    switch (field.type) {
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${field.label} 필드는 숫자여야 합니다.`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${field.label} 필드는 참/거짓이어야 합니다.`);
        }
        break;
      case 'json':
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
          } catch {
            errors.push(`${field.label} 필드는 유효한 JSON이어야 합니다.`);
          }
        }
        break;
      case 'select':
        if (field.options && field.options.length > 0 && !field.options.includes(String(value))) {
          errors.push(`${field.label} 필드는 유효한 옵션이어야 합니다.`);
        }
        break;
      case 'list':
        if (!Array.isArray(value)) {
          errors.push(`${field.label} 필드는 목록이어야 합니다.`);
        }
        break;
      case 'url':
        if (typeof value === 'string' && value && !/^https?:\/\/.+/.test(value)) {
          errors.push(`${field.label} 필드는 유효한 URL이어야 합니다.`);
        }
        break;
    }
  }

  // 정의되지 않은 필드 제거
  const fieldNames = new Set(fields.map((f) => f.name));
  for (const key of Object.keys(data)) {
    if (!fieldNames.has(key)) {
      delete data[key];
    }
  }

  return { valid: errors.length === 0, errors };
}
