'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FieldDefinition, ContentModelWithFields } from '@/types/cms';
import FieldBuilder from './FieldBuilder';
import { apiFetch } from '@/lib/fetch';

interface ModelFormProps {
  initialData?: ContentModelWithFields;
}

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[가-힣]+/g, (match) => match)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ModelForm({ initialData }: ModelFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fields, setFields] = useState<FieldDefinition[]>(initialData?.fields || []);
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugManual && !isEditing) {
      setSlug(toSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('이름과 슬러그는 필수입니다.');
      return;
    }
    if (fields.length === 0) {
      setError('최소 1개의 필드가 필요합니다.');
      return;
    }
    const invalidFields = fields.filter((f) => !f.label || !f.name);
    if (invalidFields.length > 0) {
      setError('모든 필드의 라벨과 필드명을 입력해주세요.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/cms/models/${initialData.id}`
        : '/api/cms/models';

      const res = await apiFetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, fields }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '저장 실패');
      }

      router.push('/cms/models');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">모델 이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="예: 블로그 포스트"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">슬러그 (API 경로)</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">/api/cms/content/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            placeholder="blog-post"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            disabled={isEditing}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 모델에 대한 간단한 설명"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <FieldBuilder fields={fields} onChange={setFields} />

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
