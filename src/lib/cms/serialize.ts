import { FieldDefinition, ContentModelWithFields, ContentEntryData } from '@/types/cms';

export function parseFields(raw: string): FieldDefinition[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function parseData(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function serializeModel(model: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { entries: number };
}): ContentModelWithFields {
  return {
    id: model.id,
    name: model.name,
    slug: model.slug,
    description: model.description,
    fields: parseFields(model.fields),
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
    _count: model._count,
  };
}

export function serializeEntry(entry: {
  id: string;
  contentModelId: string;
  data: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ContentEntryData {
  return {
    id: entry.id,
    contentModelId: entry.contentModelId,
    data: parseData(entry.data),
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}
