import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TrustedReseller } from '../../types';
import GlowCard from './GlowCard';
import TrustScoreRing from './TrustScoreRing';

interface SellerCardProps {
  reseller: TrustedReseller;
}

export default function SellerCard({ reseller }: SellerCardProps) {
  // Feedback positive ratio
  const totalFeedback = reseller.positive_feedback + reseller.negative_feedback;
  const ratingPct = totalFeedback > 0 ? Math.round((reseller.positive_feedback / totalFeedback) * 100) : 100;
  
  // Convert rating percentage to stars
  const starsCount = Math.round((ratingPct / 100) * 5);

  return (
    <GlowCard glowColor="green" className="h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header: Avatar, Name, Trust Score */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-3">
            <div className="relative w-12 h-12 rounded bg-bg-elevated border border-border-subtle flex items-center justify-center font-bold text-accent-green text-lg font-display">
              {reseller.store_name.slice(0, 2).toUpperCase()}
              <div className="absolute -bottom-1 -right-1 bg-bg-void rounded-full p-0.5">
                <CheckCircle2 className="w-4 h-4 text-accent-green fill-bg-void" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide font-display text-text-primary">
                {reseller.store_name}
              </h3>
              <p className="text-xs text-text-muted font-mono">{reseller.tagline || 'Verified Trading Agent'}</p>
            </div>
          </div>
          <TrustScoreRing score={reseller.trust_score} size={48} type="reseller" />
        </div>

        {/* Bio snippet */}
        {reseller.bio && (
          <p className="text-sm text-text-secondary line-clamp-2 min-h-[40px]">
            {reseller.bio}
          </p>
        )}

        {/* Specializations Tags */}
        <div className="flex flex-wrap gap-1">
          {reseller.specializes_in.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/[0.03] border border-border-subtle text-text-secondary">
              {tag.replace('_', ' ')}
            </span>
          ))}
          {reseller.specializes_in.length > 3 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-border-subtle text-text-muted">
              +{reseller.specializes_in.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Stats footer and CTA */}
      <div className="mt-5 pt-3 border-t border-border-subtle/30 flex items-center justify-between">
        <div className="font-mono">
          <div className="flex items-center text-accent-amber gap-0.5 text-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < starsCount ? 'fill-accent-amber' : 'text-text-muted'}`} />
            ))}
            <span className="text-text-secondary ml-1 font-bold">{ratingPct}%</span>
          </div>
          <p className="text-[10px] text-text-muted mt-0.5">
            {reseller.deals_completed} deal{reseller.deals_completed !== 1 ? 's' : ''} · {reseller.years_active}y active
          </p>
        </div>

        <Link
          href={`/resellers/${reseller.profile?.username || reseller.id}`}
          className="bg-accent-green/10 border border-accent-green/30 text-accent-green hover:bg-accent-green hover:text-bg-void px-3.5 py-1.5 rounded text-xs font-semibold tracking-wide transition-all duration-200"
        >
          View Profile
        </Link>
      </div>
    </GlowCard>
  );
}
