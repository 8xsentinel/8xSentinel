import React from 'react';
import { MessageSquare, Video, FolderOpen, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { EvidenceLink as EvidenceLinkType } from '../../types';

interface EvidenceLinkProps {
  evidence: EvidenceLinkType;
}

export default function EvidenceLink({ evidence }: EvidenceLinkProps) {
  const getIcon = () => {
    switch (evidence.type) {
      case 'telegram':
        return {
          icon: MessageSquare,
          color: 'text-sky-400 hover:text-sky-300 bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/10 hover:border-sky-500/25',
          label: 'Telegram Proof'
        };
      case 'youtube':
        return {
          icon: Video,
          color: 'text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/25',
          label: 'YouTube Video'
        };
      case 'drive':
        return {
          icon: FolderOpen,
          color: 'text-amber-400 hover:text-amber-300 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/25',
          label: 'Google Drive File'
        };
      case 'image':
        return {
          icon: ImageIcon,
          color: 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/25',
          label: 'Screenshot Image'
        };
      case 'other':
      default:
        return {
          icon: LinkIcon,
          color: 'text-accent-cyan hover:text-accent-cyan/85 bg-accent-cyan/5 hover:bg-accent-cyan/10 border-accent-cyan/10 hover:border-accent-cyan/25',
          label: 'Evidence Link'
        };
    }
  };

  const config = getIcon();
  const Icon = config.icon;

  return (
    <a
      href={evidence.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono 
        transition-all duration-150 ease-out
        ${config.color}
      `}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <div className="flex flex-col text-left truncate">
        <span className="font-bold tracking-tight text-[10px] uppercase text-text-muted">
          {config.label}
        </span>
        <span className="truncate max-w-[120px] sm:max-w-[200px] font-sans text-text-secondary">
          {evidence.label}
        </span>
      </div>
    </a>
  );
}
