'use client';

import React from 'react';
import { ExternalLink, ImageIcon, Video, Link2 } from 'lucide-react';
import { EvidenceLink as EvidenceLinkType } from '../../types';

interface EvidenceLinkProps {
  evidence: EvidenceLinkType;
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  screenshot: { icon: ImageIcon, label: 'Screenshot', color: 'text-accent-cyan' },
  video:      { icon: Video,     label: 'Video',      color: 'text-accent-purple' },
  link:       { icon: Link2,     label: 'Link',       color: 'text-accent-green' },
};

export default function EvidenceLink({ evidence }: EvidenceLinkProps) {
  const cfg = typeConfig[evidence.type] ?? typeConfig.link;
  const Icon = cfg.icon;

  return (
    <a
      href={evidence.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-white/[0.03] border border-border-subtle hover:border-accent-cyan/30 ${cfg.color} px-3 py-2 rounded text-[11px] font-mono font-bold uppercase tracking-wide transition-all duration-200 hover:bg-white/[0.05]`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate max-w-[160px]">{evidence.label || cfg.label}</span>
      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
    </a>
  );
}
