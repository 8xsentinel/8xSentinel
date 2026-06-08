'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskBadgeProps {
  risk: RiskLevel;
  pulse?: boolean;
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; classes: string }> = {
  low:      { label: 'Low Risk',      classes: 'border-accent-green/40  text-accent-green  bg-accent-green/10'  },
  medium:   { label: 'Medium Risk',   classes: 'border-accent-amber/40  text-accent-amber  bg-accent-amber/10'  },
  high:     { label: 'High Risk',     classes: 'border-accent-red/40    text-accent-red    bg-accent-red/10'    },
  critical: { label: 'CRITICAL',      classes: 'border-red-500/60       text-red-400       bg-red-500/15'       },
};

export default function RiskBadge({ risk, pulse = false, className }: RiskBadgeProps) {
  const cfg = riskConfig[risk] ?? riskConfig.medium;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest font-bold',
        cfg.classes,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full bg-current', pulse && 'animate-pulse')} />
      {cfg.label}
    </span>
  );
}
