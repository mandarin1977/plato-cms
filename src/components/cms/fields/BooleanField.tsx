'use client';

import { FieldDefinition } from '@/types/cms';

interface Props {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export default function BooleanField({ field, value, onChange }: Props) {
  return (
    <div>
      <label className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </span>
          {field.description && (
            <p className="text-xs text-gray-400 mt-0.5">{field.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            value ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              value ? 'translate-x-5.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </label>
    </div>
  );
}
