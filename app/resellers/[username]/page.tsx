'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TrustScoreRing from '@/components/ui/TrustScoreRing';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  ShieldAlert,
  MessageSquare, 
  Phone, 
  Send,
  Star, 
  AlertTriangle, 
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  CheckCircle,
  Tag,
  Zap,
  Flame,
  Gauge,
  Crown,
  Handshake,
  ArrowUpRight,
  Sparkles,
  Lock,
  Building2,
  Share2,
  ThumbsUp,
  UserCheck,
  Shield,
  FileCheck2,
  Award
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const WhatsAppLogo = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TelegramLogo = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.562 8.161c-.18.847-.96 4.966-1.36 7.106-.17.904-.5 1.206-.82 1.236-.697.064-1.226-.46-1.9-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 7.002-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.094.036.309.02.477Z"/>
  </svg>
);

const InstagramLogo = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const specialtyMeta: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  budget_accounts: { label: 'Budget Accounts', icon: Tag, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  premium_accounts: { label: 'Premium Accounts', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  uc_recharge: { label: 'UC Recharge', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  xsuit_gifts: { label: 'X-Suit Gifts', icon: Flame, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  supercar_gifts: { label: 'Supercar Gifts', icon: Gauge, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

export default function ResellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [reseller, setReseller] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [escrowPartners, setEscrowPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Escrow Request Modal
  const [selectedEscrowPartner, setSelectedEscrowPartner] = useState<any>(null);

  // Voting & Partnership Action State
  const [actionLoading, setActionLoading] = useState(false);

  const { profile } = useAuth();

  const fetchResellerDetails = async () => {
    if (username) {
      setLoading(true);
      const data = await db.getResellerProfile(username);
      if (data) {
        setReseller(data.reseller);
        setVotes(data.votes || []);
        setEscrowPartners(data.escrowPartners || []);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellerDetails();
  }, [username]);

  const handleVoteTrust = async () => {
    if (!reseller) return;
    if (!profile?.id) {
      toast.error('Please authenticate to vouch for this reseller.');
      return;
    }

    setActionLoading(true);
    const result = await db.voteResellerTrust(reseller.id, profile.id);
    setActionLoading(false);

    if (result?.success) {
      toast.success(result.message || 'Peer Trust Vouch recorded!');
      await fetchResellerDetails();
    } else {
      toast.error(result?.message || 'Could not register vouch.');
    }
  };

  const handleToggleEscrowPartnership = async () => {
    if (!reseller) return;
    if (!profile?.id) {
      toast.error('Please log in with an authorized reseller account.');
      return;
    }

    setActionLoading(true);
    const result = await db.toggleEscrowPartner(reseller.id, profile.id);
    setActionLoading(false);

    if (result?.success) {
      toast.success(result.message || 'Escrow partnership updated!');
      await fetchResellerDetails();
    } else {
      toast.error(result?.message || 'Failed to update escrow partnership.');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Store profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col font-mono text-xs text-text-muted justify-center items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(0,184,255,0.3)]" />
        <p className="uppercase tracking-widest text-white">Loading Sentinel Reseller Dossier...</p>
      </div>
    );
  }

  if (!reseller) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center font-sans space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center mx-auto text-accent-amber shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>
            Reseller Not Found
          </h2>
          <p className="text-text-secondary text-xs leading-relaxed">
            The requested trader profile name is either suspended, pending review, or not registered in the Sentinel database.
          </p>
        </div>
        <Link href="/resellers" className="inline-block">
          <Button variant="outline" className="text-xs uppercase font-mono border-white/20">
            &larr; Back to Verified Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isTier2 = reseller.tier2_status === 'approved' || reseller.tier === 2;
  const storeName = reseller.store_name || reseller.storeName || 'BGMI Store';
  const avatar = reseller.profile?.avatar_url || reseller.profile?.avatarUrl;
  const state = reseller.state || reseller.profile?.state || 'Tamil Nadu';
  const operatingSince = reseller.operating_since_year || reseller.operatingSinceYear || 2019;
  const yearsActive = Math.max(1, new Date().getFullYear() - operatingSince);
  const primaryPlatform = reseller.primary_platform || reseller.primaryPlatform || 'both';
  const whatsappNumber = reseller.whatsapp_number || reseller.whatsappNumber;
  const whatsappUsername = reseller.whatsapp_username || reseller.whatsappUsername;
  const whatsappGroupLink = reseller.whatsapp_group_link || reseller.whatsappGroupLink;
  const telegramUsername = reseller.telegram_username || reseller.telegramUsername;
  const telegramChannelLink = reseller.telegram_channel_link || reseller.telegramChannelLink;
  const instagramUsername = reseller.instagram_username || reseller.instagramUsername;
  const bio = reseller.bio || "Authorized BGMI merchant operating with verified trust credentials on 8xSentinel.";
  const specialtiesList: string[] = reseller.specializes_in || reseller.specializesIn || ['budget_accounts', 'premium_accounts', 'uc_recharge'];
  const trustScore = reseller.trust_score ?? 30;

  // Check if current user is another verified reseller
  const isCurrentUserVerifiedReseller = (profile?.role === 'verified_reseller' || profile?.store_status === 'approved') && profile?.id !== reseller.profile_id;
  const hasCurrentUserPartnered = escrowPartners.some(p => p.store?.profile_id === profile?.id || p.store?.profileId === profile?.id);
  const hasCurrentUserVouched = votes.some(v => v.voter_id === profile?.id || v.voterId === profile?.id);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 font-sans">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between gap-4 text-xs font-mono">
        <Link href="/resellers" className="text-text-muted hover:text-accent-cyan transition-colors flex items-center gap-1.5">
          <span>&larr; Verified Resellers Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-[11px] font-mono border-white/10 hover:bg-white/5 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Profile</span>
          </Button>

          {isCurrentUserVerifiedReseller && (
            <Button
              size="sm"
              onClick={handleToggleEscrowPartnership}
              disabled={actionLoading}
              className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                hasCurrentUserPartnered
                  ? 'bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30'
                  : 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40 hover:bg-accent-amber/30'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>{hasCurrentUserPartnered ? 'Leave Escrow Network' : '🤝 Partner as Escrow'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#0e1322] via-[#090c14] to-[#07090f] p-6 md:p-8 overflow-hidden shadow-[0_0_80px_rgba(0,184,255,0.08)]">
        {/* Glow Top Highlight */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${isTier2 ? 'from-amber-500 via-yellow-400 to-amber-500' : 'from-accent-cyan via-accent-blue to-accent-cyan'}`} />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Left: Avatar & Identity Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={storeName}
                  className={`w-24 h-24 rounded-3xl border-2 object-cover ${
                    isTier2 
                      ? 'border-accent-amber shadow-[0_0_30px_rgba(245,158,11,0.35)]' 
                      : 'border-accent-cyan shadow-[0_0_30px_rgba(0,184,255,0.3)]'
                  }`}
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/30 border-2 border-accent-cyan/60 flex items-center justify-center font-bold text-3xl text-accent-cyan font-mono shadow-[0_0_30px_rgba(0,184,255,0.3)]">
                  {storeName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-black/90 p-1.5 rounded-full border border-white/20">
                {isTier2 ? (
                  <Crown className="w-5 h-5 text-accent-amber" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-accent-cyan" />
                )}
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white" style={{ fontFamily: 'var(--font-h)' }}>
                  {storeName}
                </h1>
                
                <Badge className={`text-[11px] uppercase font-mono tracking-wider px-3 py-1 flex items-center gap-1.5 ${
                  isTier2 
                    ? 'bg-accent-amber/20 text-accent-amber border-accent-amber/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50 shadow-[0_0_20px_rgba(0,184,255,0.25)]'
                }`}>
                  {isTier2 ? <Crown className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isTier2 ? 'Sentinel Trusted Elite' : 'Sentinel Verified Reseller'}</span>
                </Badge>
              </div>

              {/* Tag badges */}
              <div className="flex items-center gap-2.5 text-xs text-text-secondary flex-wrap font-mono">
                <span className="flex items-center gap-1.5 text-accent-amber font-bold px-2.5 py-0.5 rounded-md bg-accent-amber/10 border border-accent-amber/20">
                  <MapPin className="w-3.5 h-3.5" />
                  {state} (India)
                </span>
                
                <span className="flex items-center gap-1.5 text-white/80 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
                  In Trade Since {operatingSince} ({yearsActive} Yrs)
                </span>

                <span className="flex items-center gap-1.5 text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" />
                  State Operating Clearance Granted
                </span>
              </div>
            </div>
          </div>

          {/* Right: Radial Trust Score Ring */}
          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
            <div className="text-left lg:text-right space-y-1">
              <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold font-mono">
                Sentinel Trust Rating
              </span>
              <div className="text-2xl md:text-3xl font-black font-mono text-white">
                {trustScore}<span className="text-text-muted text-sm font-normal">/100</span>
              </div>
              <p className="text-[11px] text-accent-green font-mono">
                {votes.length} Peer Reseller Vouch{votes.length === 1 ? '' : 'es'}
              </p>
            </div>

            <TrustScoreRing score={trustScore} size={76} type="reseller" />
          </div>
        </div>

        {/* Core Metric Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-center font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-text-muted block uppercase text-[10px] tracking-wider mb-0.5">Operating Experience</span>
            <span className="text-lg font-bold text-white">{yearsActive} Years Active</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-text-muted block uppercase text-[10px] tracking-wider mb-0.5">Peer Vouches</span>
            <span className="text-lg font-bold text-accent-cyan">{votes.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-text-muted block uppercase text-[10px] tracking-wider mb-0.5">Escrow Middlemen</span>
            <span className="text-lg font-bold text-accent-amber">{escrowPartners.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-text-muted block uppercase text-[10px] tracking-wider mb-0.5">Security Status</span>
            <span className="text-lg font-bold text-emerald-400">100% Vetted</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Direct Trade Deck & Escrow Network */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Direct Channels & Escrow Network */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Direct Contact & Operating Channels Deck */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-accent-cyan font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Direct Verified Trading Channels</span>
              </h2>
              <span className="text-[10px] text-text-muted font-mono uppercase">
                Active Protocol: <strong className="text-white">{primaryPlatform.replace(/_/g, ' ')}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* WhatsApp Action Card */}
              {whatsappNumber ? (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-md space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <WhatsAppLogo />
                      <span>WhatsApp Store Gateway</span>
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-mono uppercase">
                      VERIFIED DIRECT
                    </Badge>
                  </div>

                  <div className="text-sm font-bold text-white font-mono">
                    {whatsappNumber}
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat Directly on WhatsApp</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    {whatsappGroupLink && (
                      <a
                        href={whatsappGroupLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-all truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Join Official WA Store Group</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Telegram Action Card */}
              {telegramUsername ? (
                <div className="p-5 rounded-2xl border border-sky-500/30 bg-sky-950/20 backdrop-blur-md space-y-3 shadow-[0_0_30px_rgba(14,165,233,0.05)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 font-mono">
                      <TelegramLogo />
                      <span>Telegram Protocol Gateway</span>
                    </span>
                    <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 text-[9px] font-mono uppercase">
                      SECURE DM
                    </Badge>
                  </div>

                  <div className="text-sm font-bold text-white font-mono">
                    @{telegramUsername.replace('@', '')}
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://t.me/${telegramUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open Telegram DM</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    {telegramChannelLink && (
                      <a
                        href={telegramChannelLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-2 transition-all truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        <span>Join Telegram Store Channel</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* 2. Official Verified Escrow Middlemen Hub */}
          <div className="p-6 rounded-3xl border border-accent-amber/30 bg-gradient-to-b from-accent-amber/[0.04] to-transparent backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-accent-amber/20 pb-4">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wide text-accent-amber font-mono flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-accent-amber" />
                  <span>Verified Escrow Middleman Network</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Want 100% deal safety? Choose any of these vetted peer resellers to act as your independent Escrow Agent.
                </p>
              </div>

              {isCurrentUserVerifiedReseller && (
                <Button
                  size="sm"
                  onClick={handleToggleEscrowPartnership}
                  disabled={actionLoading}
                  className={`text-xs font-mono uppercase font-bold shrink-0 ${
                    hasCurrentUserPartnered
                      ? 'bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30'
                      : 'bg-accent-amber/20 text-accent-amber border border-accent-amber/40 hover:bg-accent-amber/30'
                  }`}
                >
                  <Handshake className="w-3.5 h-3.5 mr-1" />
                  <span>{hasCurrentUserPartnered ? 'Leave Escrow Network' : '🤝 Join as Escrow Partner'}</span>
                </Button>
              )}
            </div>

            {/* Escrow Partner Cards */}
            {escrowPartners.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-3">
                <Lock className="w-10 h-10 text-accent-amber/60 mx-auto" />
                <p className="text-xs text-text-muted font-mono">
                  No designated peer escrow partners linked yet. All deals remain protected under 8xSentinel standard verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {escrowPartners.map((partner) => {
                  const partnerStore = partner.store;
                  if (!partnerStore) return null;
                  const partnerAvatar = partnerStore.profile?.avatar_url || partnerStore.profile?.avatarUrl;
                  const partnerName = partnerStore.store_name || partnerStore.storeName || 'Partner Store';
                  const partnerScore = partnerStore.trust_score ?? 50;

                  return (
                    <div
                      key={partner.id}
                      className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-accent-amber/40 transition-all flex flex-col justify-between gap-3 space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        {partnerAvatar ? (
                          <img src={partnerAvatar} alt={partnerName} className="w-10 h-10 rounded-xl border border-white/20 object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center font-bold text-accent-amber font-mono">
                            {partnerName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white truncate uppercase font-mono">{partnerName}</h4>
                          <p className="text-[11px] text-accent-amber font-mono flex items-center gap-1">
                            <span>★ Trust Score: {partnerScore}/100</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-text-secondary italic line-clamp-2">
                        "{partner.terms || 'Verified Middleman on 8xSentinel.'}"
                      </div>

                      <Button
                        size="sm"
                        onClick={() => setSelectedEscrowPartner(partnerStore)}
                        className="w-full bg-accent-amber/15 hover:bg-accent-amber/25 text-accent-amber border border-accent-amber/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Request Escrow via {partnerName}</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. State Clearance & Verification Audit Deck */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
            <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider font-mono flex items-center gap-2 border-b border-white/10 pb-3">
              <FileCheck2 className="w-4 h-4 text-accent-cyan" />
              <span>Sentinel Merchant Verification Audit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-text-muted text-[10px] uppercase">State Clearance</span>
                <p className="font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent-amber" />
                  {state} (South/North)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-text-muted text-[10px] uppercase">Identity Clearance</span>
                <p className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Google ID Verified
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-text-muted text-[10px] uppercase">Tier Distinction</span>
                <p className="font-bold text-accent-cyan flex items-center gap-1">
                  {isTier2 ? <Crown className="w-3.5 h-3.5 text-accent-amber" /> : <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />}
                  {isTier2 ? 'Sentinel Trusted' : 'Sentinel Verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Peer Reseller Vouches, Store Bio & Specialties */}
        <div className="space-y-6">
          
          {/* Peer Reseller Vouches Wall Card */}
          <div className="p-6 rounded-3xl border border-accent-cyan/30 bg-accent-cyan/[0.02] space-y-4">
            <div className="flex items-center justify-between border-b border-accent-cyan/20 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Peer Reseller Vouches ({votes.length})</span>
              </span>
              <Badge className="bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30 text-[9px] font-mono">
                TRUSTED
              </Badge>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Verified fellow resellers who have personally traded and vouched for this store.
            </p>

            {/* List of vouches */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {votes.length === 0 ? (
                <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-xs text-text-muted font-mono">
                  No peer vouches yet.
                </div>
              ) : (
                votes.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={v.voter?.avatar_url || v.voter?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                        alt="Voter"
                        className="w-5 h-5 rounded-full border border-white/20 object-cover"
                      />
                      <span className="font-bold text-white truncate font-mono text-[11px]">
                        {v.voter?.display_name || v.voter?.displayName || v.voter?.username || 'Verified Reseller'}
                      </span>
                    </div>
                    <span className="text-[10px] text-accent-green font-mono shrink-0 flex items-center gap-1">
                      <ThumbsUp className="w-2.5 h-2.5" /> Vouched
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Vouch Button */}
            <Button
              onClick={handleVoteTrust}
              disabled={actionLoading || hasCurrentUserVouched || profile?.id === reseller.profile_id}
              className={`w-full text-xs font-mono uppercase font-bold py-2.5 transition-all ${
                hasCurrentUserVouched
                  ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
                  : 'bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/40 shadow-[0_0_15px_rgba(0,184,255,0.2)]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
              <span>{hasCurrentUserVouched ? '✓ You Vouched for this Store' : '+1 Vouch as Trusted Reseller'}</span>
            </Button>
          </div>

          {/* Specialties & Trading Focus */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5 border-b border-white/10 pb-3">
              <Tag className="w-4 h-4 text-accent-amber" />
              <span>Approved Trading Catalog</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {specialtiesList.map((id) => {
                const meta = specialtyMeta[id] || { label: id.replace(/_/g, ' '), icon: Tag, color: 'text-accent-cyan', bg: 'bg-white/5', border: 'border-white/10' };
                const IconComponent = meta.icon;
                return (
                  <span
                    key={id}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${meta.bg} ${meta.border} ${meta.color}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{meta.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Store Bio & Verification Seal */}
          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5 border-b border-white/10 pb-3">
              <Building2 className="w-4 h-4 text-accent-cyan" />
              <span>Store Bio & Integrity</span>
            </span>

            <p className="text-xs text-text-secondary leading-relaxed italic border-l-2 border-accent-cyan/40 pl-3 py-1">
              "{bio}"
            </p>

            {instagramUsername && (
              <div className="pt-2 border-t border-white/5">
                <a
                  href={`https://instagram.com/${instagramUsername.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl border border-pink-500/30 bg-pink-950/20 text-pink-300 text-xs font-mono flex items-center justify-between hover:bg-pink-950/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <InstagramLogo />
                    <span>@{instagramUsername.replace('@', '')}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Escrow Request 3-Way Deal Modal */}
      <Dialog open={!!selectedEscrowPartner} onOpenChange={(open) => !open && setSelectedEscrowPartner(null)}>
        <DialogContent className="max-w-md bg-[#090c14] border border-accent-amber/40 text-white font-sans rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.2)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-mono uppercase text-accent-amber">
              <Handshake className="w-5 h-5 text-accent-amber" />
              <span>3-Way Protected Escrow Deal</span>
            </DialogTitle>
          </DialogHeader>

          {selectedEscrowPartner && (
            <div className="space-y-4 text-xs">
              <p className="text-text-secondary leading-relaxed">
                You are requesting an Escrow Middleman transaction between <strong className="text-white">{storeName}</strong> (Seller) and yourself (Buyer), supervised by <strong className="text-accent-amber">{selectedEscrowPartner.store_name || selectedEscrowPartner.storeName}</strong>.
              </p>

              {/* Escrow Protocol Steps */}
              <div className="p-4 rounded-xl bg-black/40 border border-accent-amber/20 space-y-2.5 font-mono text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Create a 3-way Group on WhatsApp or Telegram with the Seller & Middleman.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Buyer deposits deal payment securely into the Escrow Agent's custody.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span>Seller transfers full BGMI account credentials & unbinds social links.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-accent-amber/20 text-accent-amber flex items-center justify-center text-[10px] shrink-0">4</span>
                  <span>Buyer verifies access, Escrow Agent releases payout to Seller. Zero Scam Risk.</span>
                </div>
              </div>

              {/* Direct Buttons to Escrow Agent */}
              <div className="space-y-2 pt-2">
                {selectedEscrowPartner.whatsapp_number && (
                  <a
                    href={`https://wa.me/${selectedEscrowPartner.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20want%20to%20request%20an%20escrow%20trade%20for%20a%20deal%20with%20${encodeURIComponent(storeName)}%20via%208xSentinel`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <WhatsAppLogo />
                    <span>Contact Middleman on WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedEscrowPartner.telegram_username && (
                  <a
                    href={`https://t.me/${selectedEscrowPartner.telegram_username.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <TelegramLogo />
                    <span>Contact Middleman on Telegram</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
