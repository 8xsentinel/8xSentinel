'use client';

import React from 'react';
import Link from 'next/link';
import { TrustedReseller } from '../../types';
import { ShieldCheck, Star, MessageCircle, Phone, MapPin, UserCheck, Crown, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SellerCardProps {
  reseller: TrustedReseller;
}

export default function SellerCard({ reseller }: SellerCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const profileUsername = reseller.profile?.username || reseller.profile?.id || reseller.store_name || reseller.id;
  const isTier2 = reseller.tier2_status === 'approved' || reseller.tier === 2;
  const avatar = !imgError ? (reseller.profile?.avatar_url || reseller.profile?.avatarUrl) : null;
  const state = reseller.state || reseller.region || 'India';
  const trustScore = reseller.trust_score ?? 30;

  return (
    <Link href={`/resellers/${encodeURIComponent(profileUsername)}`} className="block group h-full">
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:border-accent-cyan/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,184,255,0.15)] flex flex-col justify-between gap-4 h-full overflow-hidden">
        
        {/* Glow Accent Top Border */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isTier2 ? 'from-amber-500 to-yellow-400' : 'from-accent-cyan to-accent-blue'}`} />

        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={reseller.store_name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setImgError(true)}
                  className={`w-10 h-10 rounded-xl border object-cover shrink-0 ${isTier2 ? 'border-accent-amber shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'border-accent-cyan/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'}`}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center font-bold text-accent-cyan font-mono text-sm shrink-0">
                  {reseller.store_name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide truncate group-hover:text-accent-cyan transition-colors" style={{ fontFamily: 'var(--font-h)' }}>
                  {reseller.store_name}
                </h3>
                <span className="text-[10px] font-mono text-accent-amber flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{state}</span>
                </span>
              </div>
            </div>

            <Badge className={`text-[9px] uppercase font-mono tracking-wider shrink-0 ${
              isTier2 
                ? 'bg-accent-amber/20 text-accent-amber border-accent-amber/40' 
                : 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30'
            }`}>
              {isTier2 ? <Crown className="w-2.5 h-2.5 mr-1" /> : <ShieldCheck className="w-2.5 h-2.5 mr-1" />}
              <span>{isTier2 ? 'Trusted' : 'Verified'}</span>
            </Badge>
          </div>

          {/* Platform tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            {reseller.primary_platform && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                reseller.primary_platform === 'whatsapp_only'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : reseller.primary_platform === 'telegram_only'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : reseller.primary_platform === 'whatsapp_primary'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : reseller.primary_platform === 'telegram_primary'
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
              }`}>
                {reseller.primary_platform === 'whatsapp_only' && '💬 WA Only'}
                {reseller.primary_platform === 'telegram_only' && '✈️ TG Only'}
                {reseller.primary_platform === 'whatsapp_primary' && '💬 WA Primary'}
                {reseller.primary_platform === 'telegram_primary' && '✈️ TG Primary'}
                {reseller.primary_platform === 'both' && '⚡ Dual Net'}
              </span>
            )}

            {reseller.whatsapp_number && (
              <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-emerald-400" />
                <span>{reseller.whatsapp_number}</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-accent-green">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-bold">{trustScore}/100</span>
            <span className="text-[10px] text-text-muted font-normal">Score</span>
          </div>

          <span className="text-[11px] text-accent-cyan group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            <span>View Profile</span>
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
