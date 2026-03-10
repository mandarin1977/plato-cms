export type FieldType = 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'datetime' | 'image' | 'json' | 'select' | 'list' | 'url';

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  description?: string;
  options?: string[]; // select 필드의 선택지
}

export interface ContentModelWithFields {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FieldDefinition[];
  createdAt: string;
  updatedAt: string;
  _count?: { entries: number };
}

export interface ContentEntryData {
  id: string;
  contentModelId: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: '텍스트',
  richtext: '리치 텍스트',
  number: '숫자',
  boolean: '토글',
  date: '날짜',
  datetime: '날짜+시간',
  image: '이미지',
  json: 'JSON',
  select: '셀렉트',
  list: '목록(태그)',
  url: '링크/URL',
};
