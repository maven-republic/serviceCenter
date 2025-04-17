'use client';

import { X } from 'lucide-react';

export default function FilterChip({ label, onRemove }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
      <span className="truncate max-w-[150px]">{label}</span>
      <button 
        onClick={onRemove}
        className="text-blue-500 hover:text-blue-700 rounded-full"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={14} />
      </button>
    </div>
  );
}