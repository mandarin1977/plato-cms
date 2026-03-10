'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FieldDefinition, FieldType, ContentEntryData } from '@/types/cms';
import { apiFetch } from '@/lib/fetch';
import TextField from './fields/TextField';
import RichTextField from './fields/RichTextField';
import NumberField from './fields/NumberField';
import BooleanField from './fields/BooleanField';
import DateField from './fields/DateField';
import DateTimeField from './fields/DateTimeField';
import ImageField from './fields/ImageField';
import JsonField from './fields/JsonField';
import SelectField from './fields/SelectField';
import ListField from './fields/ListField';
import UrlField from './fields/UrlField';

interface EntryFormProps {
  modelId: string;
  fields: FieldDefinition[];
  initialData?: ContentEntryData;
}

const fieldComponents: Record<FieldType, React.ComponentType<{
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}>> = {
  text: TextField,
  richtext: RichTextField,
  number: NumberField,
  boolean: BooleanField,
  date: DateField,
  datetime: DateTimeField,
  image: ImageField,
  json: JsonField,
  select: SelectField,
  list: ListField,
  url: UrlField,
};

export default function EntryForm({ modelId, fields, initialData }: EntryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [data, setData] = useState<Record<string, unknown>>(
    initialData?.data || {}
  );
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = (name: string, value: unknown) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/cms/models/${modelId}/entries/${initialData.id}`
        : `/api/cms/models/${modelId}/entries`;

      const res = await apiFetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, status }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || '저장 실패');
      }

      router.push(`/cms/models/${modelId}/entries`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {fields.map((field) => {
        const Component = fieldComponents[field.type] || TextField;
        return (
          <Component
            key={field.name}
            field={field}
            value={data[field.name]}
            onChange={(value) => updateField(field.name, value)}
          />
        );
      })}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
        <div className="flex gap-2">
          {(['draft', 'published'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                status === s
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s === 'draft' ? '초안' : '게시'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? '저장 중...' : isEditing ? '수정하기' : '생성하기'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
