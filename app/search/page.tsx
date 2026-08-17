'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar, { SearchType } from '../../components/ui/SearchBar';
import ScammerCard from '../../components/ui/ScammerCard';
import SellerCard from '../../components/ui/SellerCard';
import AuthButton from '../../components/auth/AuthButton';
import { db } from '../../lib/db';
import { ScammerEntity, TrustedReseller } from '../../types';
import { useAuth } from '../../lib/firebase/AuthContext';
import { 
  Filter, 
  Info, 
  ShieldCheck, 
  Lock, 
  ShieldAlert, 
  AlertTriangle,
  ExternalLink,
  Phone,
  Send,
  CreditCard,
  Gamepad2,
  Calendar,
  DollarSign,
  Gift,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Copy,
  Check,
  Shield,
  Layers,
  ArrowRight,
  FileText,
  Flame
} from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { toast } from 'sonner';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as SearchType;

  const [query, setQuery] = useState(queryParam);
  const [filterType, setFilterType] = useState<'all' | 'scammers' | 'resellers'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [scamTypeFilter, setScamTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'loss_high' | 'bounty_high'>('newest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [results, setResults] = useState<{ 
    scammers: ScammerEntity[]; 
    reports: any[]; 
    resellers: TrustedReseller[] 
  }>({
    scammers: [],
    reports: [],
    resellers: []
  });
  const [loading, setLoading] = useState(true);

  const { user, profile, canViewResellers } = useAuth();
  const isUserAuthenticated = !!user || !!profile;

  // Fetch search or default records whenever query/auth state changes
  useEffect(() => {
    setQuery(queryParam);
    if (isUserAuthenticated) {
      setLoading(true);
      db.search(queryParam, typeParam)
        .then((searchRes: any) => {
          setResults({
            scammers: searchRes?.scammers || [],
            reports: searchRes?.reports || [],
            resellers: searchRes?.resellers || []
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setLoading(false);
        });
    }
  }, [queryParam, typeParam, isUserAuthenticated]);

  const handleCopy = (text: string, id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Deduplicate: remove reports already represented in grouped scammer entities
  const entityIds = useMemo(() => new Set(results.scammers.map(s => s.id)), [results.scammers]);
  const uniqueReports = useMemo(() => {
    return results.reports.filter(r => !r.scammer_entity_id || !entityIds.has(r.scammer_entity_id));
  }, [results.reports, entityIds]);

  // Apply sub-filters & sorting to reports
  const filteredReports = useMemo(() => {
    let list = [...uniqueReports];

    if (statusFilter !== 'all') {
      list = list.filter(r => (r.status || 'pending').toLowerCase() === statusFilter);
    }

    if (scamTypeFilter !== 'all') {
      list.sort((a, b) => (Number(b.amount_lost) || 0) - (Number(a.amount_lost) || 0));
    } else if (sortBy === 'bounty_high') {
      list.sort((a, b) => {
        const bountyA = Number(a.additional_identifiers?.recovery_bounty_amount) || 0;
        const bountyB = Number(b.additional_identifiers?.recovery_bounty_amount) || 0;
        return bountyB - bountyA;
      });
    }

    return list;
  }, [uniqueReports, statusFilter, scamTypeFilter, sortBy]);

  // Stats calculation
  const totalBlacklistCount = results.scammers.length + uniqueReports.length;
  const totalFinancialLoss = useMemo(() => {
    const fromReports = uniqueReports.reduce((sum, r) => sum + (Number(r.amount_lost) || 0), 0);
    const fromEntities = results.scammers.reduce((sum, s) => sum + (Number(s.total_amount_lost) || 0), 0);
    return fromReports + fromEntities;
  }, [uniqueReports, results.scammers]);

  const activeBountiesCount = useMemo(() => {
    return uniqueReports.filter(r => Number(r.additional_identifiers?.recovery_bounty_amount) > 0).length;
  }, [uniqueReports]);

  const displayedScammers = (filterType === 'all' || filterType === 'scammers') ? results.scammers : [];
  const displayedReports = (filterType === 'all' || filterType === 'scammers') ? filteredReports : [];
  const displayedResellers = (filterType === 'all' || filterType === 'resellers') ? results.resellers : [];
  const hasDisplayedResults = displayedScammers.length > 0 || displayedReports.length > 0 || displayedResellers.length > 0;

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Confirmed Scammer
        </span>
      );
    }
    if (s === 'withdrawn') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-gray-500/15 text-gray-400 border border-gray-500/30">
          Case Withdrawn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <Clock className="w-2.5 h-2.5" />
        Pending Review
      </span>
    );
  };

  const getScamTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_account_freeze': return '🏦 Bank Account Freeze';
      case 'account_pullback': return '🔄 Account Pullback';
      case 'fake_account_sale': return '💸 Fake Account Sale';
      case 'payment_fraud': return '⚠️ Payment Fraud';
      case 'fake_buyer': return '🎭 Fake Buyer';
      case 'impersonation': return '👥 Impersonation Scam';
      case 'item_scam': return '📦 Item Scam';
      case 'advance_payment': return '💵 Advance Payment Fraud';
      case 'qr_phishing': return '📲 QR Phishing';
      default: return '⚠️ ' + (type ? type.replace(/_/g, ' ') : 'Scam Incident');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Decentralized Sentinel Intelligence</span>
          </div>
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            Trust &amp; Blacklist <span className="text-accent-cyan">Database</span>
          </h1>
          <p className="text-text-secondary text-sm font-sans max-w-2xl leading-relaxed">
            Live community blacklist registry for the BGMI gaming ecosystem. Query contact credentials, banking details, Character IDs, and review active recovery bounties.
          </p>
        </div>

        {/* Quick Report CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.push('/submit-report')}
            className="btn btn-primary px-5 py-3 text-xs uppercase font-bold tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-transform"
          >
            <ShieldAlert className="w-4 h-4 text-bg-void" />
            <span>Submit Scam Report</span>
          </button>
        </div>
      </div>

      {/* Authentication Lock Screen for unauthenticated visitors */}
      {!isUserAuthenticated ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-6 max-w-xl mx-auto border border-accent-cyan/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Lock className="w-8 h-8 text-accent-cyan animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 
              className="text-2xl font-bold uppercase tracking-wider text-white"
              style={{ fontFamily: 'var(--font-h)' }}
            >
              Authentication Required
            </h2>
            <p className="text-xs text-text-secondary font-sans max-w-md mx-auto leading-relaxed">
              Sign in with Google to query the Centralized Blacklist Registry, inspect scammer dossier proofs, and contact verified merchants.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <AuthButton />
          </div>
        </div>
      ) : (
        <>
          {/* Platform Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-cyan/30 transition-all flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Tracked Reports</span>
                <span className="text-xl font-bold text-white font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  {totalBlacklistCount}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-cyan/30 transition-all flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Documented Losses</span>
                <span className="text-xl font-bold text-amber-400 font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  ₹{totalFinancialLoss.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-cyan/30 transition-all flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Recovery Bounties</span>
                <span className="text-xl font-bold text-purple-400 font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  {activeBountiesCount} Active
                </span>
              </div>
            </div>

            {canViewResellers ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-cyan/30 transition-all flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Verified Resellers</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                    {results.resellers.length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-cyan/30 transition-all flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Sentinel Shield</span>
                  <span className="text-xl font-bold text-accent-cyan font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                    24/7 Active
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Search Bar Component */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Search className="w-4 h-4 text-accent-cyan" />
                <span>Search Global Blacklist &amp; Fraud Records</span>
              </span>
              {queryParam && (
                <span className="text-[11px] text-accent-cyan font-mono">
                  Showing results for: <strong className="text-white font-bold">"{queryParam}"</strong>
                </span>
              )}
            </div>

            <SearchBar 
              initialQuery={queryParam} 
              initialType={typeParam} 
              placeholder="Enter Phone Number, Telegram, UPI, Bank Account, BGMI UID, or Scammer Name..." 
            />
          </div>

          {/* Controls Bar: Category Tabs, Filters, Sort */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
              
              {/* Primary Category Switcher */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                    filterType === 'all'
                      ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/15 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'border-white/5 bg-white/[0.02] text-text-secondary hover:text-white hover:border-white/15'
                  }`}
                  style={{ fontFamily: 'var(--font-h)' }}
                >
                  All Records ({canViewResellers ? totalBlacklistCount + results.resellers.length : totalBlacklistCount})
                </button>

                <button
                  onClick={() => setFilterType('scammers')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                    filterType === 'scammers'
                      ? 'border-red-500 text-red-400 bg-red-500/15 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'border-white/5 bg-white/[0.02] text-text-secondary hover:text-white hover:border-white/15'
                  }`}
                  style={{ fontFamily: 'var(--font-h)' }}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Scam Reports ({totalBlacklistCount})</span>
                </button>

                {canViewResellers && (
                  <button
                    onClick={() => setFilterType('resellers')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                      filterType === 'resellers'
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'border-white/5 bg-white/[0.02] text-text-secondary hover:text-white hover:border-white/15'
                    }`}
                    style={{ fontFamily: 'var(--font-h)' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Resellers ({results.resellers.length})</span>
                  </button>
                )}
              </div>

              {/* Sub-Filters: Status, Scam Type, Sort */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-accent-cyan focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved Blacklist</option>
                  <option value="pending">Pending Moderation</option>
                </select>

                {/* Scam Type Filter */}
                <select
                  value={scamTypeFilter}
                  onChange={(e) => setScamTypeFilter(e.target.value)}
                  className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-accent-cyan focus:outline-none cursor-pointer"
                >
                  <option value="all">All Scam Types</option>
                  <option value="bank_account_freeze">Bank Freeze</option>
                  <option value="account_pullback">Account Pullback</option>
                  <option value="fake_account_sale">Fake Account Sale</option>
                  <option value="payment_fraud">Payment Fraud</option>
                  <option value="impersonation">Impersonation</option>
                  <option value="advance_payment">Advance Payment</option>
                </select>

                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary font-mono focus:border-accent-cyan focus:outline-none cursor-pointer"
                >
                  <option value="newest">Latest Incidents</option>
                  <option value="loss_high">Highest Loss</option>
                  <option value="bounty_high">Highest Bounty Reward</option>
                </select>
              </div>
            </div>

            {/* Results Presentation */}
            {loading ? (
              <div className="py-24 text-center text-text-muted space-y-3">
                <span className="w-10 h-10 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block" />
                <p className="text-xs uppercase font-bold tracking-widest text-accent-cyan font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  Scanning Sentinel Blacklist Registry...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* No Matches Alert */}
                {!hasDisplayedResults && (
                  <div className="p-8 rounded-3xl glass-panel border border-emerald-500/30 text-emerald-400 space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-h)' }}>
                          No Blacklisted Records Matching {queryParam ? `"${queryParam}"` : 'Filters'}
                        </h3>
                        <p className="text-xs text-text-secondary font-sans leading-relaxed">
                          This identifier or filter currently has zero registered scam reports or dispute logs. Always exercise standard escrow due diligence.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => router.push('/submit-report')}
                        className="btn btn-primary py-2 px-4 text-xs uppercase font-bold"
                      >
                        File a Scam Report
                      </button>
                      <button
                        onClick={() => {
                          setFilterType('all');
                          setStatusFilter('all');
                          setScamTypeFilter('all');
                          router.push('/search');
                        }}
                        className="btn btn-ghost py-2 px-4 text-xs uppercase"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </div>
                )}

                {/* Grouped Scammer Entities */}
                {displayedScammers.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 
                        className="text-xs font-bold text-accent-red uppercase tracking-wider flex items-center gap-2 font-mono"
                        style={{ fontFamily: 'var(--font-h)' }}
                      >
                        <Flame className="w-4 h-4 text-accent-red" />
                        <span>Flagged Scammer Entities ({displayedScammers.length})</span>
                      </h3>
                      <span className="text-[10px] text-text-muted font-mono">Consolidated dossiers</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedScammers.map(scammer => (
                        <ScammerCard key={scammer.id} entity={scammer} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Individual Scam Reports Feed */}
                {displayedReports.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 
                        className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 font-mono"
                        style={{ fontFamily: 'var(--font-h)' }}
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Active Scam Reports &amp; Cases ({displayedReports.length})</span>
                      </h3>
                      <span className="text-[10px] text-text-muted font-mono">Community-verified dispute logs</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {displayedReports.map((report: any) => {
                        const bountyAmount = Number(report.additional_identifiers?.recovery_bounty_amount) || 0;
                        const bountyPercent = Number(report.additional_identifiers?.recovery_bounty_percentage) || 0;
                        const victimPhone = report.additional_identifiers?.victim_whatsapp || report.additional_identifiers?.victim_phone_number;
                        const evidenceCount = Array.isArray(report.evidence_links) ? report.evidence_links.length : 0;
                        const frozenBank = report.additional_identifiers?.frozen_bank_name;
                        const bankAcc = report.additional_identifiers?.bank_account;

                        return (
                          <div
                            key={report.id}
                            className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-accent-red/50 transition-all duration-200 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] group"
                          >
                            {/* Card Top Row: Scammer Name, Status, Scam Type, Date */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 font-bold font-mono">
                                  <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 
                                      className="text-base font-bold text-white uppercase tracking-wide group-hover:text-accent-red transition-colors truncate"
                                      style={{ fontFamily: 'var(--font-h)' }}
                                    >
                                      {report.scammer_name}
                                    </h4>
                                    {getStatusBadge(report.status)}
                                  </div>
                                  <p className="text-[11px] text-text-muted font-mono mt-0.5">
                                    Report ID: <span className="text-text-secondary">{report.id}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                                <span className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-mono uppercase font-bold">
                                  {getScamTypeLabel(report.scam_type)}
                                </span>
                                <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(report.incident_date || report.created_at).toLocaleDateString()}</span>
                                </span>
                              </div>
                            </div>

                            {/* Identifiers Badges Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                              {report.whatsapp_number && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                                  <div className="flex items-center gap-2 truncate">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="text-text-secondary truncate">{report.whatsapp_number}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopy(report.whatsapp_number, `${report.id}-wa`, e)}
                                    className="text-text-muted hover:text-white p-1 rounded transition-colors"
                                    title="Copy WhatsApp"
                                  >
                                    {copiedId === `${report.id}-wa` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}

                              {report.telegram_username && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                                  <div className="flex items-center gap-2 truncate">
                                    <Send className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span className="text-text-secondary truncate">@{report.telegram_username}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopy(report.telegram_username, `${report.id}-tg`, e)}
                                    className="text-text-muted hover:text-white p-1 rounded transition-colors"
                                    title="Copy Telegram"
                                  >
                                    {copiedId === `${report.id}-tg` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}

                              {report.bgmi_uid && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                                  <div className="flex items-center gap-2 truncate">
                                    <Gamepad2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                    <span className="text-text-secondary truncate">UID: {report.bgmi_uid}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopy(report.bgmi_uid, `${report.id}-uid`, e)}
                                    className="text-text-muted hover:text-white p-1 rounded transition-colors"
                                    title="Copy UID"
                                  >
                                    {copiedId === `${report.id}-uid` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}

                              {report.upi_id && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                                  <div className="flex items-center gap-2 truncate">
                                    <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="text-text-secondary truncate">{report.upi_id}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopy(report.upi_id, `${report.id}-upi`, e)}
                                    className="text-text-muted hover:text-white p-1 rounded transition-colors"
                                    title="Copy UPI"
                                  >
                                    {copiedId === `${report.id}-upi` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}

                              {frozenBank && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-text-secondary truncate">
                                  <span className="text-red-400 font-bold">Frozen Bank:</span>
                                  <span className="truncate">{frozenBank}</span>
                                </div>
                              )}

                              {bankAcc && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-text-secondary truncate">
                                  <span className="text-amber-400 font-bold">Bank A/C:</span>
                                  <span className="truncate">{bankAcc}</span>
                                </div>
                              )}
                            </div>

                            {/* Incident Description Snippet */}
                            {report.description && (
                              <p className="text-xs text-text-secondary font-sans leading-relaxed line-clamp-2 bg-white/[0.01] p-3 rounded-xl border border-white/5">
                                "{report.description}"
                              </p>
                            )}

                            {/* Financial Impact, Bounty & Action Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-3 flex-wrap">
                                {/* Total Loss */}
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
                                  <span>Impact:</span>
                                  <span className="text-sm text-red-300">₹{(report.amount_lost || 0).toLocaleString('en-IN')}</span>
                                </div>

                                {/* Recovery Bounty Badge if active */}
                                {bountyAmount > 0 && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <Gift className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{bountyPercent}% Recovery Bounty (₹{bountyAmount.toLocaleString('en-IN')})</span>
                                  </div>
                                )}

                                {/* Evidence Count Indicator */}
                                {evidenceCount > 0 && (
                                  <span className="text-[11px] text-accent-cyan font-mono flex items-center gap-1 bg-sky-500/10 px-2.5 py-1.5 rounded-xl border border-sky-500/20">
                                    <FileText className="w-3 h-3" />
                                    <span>{evidenceCount} Evidence Link{evidenceCount !== 1 ? 's' : ''} Attached</span>
                                  </span>
                                )}
                              </div>

                              {/* Action Link */}
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/report/${report.id}`)}
                                  className="btn btn-outline py-2 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 group-hover:border-accent-cyan group-hover:text-accent-cyan transition-colors"
                                >
                                  <span>Inspect Dossier</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Verified Resellers Grid */}
                {displayedResellers.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 
                        className="text-xs font-bold text-accent-green uppercase tracking-wider flex items-center gap-2 font-mono"
                        style={{ fontFamily: 'var(--font-h)' }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent-green" />
                        <span>Verified Sentinel Reseller Stores ({displayedResellers.length})</span>
                      </h3>
                      <button
                        onClick={() => router.push('/resellers')}
                        className="text-[11px] text-accent-cyan hover:underline font-mono"
                      >
                        View Full Reseller Directory →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {displayedResellers.map(reseller => (
                        <SellerCard key={reseller.id} reseller={reseller} />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto py-24 text-center text-text-muted space-y-3 font-mono">
            <span className="w-10 h-10 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block" />
            <p className="text-xs uppercase font-bold text-accent-cyan tracking-widest" style={{ fontFamily: 'var(--font-h)' }}>
              Loading Sentinel Registry...
            </p>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </ProtectedRoute>
  );
}
