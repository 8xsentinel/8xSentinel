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
      <div className="group glass-panel card-glow-red rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-accent-red/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-accent-red/10 border border-accent-red/25 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.15)] group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-accent-red" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-white uppercase tracking-wide truncate" style={{ fontFamily: 'var(--font-h)' }}>
                {entity.canonical_name}
              </h3>
              <p className="text-[11px] text-text-secondary mt-0.5 font-sans">
                {entity.report_count} confirmed report{entity.report_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <RiskBadge risk={entity.risk_level} pulse={entity.risk_level === 'critical'} />
        </div>

        {/* Identifiers grid */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(ids.phone || ids.whatsapp)?.slice(0, 1).map((p: string) => (
            <div key={p} className="flex items-center gap-1.5 text-[11px] text-text-secondary truncate font-sans">
              <Phone className="w-3.5 h-3.5 text-accent-cyan shrink-0" /> {p}
            </div>
          ))}
          {ids.telegram?.slice(0, 1).map((t: string) => (
            <div key={t} className="flex items-center gap-1.5 text-[11px] text-text-secondary truncate font-sans">
              <MessageCircle className="w-3.5 h-3.5 text-accent-tg shrink-0" /> @{t}
            </div>
          ))}
          {ids.upi?.slice(0, 1).map((u: string) => (
            <div key={u} className="flex items-center gap-1.5 text-[11px] text-text-secondary truncate font-sans">
              <CreditCard className="w-3.5 h-3.5 text-accent-amber shrink-0" /> {u}
            </div>
          ))}
          {ids.bgmi_uid?.slice(0, 1).map((uid: string) => (
            <div key={uid} className="flex items-center gap-1.5 text-[11px] text-text-secondary truncate font-sans">
              <Hash className="w-3.5 h-3.5 text-accent-purple shrink-0" /> {uid}
            </div>
          ))}
        </div>

        {entity.total_amount_lost > 0 && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-h)' }}>
              Total Damage
            </span>
            <span className="text-sm font-bold text-accent-red font-mono">
              ₹{entity.total_amount_lost.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
