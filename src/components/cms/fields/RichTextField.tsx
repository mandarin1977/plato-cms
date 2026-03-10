'use client';

import dynamic from 'next/dynamic';
import { FieldDefinition } from '@/types/cms';

const TiptapEditor = dynamic(
  () => import('./richtext/TiptapEditor'),
  { ssr: false, loading: () => <div className="h-[200px] border border-gray-200 rounded-xl animate-pulse bg-gray-50" /> }
);

interface Props {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export default function RichTextField({ field, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <TiptapEditor
        value={(value as string) || ''}
        onChange={(html) => onChange(html)}
        placeholder={field.description || `${field.label}을(를) 입력하세요`}
      />
    </div>
  );
}
