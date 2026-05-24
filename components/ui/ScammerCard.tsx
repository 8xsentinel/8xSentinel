import React from 'react';
import Link from 'next/link';
import { ShieldAlert, TrendingDown, DollarSign } from 'lucide-react';
import { ScammerEntity } from '../../types';
import GlowCard from './GlowCard';
import RiskBadge from './RiskBadge';
import TrustScoreRing from './TrustScoreRing';

interface ScammerCardProps {
  entity: ScammerEntity;
}

export default function ScammerCard({ entity }: ScammerCardProps) {
  const ids = entity.known_identifiers || {};
  
  // Format primary contact
  const primaryTg = ids.telegram && ids.telegram.length > 0 ? `@${ids.telegram[0]}` : null;
  const primaryPhone = ids.whatsapp && ids.whatsapp.length > 0 ? ids.whatsapp[0] : null;
  const primaryUpi = ids.upi && ids.upi.length > 0 ? ids.upi[0] : null;
  const primaryUid = ids.bgmi_uid && ids.bgmi_uid.length > 0 ? ids.bgmi_uid[0] : null;

  return (
    <GlowCard glowColor={entity.risk_level === 'confirmed' ? 'red' : 'amber'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Scammer Details */}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge risk={entity.risk_level} />
            <h3 className="text-xl font-bold tracking-wide font-display text-text-primary">
              {entity.canonical_name}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-mono text-text-secondary">
            {primaryTg && (
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-border-subtle/40 px-2.5 py-1 rounded">
                <span className="text-accent-cyan text-xs">TG:</span>
                <span className="truncate">{primaryTg}</span>
              </div>
            )}
            {primaryPhone && (
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-border-subtle/40 px-2.5 py-1 rounded">
                <span className="text-accent-cyan text-xs">WA:</span>
                <span>{primaryPhone}</span>
              </div>
            )}
            {primaryUpi && (
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-border-subtle/40 px-2.5 py-1 rounded col-span-1 sm:col-span-2">
                <span className="text-accent-cyan text-xs">UPI:</span>
                <span className="truncate">{primaryUpi}</span>
              </div>
            )}
            {primaryUid && (
              <div className="flex items-center gap-1.5 bg-white/[0.02] border border-border-subtle/40 px-2.5 py-1 rounded">
                <span className="text-accent-cyan text-xs">UID:</span>
                <span>{primaryUid}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Profile Button */}
        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t border-border-subtle/30 md:border-t-0">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-text-muted font-mono uppercase tracking-wider">Scam Impact</p>
              <p className="text-lg font-bold font-mono text-accent-red flex items-center justify-end gap-0.5">
                <span>₹{entity.total_amount_lost.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-xs text-text-secondary font-mono">
                {entity.report_count} report{entity.report_count !== 1 ? 's' : ''}
              </p>
            </div>
            <TrustScoreRing score={entity.trust_score} size={56} type="scammer" />
          </div>
          
          <Link
            href={`/scammer/${entity.id}`}
            className="flex items-center justify-center bg-transparent border border-accent-cyan/30 text-accent-cyan px-4 py-2 rounded text-sm font-medium hover:bg-accent-cyan/10 transition-colors duration-200"
          >
            View File →
          </Link>
        </div>
      </div>
    </GlowCard>
  );
}
