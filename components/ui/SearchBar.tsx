'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, X, Shield, Phone, Send, MessageSquare, 
  CreditCard, Landmark, Gamepad2, AtSign 
} from 'lucide-react';

const InstagramIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export type SearchType = 
  | 'all' 
  | 'phone' 
  | 'telegram' 
  | 'whatsapp_username' 
  | 'upi' 
  | 'instagram' 
  | 'bank_account' 
  | 'bgmi_uid';

interface SearchBarProps {
  onSearch?: (query: string, type: SearchType) => void;
  initialQuery?: string;
  initialType?: SearchType;
  placeholder?: string;
  isLoading?: boolean;
}

const typeOptions: { value: SearchType; label: string; icon: any; placeholder: string }[] = [
  { value: 'all',               label: 'ALL',                icon: Shield,      placeholder: 'Query WhatsApp, Telegram, UPI, Bank Account, BGMI UID...' },
  { value: 'phone',             label: 'WhatsApp Number',    icon: Phone,       placeholder: 'Enter 10-digit WhatsApp phone number (e.g. 9876543210)...' },
  { value: 'telegram',          label: 'Telegram Username',  icon: Send,        placeholder: 'Enter Telegram username (e.g. @rohan_deals)...' },
  { value: 'whatsapp_username', label: 'WhatsApp Username',  icon: MessageSquare,placeholder: 'Enter WhatsApp display username or alias...' },
  { value: 'upi',               label: 'UPI ID',             icon: CreditCard,  placeholder: 'Enter VPA / UPI ID (e.g. name@ybl, name@upi)...' },
  { value: 'instagram',         label: 'Instagram ID',       icon: InstagramIcon,placeholder: 'Enter Instagram handle (e.g. @rohan_store)...' },
  { value: 'bank_account',      label: 'Bank Account No.',   icon: Landmark,    placeholder: 'Enter Bank Account number or IFSC code...' },
  { value: 'bgmi_uid',          label: 'BGMI Ingame ID',     icon: Gamepad2,    placeholder: 'Enter 10-digit BGMI Character UID (e.g. 5567891234)...' },
];

export default function SearchBar({
  onSearch,
  initialQuery = '',
  initialType = 'all',
  placeholder,
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

  const activeOption = typeOptions.find(o => o.value === type) || typeOptions[0];
  const activePlaceholder = placeholder || activeOption.placeholder;

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
    <form onSubmit={handleSubmit} className="w-full space-y-3 font-mono">
      {/* Category Pills Bar with Cyber Premium Aesthetic */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border-subtle shrink-0">
        {typeOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = type === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all duration-200 select-none
                ${isActive 
                  ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/15 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-extrabold scale-[1.02]' 
                  : 'border-border-subtle/70 bg-white/[0.01] text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 hover:bg-white/[0.03]'}
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-cyan animate-pulse' : 'text-text-muted'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box & Action Button */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 via-accent-purple/10 to-accent-green/10 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-accent-cyan pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activePlaceholder}
              className="w-full bg-[#070b16]/90 border border-border-subtle hover:border-accent-cyan/40 focus:border-accent-cyan text-text-primary placeholder-text-muted font-mono text-xs rounded-xl pl-10 pr-10 py-3.5 transition-all duration-200 outline-none backdrop-blur-md shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3.5 text-text-muted hover:text-accent-cyan transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3.5 bg-accent-cyan text-bg-void font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 active:scale-95"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-bg-void border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline font-display uppercase tracking-wider">Search Registry</span>
        </button>
      </div>
    </form>
  );
}

