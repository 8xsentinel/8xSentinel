'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

type SearchType = 'all' | 'phone' | 'telegram' | 'upi' | 'instagram' | 'bgmi_uid';

interface SearchBarProps {
  onSearch?: (query: string, type: SearchType) => void;
  initialQuery?: string;
  initialType?: SearchType;
  placeholder?: string;
  isLoading?: boolean;
}

const typeOptions: { value: SearchType; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'phone',     label: 'Phone'     },
  { value: 'telegram',  label: 'Telegram'  },
  { value: 'upi',       label: 'UPI'       },
  { value: 'instagram', label: 'Instagram' },
  { value: 'bgmi_uid',  label: 'BGMI UID'  },
];

export default function SearchBar({
  onSearch,
  initialQuery = '',
  initialType = 'all',
  placeholder = 'Search phone, telegram, UPI, Instagram, BGMI UID...',
  isLoading = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<SearchType>(initialType);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed, type);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&type=${type}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type selector */}
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`px-3 py-2 rounded text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap border transition-all duration-150 ${
                type === opt.value
                  ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/10'
                  : 'border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-subtle/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Input + submit */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-bg-surface border border-border-subtle hover:border-border-subtle/80 focus:border-accent-cyan/50 focus:outline-none text-text-primary placeholder-text-muted font-mono text-xs rounded pl-9 pr-9 py-3 transition-all duration-200"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-3 bg-accent-cyan/10 border border-accent-cyan/30 hover:bg-accent-cyan hover:text-bg-void text-accent-cyan font-mono font-bold text-xs uppercase tracking-widest rounded transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:block">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
