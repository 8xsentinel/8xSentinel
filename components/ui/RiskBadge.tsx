import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldAlert as ShieldWarning, Skull, CheckCircle } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  risk: RiskLevel | 'verified_safe';
  pulse?: boolean;
}

export default function RiskBadge({ risk, pulse = true }: RiskBadgeProps) {
  const getConfig = () => {
    switch (risk) {
      case 'confirmed':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400',
          dot: 'bg-red-500',
          icon: Skull,
          label: '☠️ Confirmed Scammer'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
          dot: 'bg-orange-500',
          icon: ShieldAlert,
          label: '🔴 High Risk'
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-500',
          icon: ShieldWarning,
          label: '⚠️ Use Caution'
        };
      case 'low':
        return {
          bg: 'bg-lime-500/10 border-lime-500/20 text-lime-400',
          dot: 'bg-lime-500',
          icon: ShieldCheck,
          label: '🟡 Clean Record'
        };
      case 'verified_safe':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-500',
          icon: CheckCircle,
          label: '✅ Verified Reseller'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono tracking-wide ${config.bg}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </span>
      )}
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}
