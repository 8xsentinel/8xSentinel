'use client';

import React, { useState } from 'react';
import { EvidenceLink } from '../../types';
import { Link2, Plus, X, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkInputProps {
  links: EvidenceLink[];
  onChange: (links: EvidenceLink[]) => void;
  maxLinks?: number;
}

export default function LinkInput({ links, onChange, maxLinks = 5 }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<EvidenceLink['type']>('screenshot');

  const handleAdd = () => {
    if (!url.trim()) return;
    if (links.length >= maxLinks) return;

    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const newLink: EvidenceLink = {
      url: validUrl,
      type,
      label: label.trim() || 'Evidence Link',
    };

    onChange([...links, newLink]);
    setUrl('');
    setLabel('');
  };

  const handleRemove = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'screenshot': return <ImageIcon className="w-3.5 h-3.5 text-accent-cyan" />;
      case 'video': return <Video className="w-3.5 h-3.5 text-accent-purple" />;
      default: return <Link2 className="w-3.5 h-3.5 text-accent-green" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Links */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white/[0.03] border border-border-subtle pl-2.5 pr-1 py-1 rounded text-xs">
              {getTypeIcon(link.type)}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-accent-cyan hover:underline truncate max-w-[150px]">
                {link.label || new URL(link.url).hostname}
              </a>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 rounded hover:bg-white/[0.1] text-text-muted hover:text-accent-red transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      {links.length < maxLinks ? (
        <div className="p-4 bg-white/[0.01] border border-border-subtle border-dashed rounded space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-widest">Evidence URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://imgur.com/..."
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-xs text-text-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-widest">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-2 py-2 text-xs text-text-primary h-[34px]"
              >
                <option value="screenshot">Screenshot</option>
                <option value="video">Video</option>
                <option value="link">Other Link</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-widest">Label (Optional)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Chat history"
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-xs text-text-primary"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAdd}
                disabled={!url.trim()}
                className="h-[34px] px-4 bg-white/[0.03] border border-border-subtle hover:border-accent-cyan hover:text-accent-cyan text-text-secondary rounded text-xs uppercase font-mono font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-text-muted font-mono uppercase">Maximum {maxLinks} evidence links reached.</p>
      )}
    </div>
  );
}
