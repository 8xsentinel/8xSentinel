'use client';

import React from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { EvidenceLink, EvidenceType } from '../../types';

interface LinkInputProps {
  links: EvidenceLink[];
  onChange: (links: EvidenceLink[]) => void;
}

export default function LinkInput({ links, onChange }: LinkInputProps) {
  const addLink = () => {
    if (links.length >= 10) return;
    onChange([...links, { type: 'telegram', url: '', label: '' }]);
  };

  const removeLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateLink = (index: number, field: keyof EvidenceLink, value: string) => {
    const updated = links.map((link, i) => {
      if (i === index) {
        return { ...link, [field]: value };
      }
      return link;
    });
    onChange(updated);
  };

  const types: { id: EvidenceType; label: string }[] = [
    { id: 'telegram', label: '📱 Telegram' },
    { id: 'youtube', label: '🎥 YouTube' },
    { id: 'drive', label: '📂 Google Drive' },
    { id: 'image', label: '🖼️ Screenshot URL' },
    { id: 'other', label: '🔗 Other Web link' }
  ];

  return (
    <div className="space-y-4 font-sans text-sm">
      <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2">
        <h4 className="font-mono text-xs uppercase text-text-secondary font-bold tracking-wider">
          Evidence Links ({links.length}/10)
        </h4>
        {links.length < 10 && (
          <button
            type="button"
            onClick={addLink}
            className="flex items-center gap-1 text-xs font-mono uppercase bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan px-2.5 py-1 rounded border border-accent-cyan/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        )}
      </div>

      {links.length === 0 ? (
        <div className="border border-dashed border-border-subtle rounded-lg p-6 text-center text-text-muted text-xs font-mono uppercase">
          No evidence links attached yet. Submit proof to back up your claim.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-2.5 p-3 rounded bg-white/[0.01] border border-border-subtle/60 relative"
            >
              {/* Type Select */}
              <div className="w-full sm:w-1/4">
                <label className="text-[10px] font-mono text-text-muted uppercase block mb-1">Type</label>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(index, 'type', e.target.value as any)}
                  className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-2 py-1.5 text-xs text-text-primary font-mono"
                >
                  {types.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Label */}
              <div className="w-full sm:w-1/4">
                <label className="text-[10px] font-mono text-text-muted uppercase block mb-1">Label</label>
                <input
                  type="text"
                  placeholder="e.g. Chat Screenshot"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                  className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted"
                />
              </div>

              {/* URL */}
              <div className="w-full sm:flex-1">
                <label className="text-[10px] font-mono text-text-muted uppercase block mb-1">Reference URL</label>
                <input
                  type="text"
                  placeholder="https://t.me/... or https://drive.google.com/..."
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted font-mono"
                />
              </div>

              {/* Delete Button */}
              <div className="sm:self-end">
                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-accent-red border border-transparent hover:border-accent-red/20 transition-all"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guide widget card */}
      <div className="p-3 bg-white/[0.01] border border-border-subtle rounded-lg flex items-start gap-2.5 text-xs text-text-secondary leading-normal">
        <HelpCircle className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <p className="font-bold font-mono text-[10px] text-accent-cyan uppercase tracking-wider">Reference guidelines:</p>
          <ul className="list-disc list-inside space-y-0.5 text-text-muted">
            <li><strong className="text-text-secondary">Telegram:</strong> Click message &rarr; Share &rarr; Copy Link.</li>
            <li><strong className="text-text-secondary">YouTube:</strong> Right-click video &rarr; Copy video URL.</li>
            <li><strong className="text-text-secondary">Drive:</strong> Share setting &rarr; set to "Anyone with Link" &rarr; Copy link.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
