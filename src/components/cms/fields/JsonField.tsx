'use client';

import { useState } from 'react';
import { FieldDefinition } from '@/types/cms';

interface Props {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export default function JsonField({ field, value, onChange }: Props) {
  const [jsonError, setJsonError] = useState('');

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value || '', null, 2);

  const handleChange = (text: string) => {
    onChange(text);
    if (text.trim()) {
      try {
        JSON.parse(text);
        setJsonError('');
      } catch {
        setJsonError('유효하지 않은 JSON 형식입니다.');
      }
    } else {
      setJsonError('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        value={stringValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='{"key": "value"}'
        rows={5}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
      />
      {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
    </div>
  );
}
