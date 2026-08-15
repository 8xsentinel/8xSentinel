'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types';

interface RiskBadgeProps {
  risk: RiskLevel;
  pulse?: boolean;
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; classes: string }> = {
  low:       { label: 'Low Risk',          classes: 'badge-green' },
  medium:    { label: 'Medium Risk',       classes: 'badge-orange' },
  high:      { label: 'High Risk',         classes: 'badge-red' },
  confirmed: { label: 'CONFIRMED SCAMMER', classes: 'badge-red shadow-[0_0_12px_rgba(239,68,68,0.4)]' },
  critical:  { label: 'CRITICAL THREAT',   classes: 'badge-red shadow-[0_0_12px_rgba(239,68,68,0.5)]' },
};

export default function RiskBadge({ risk, pulse = false, className }: RiskBadgeProps) {
  const cfg = riskConfig[risk] ?? riskConfig.medium;
  return (
    <span
      className={cn(
        'badge text-[10px] tracking-wider font-mono font-bold uppercase',
        cfg.classes,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full bg-current', (pulse || risk === 'critical' || risk === 'confirmed') && 'animate-ping')} />
      {cfg.label}
    </span>
  );
}
