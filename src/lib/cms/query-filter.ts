import { ContentEntryData, FieldDefinition } from '@/types/cms';

interface ParsedFilters {
  search?: string;
  filters: { field: string; op: string; value: string }[];
  sort?: string;
  order: 'asc' | 'desc';
  limit: number;
  offset: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function parseFilterParams(searchParams: URLSearchParams): ParsedFilters {
  const filters: ParsedFilters['filters'] = [];

  searchParams.forEach((value, key) => {
    // filter[fieldName]=value → exact match
    const exactMatch = key.match(/^filter\[(\w+)]$/);
    if (exactMatch) {
      filters.push({ field: exactMatch[1], op: 'eq', value });
    }

    // filter[fieldName][op]=value → operator match
    const opMatch = key.match(/^filter\[(\w+)]\[(\w+)]$/);
    if (opMatch) {
      filters.push({ field: opMatch[1], op: opMatch[2], value });
    }
  });

  return {
    search: searchParams.get('search') || undefined,
    filters,
    sort: searchParams.get('sort') || undefined,
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    limit: Math.max(1, Math.min(parseInt(searchParams.get('limit') || '100') || 100, 100)),
    offset: Math.max(0, parseInt(searchParams.get('offset') || '0') || 0),
  };
}

export function applyFilters(
  entries: ContentEntryData[],
  params: ParsedFilters,
  fields: FieldDefinition[]
): { entries: ContentEntryData[]; total: number; filtered: number } {
  const total = entries.length;
  let result = [...entries];

  // 검색
  if (params.search) {
    const keyword = params.search.toLowerCase();
    const textFields = fields.filter((f) => f.type === 'text' || f.type === 'richtext');

    result = result.filter((entry) =>
      textFields.some((f) => {
        const val = entry.data[f.name];
        if (typeof val !== 'string') return false;
        const text = f.type === 'richtext' ? stripHtml(val) : val;
        return text.toLowerCase().includes(keyword);
      })
    );
  }

  // 필터
  for (const filter of params.filters) {
    result = result.filter((entry) => {
      const val = entry.data[filter.field];
      if (val === undefined || val === null) return false;

      const strVal = String(val);
      const numVal = Number(val);
      const filterNum = Number(filter.value);

      switch (filter.op) {
        case 'eq':
          return strVal === filter.value;
        case 'contains':
          return strVal.toLowerCase().includes(filter.value.toLowerCase());
        case 'gte':
          return !isNaN(numVal) && !isNaN(filterNum) && numVal >= filterNum;
        case 'lte':
          return !isNaN(numVal) && !isNaN(filterNum) && numVal <= filterNum;
        case 'gt':
          return !isNaN(numVal) && !isNaN(filterNum) && numVal > filterNum;
        case 'lt':
          return !isNaN(numVal) && !isNaN(filterNum) && numVal < filterNum;
        default:
          return true;
      }
    });
  }

  const filtered = result.length;

  // 정렬
  if (params.sort) {
    const sortField = params.sort;
    const dir = params.order === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      const aVal = a.data[sortField];
      const bVal = b.data[sortField];

      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir;
      }

      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }

  // 페이지네이션
  result = result.slice(params.offset, params.offset + params.limit);

  return { entries: result, total, filtered };
}
