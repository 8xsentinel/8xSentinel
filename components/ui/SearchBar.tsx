'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone, Send, CreditCard, Target } from 'lucide-react';

const Instagram = (props: React.ComponentProps<'svg'>) => (
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

interface SearchBarProps {
  placeholder?: string;
  initialQuery?: string;
  initialType?: 'all' | 'phone' | 'telegram' | 'upi' | 'instagram' | 'bgmi_uid';
  onSearch?: (query: string, type: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({
  placeholder,
  initialQuery = '',
  initialType = 'all',
  onSearch,
  isLoading = false
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType);

  const tabs = [
    { id: 'all', label: 'All', icon: Search, hint: 'Search by any identifier...' },
    { id: 'phone', label: 'Phone', icon: Phone, hint: 'e.g. +91 9876543210' },
    { id: 'telegram', label: 'Telegram', icon: Send, hint: 'e.g. @scammer_username' },
    { id: 'upi', label: 'UPI', icon: CreditCard, hint: 'e.g. name@upi' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, hint: 'e.g. @scam_insta' },
    { id: 'bgmi_uid', label: 'BGMI UID', icon: Target, hint: 'e.g. 5567891234' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed, activeTab);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}&type=${activeTab}`);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3 font-mono">
      {/* Search Type Switcher Tabs */}
      <div className="flex flex-wrap gap-1 bg-white/[0.02] border border-border-subtle p-1 rounded-lg backdrop-blur-md">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (query.trim() && onSearch) {
                  onSearch(query.trim(), tab.id);
                }
              }}
              type="button"
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all duration-200
                ${isActive 
                  ? 'bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan' 
                  : 'border border-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'}
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Field Form */}
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-4 text-text-muted">
          <currentTab.icon className="w-5 h-5" />
        </div>
        
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder={placeholder || currentTab.hint}
          className="
            w-full bg-white/[0.03] border border-border-subtle hover:border-accent-cyan/20 focus:border-accent-cyan focus:outline-none 
            rounded-xl pl-12 pr-28 py-4 text-text-primary placeholder:text-text-muted font-sans text-lg
            transition-all duration-300 backdrop-blur-md shadow-inner
          "
        />

        <div className="absolute right-3">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="
              flex items-center gap-1.5 bg-gradient-cyan hover:shadow-glow-cyan text-bg-void px-4 py-2 rounded-lg 
              font-bold text-xs uppercase tracking-wider font-mono transition-all duration-300 disabled:opacity-50 disabled:shadow-none
            "
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-bg-void border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Search</span>
                <Search className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
