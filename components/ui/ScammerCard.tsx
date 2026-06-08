'use client';

import React from 'react';
import Link from 'next/link';
import RiskBadge from './RiskBadge';
import { ScammerEntity } from '../../types';
import { ShieldAlert, Phone, MessageCircle, CreditCard, Hash } from 'lucide-react';

interface ScammerCardProps {
  entity: ScammerEntity;
}

export default function ScammerCard({ entity }: ScammerCardProps) {
  const ids = entity.known_identifiers || {};

  return (
    <Link href={`/scammer/${entity.id}`}>
      <div className="group backdrop-blur-md bg-white/[0.02] border border-border-subtle hover:border-accent-red/30 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:bg-accent-red/[0.02]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-accent-red" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wide truncate">
                {entity.canonical_name}
              </h3>
              <p className="text-[10px] text-text-muted font-mono mt-0.5">
                {entity.report_count} confirmed report{entity.report_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <RiskBadge risk={entity.risk_level} pulse={entity.risk_level === 'critical'} />
        </div>

        {/* Identifiers grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {ids.phone?.slice(0, 1).map((p: string) => (
            <div key={p} className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary truncate">
              <Phone className="w-3 h-3 text-text-muted shrink-0" /> {p}
            </div>
          ))}
          {ids.telegram?.slice(0, 1).map((t: string) => (
            <div key={t} className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary truncate">
              <MessageCircle className="w-3 h-3 text-text-muted shrink-0" /> @{t}
            </div>
          ))}
          {ids.upi?.slice(0, 1).map((u: string) => (
            <div key={u} className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary truncate">
              <CreditCard className="w-3 h-3 text-text-muted shrink-0" /> {u}
            </div>
          ))}
          {ids.bgmi_uid?.slice(0, 1).map((uid: string) => (
            <div key={uid} className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary truncate">
              <Hash className="w-3 h-3 text-text-muted shrink-0" /> {uid}
            </div>
          ))}
        </div>

        {entity.total_amount_lost > 0 && (
          <div className="mt-3 pt-3 border-t border-border-subtle/30 flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">Total Damage</span>
            <span className="text-sm font-bold font-mono text-accent-red">
              ₹{entity.total_amount_lost.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
