'use client';

import { FieldDefinition, FieldType, FIELD_TYPE_LABELS } from '@/types/cms';
import { cn } from '@/lib/utils';

interface FieldBuilderProps {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
}

function toFieldName(label: string): string {
  return label
    .trim()
    .replace(/[^a-zA-Z0-9가-힣\s]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

export default function FieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const addField = () => {
    onChange([
      ...fields,
      { name: '', label: '', type: 'text', required: false },
    ]);
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = fields.map((f, i) => {
      if (i !== index) return f;
      const updated = { ...f, ...updates };
      if (updates.label && !f.name) {
        updated.name = toFieldName(updates.label);
      }
      return updated;
    });
    onChange(newFields);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    onChange(newFields);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">필드 정의</label>
        <button
          type="button"
          onClick={addField}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          + 필드 추가
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-xl">
          필드를 추가하세요
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={`${field.name || 'new'}-${index}`}
          className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white"
        >
          {/* Header with reorder & delete */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveField(index, -1)}
                disabled={index === 0}
                className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveField(index, 1)}
                disabled={index === fields.length - 1}
                className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-30"
              >
                ↓
              </button>
              <span className="text-xs text-gray-400 ml-1">#{index + 1}</span>
            </div>
            <button
              type="button"
              onClick={() => removeField(index)}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              삭제
            </button>
          </div>

          {/* Label & Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">라벨</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="예: 제목"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">필드명</label>
              <input
                type="text"
                value={field.name}
                onChange={(e) => updateField(index, { name: e.target.value })}
                placeholder="예: title"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type & Required */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">타입</label>
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">필수</span>
              </label>
            </div>
          </div>

          {/* 셀렉트 옵션 입력 */}
          {field.type === 'select' && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">선택 옵션 (쉼표로 구분)</label>
              <input
                type="text"
                value={(field.options || []).join(', ')}
                onChange={(e) => {
                  const options = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  updateField(index, { options });
                }}
                placeholder="예: 소, 중, 대"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
