'use client';

import React from 'react';
import Link from 'next/link';
import { TrustedReseller } from '../../types';
import { ShieldCheck, Star, MessageCircle, Phone, MapPin, UserCheck } from 'lucide-react';

interface SellerCardProps {
  reseller: TrustedReseller;
}

const badgeLabel: Record<string, string> = {
  sentinel_verified: '🔷 Sentinel Verified',
  sentinel_trusted:  '🟨 Sentinel Trusted',
};

export default function SellerCard({ reseller }: SellerCardProps) {
  const profileUsername = reseller.profile?.username || reseller.id;
  const topBadge = reseller.badges?.find((b: any) =>
    typeof b === 'string'
      ? ['sentinel_trusted', 'sentinel_verified'].includes(b)
      : ['sentinel_trusted', 'sentinel_verified'].includes(b.type)
  );

  return (
    <Link href={`/resellers/${profileUsername}`}>
      <div className="group backdrop-blur-md bg-white/[0.02] border border-border-subtle hover:border-accent-green/30 rounded-xl p-5 transition-all duration-200 cursor-pointer h-full flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-text-primary font-display uppercase tracking-wide truncate">
                {reseller.store_name}
              </h3>
              {reseller.region && (
                <span className="text-[9px] font-mono text-accent-cyan border border-accent-cyan/30 bg-accent-cyan/5 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {reseller.region}
                </span>
              )}
            </div>
            {reseller.tagline && (
              <p className="text-[10px] text-text-secondary font-sans truncate">{reseller.tagline}</p>
            )}
          </div>
          {topBadge && (
            <span className="text-[10px] font-mono font-bold whitespace-nowrap text-accent-green border border-accent-green/30 bg-accent-green/5 px-2 py-0.5 rounded">
              {badgeLabel[typeof topBadge === 'string' ? topBadge : topBadge.type] || 'Verified Seller'}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-[10px] font-mono text-text-muted">
          {reseller.telegram_username && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-sky-400" /> @{reseller.telegram_username}
            </span>
          )}
          {reseller.whatsapp_number && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" /> {reseller.whatsapp_number}
            </span>
          )}
        </div>

        {reseller.verified_by_regional_admin_name && (
          <div className="text-[9px] text-accent-green font-mono flex items-center gap-1 border-t border-border-subtle/20 pt-2">
            <UserCheck className="w-3 h-3" /> Regional Vouch: {reseller.verified_by_regional_admin_name}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border-subtle/30">
          <div className="flex items-center gap-1 text-accent-green">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold font-mono">{reseller.trust_score ?? 0}/100</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="capitalize">{reseller.verification_status}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

