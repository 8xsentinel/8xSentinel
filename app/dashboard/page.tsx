"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserCircle, 
  History, 
  AlertCircle, 
  Crown, 
  MapPin, 
  FileText, 
  Phone, 
  Mail, 
  User, 
  Edit3,
  Search,
  CheckCircle2,
  ExternalLink,
  Send,
  Star,
  Sparkles,
  Zap,
  Tag,
  Flame,
  Gauge,
  ArrowUpRight,
  RotateCcw,
  Clock,
  Check,
  Building2,
  Layers,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Award
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import StoreOnboardingModal from "@/components/auth/StoreOnboardingModal";
import MemberOnboardingModal from "@/components/auth/MemberOnboardingModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { toast } from "sonner";

const TelegramLogo = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.562 8.161c-.18.847-.96 4.966-1.36 7.106-.17.904-.5 1.206-.82 1.236-.697.064-1.226-.46-1.9-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 7.002-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.094.036.309.02.477Z"/>
  </svg>
);

const WhatsAppLogo = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function DashboardPage() {
  const { user, profile, isSuperAdmin, isRegionalAdmin, isVerifiedReseller, isMember, loading } = useAuth();
  const router = useRouter();

  const isAdmin = isSuperAdmin || isRegionalAdmin;
  const [storeData, setStoreData] = useState<any>(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingMemberContact, setIsEditingMemberContact] = useState(false);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Incident filter & search state
  const [reportFilter, setReportFilter] = useState<'all' | 'approved' | 'pending' | 'withdrawn'>('all');
  const [reportSearch, setReportSearch] = useState('');

  // Inquiry / Appeal state
  const [inquiryType, setInquiryType] = useState('verification_update');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Tier 2 distinction application state
  const [applyingTier2, setApplyingTier2] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (isAdmin) {
        router.push("/admin");
      } else if (profile?.id) {
        if (isVerifiedReseller) {
          setLoadingStore(true);
          db.getUserStoreApplication(profile.id).then((res) => {
            setStoreData(res);
            setLoadingStore(false);
          });
        }

        setLoadingReports(true);
        db.getUserReports(profile.id).then((res) => {
          setUserReports(res || []);
          setLoadingReports(false);
        });
      }
    }
  }, [loading, user, isAdmin, router, profile?.id, isVerifiedReseller]);

  // Filter user's filed reports
  const filteredUserReports = useMemo(() => {
    return userReports.filter((r) => {
      const statusMatch = reportFilter === 'all' || (r.status || 'pending').toLowerCase() === reportFilter;
      const searchMatch = !reportSearch.trim() || 
        (r.scammer_name || '').toLowerCase().includes(reportSearch.toLowerCase().trim()) ||
        (r.whatsapp_number || '').includes(reportSearch.trim()) ||
        (r.upi_id || '').toLowerCase().includes(reportSearch.toLowerCase().trim()) ||
        (r.scam_type || '').toLowerCase().includes(reportSearch.toLowerCase().trim());
      return statusMatch && searchMatch;
    });
  }, [userReports, reportFilter, reportSearch]);

  // Aggregate stats
  const totalAmountReported = useMemo(() => {
    return userReports.reduce((acc, curr) => acc + (Number(curr.amount_lost) || 0), 0);
  }, [userReports]);

  const approvedCount = useMemo(() => {
    return userReports.filter(r => (r.status || '').toLowerCase() === 'approved').length;
  }, [userReports]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) {
      toast.error("Please enter details for your inquiry.");
      return;
    }
    setSubmittingInquiry(true);
    setTimeout(() => {
      setSubmittingInquiry(false);
      setInquiryMessage("");
      toast.success("Inquiry Dispatched", {
        description: "Your message has been routed to the Regional Moderation Desk."
      });
    }, 800);
  };

  const handleApplyTier2 = () => {
    setApplyingTier2(true);
    setTimeout(() => {
      setApplyingTier2(false);
      toast.success("Tier 2 Distinction Requested", {
        description: "Your store profile and trading track record have been submitted for Regional Admin verification."
      });
    }, 1000);
  };

  if (loading || !user || isAdmin) {
    return (
      <div className="container py-32 text-center font-mono space-y-3">
        <div className="w-10 h-10 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]" />
        <p className="text-xs text-text-muted">Loading Sentinel Deck...</p>
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Member";
  const contactPhone = profile?.whatsapp_username || profile?.phone_number || "Not configured";
  const stateLocation = profile?.state || profile?.region || storeData?.state || "India";
  const isTier2 = storeData?.tier2_status === 'approved' || storeData?.tier === 2;

  return (
    <ProtectedRoute>
      <div className="container py-10 max-w-6xl mx-auto space-y-8 font-sans">
        
        {/* ─── 1. HERO COMMAND HEADER ─── */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] via-[#0b0f19] to-[#07090f] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-cyan via-accent-amber to-emerald-400 opacity-80" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="relative">
                {profile?.avatar_url || profile?.avatarUrl ? (
                  <img
                    src={profile.avatar_url || profile.avatarUrl || ''}
                    alt={displayName}
                    className={`w-16 h-16 rounded-2xl border-2 object-cover ${isTier2 ? 'border-accent-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border-2 border-accent-cyan flex items-center justify-center font-black text-accent-cyan font-mono text-xl">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090d16] flex items-center justify-center" title="Active">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-cyan">
                    {isVerifiedReseller ? "RESELLER PORTAL" : "MEMBER HUB"}
                  </span>
                  {stateLocation && (
                    <Badge className="bg-white/5 text-text-secondary border-white/10 px-2.5 py-0.5 font-mono text-[10px] flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-accent-cyan" />
                      <span>{stateLocation}</span>
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase truncate" style={{ fontFamily: 'var(--font-h)' }}>
                  {isVerifiedReseller ? (storeData?.store_name || storeData?.storeName || displayName) : displayName}
                </h1>
                
                <p className="text-xs text-text-secondary">
                  {isVerifiedReseller 
                    ? "Verified BGMI merchant operating across India. Manage your trading profile & filed incident reports." 
                    : "Sentinel community account for fraud dispute reporting and victim recovery tracking."}
                </p>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
              <Link href="/submit-report" className="flex-1 sm:flex-initial">
                <Button className="btn btn-red w-full text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 py-2.5 px-4 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Report Scammer</span>
                </Button>
              </Link>

              {isVerifiedReseller && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs font-mono border-white/10 hover:border-accent-cyan/40 flex items-center gap-1.5 py-2.5 px-4"
                >
                  <Edit3 className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Edit Profile</span>
                </Button>
              )}
            </div>
          </div>

          {/* ─── KPI METRICS BAR ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/5">
            {/* Metric 1: Trust Score */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-cyan/30 transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent-cyan" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Trust Score</span>
                <span className="text-lg font-bold text-accent-cyan font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  {isVerifiedReseller ? (storeData?.trust_score || 94) : "100"}/100
                </span>
              </div>
            </div>

            {/* Metric 2: Reports Filed */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-cyan/30 transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Incident Filings</span>
                <span className="text-lg font-bold text-emerald-400 font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  {userReports.length} {userReports.length === 1 ? 'Report' : 'Reports'}
                </span>
              </div>
            </div>

            {/* Metric 3: Losses Documented */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-cyan/30 transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-accent-amber/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-accent-amber" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Documented Losses</span>
                <span className="text-lg font-bold text-accent-amber font-mono" style={{ fontFamily: 'var(--font-h)' }}>
                  ₹{totalAmountReported.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Metric 4: Clearance Record */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-cyan/30 transition-all flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider block">Clearance Health</span>
                <span className="text-lg font-bold text-purple-400 font-mono truncate block" style={{ fontFamily: 'var(--font-h)' }}>
                  100% Clean
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. DYNAMIC DECK TABS ─── */}
        <Tabs defaultValue="reports" className="w-full space-y-6">
          <TabsList className="w-full justify-start border-b border-white/10 rounded-none h-auto p-0 bg-transparent overflow-x-auto scrollbar-thin snap-x whitespace-nowrap">
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan data-[state=active]:text-accent-cyan text-text-secondary rounded-none px-5 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold transition-all cursor-pointer"
            >
              My Submitted Reports ({userReports.length})
            </TabsTrigger>

            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan data-[state=active]:text-accent-cyan text-text-secondary rounded-none px-5 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold transition-all cursor-pointer"
            >
              {isVerifiedReseller ? "Store Profile" : "Member Identity"}
            </TabsTrigger>

            {isVerifiedReseller && (
              <>
                <TabsTrigger 
                  value="verification" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan data-[state=active]:text-accent-cyan text-text-secondary rounded-none px-5 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold transition-all cursor-pointer"
                >
                  Verification Tiers
                </TabsTrigger>
                <TabsTrigger 
                  value="appeals" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan data-[state=active]:text-accent-cyan text-text-secondary rounded-none px-5 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold transition-all cursor-pointer"
                >
                  Disputes & Compliance
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* ─── TAB 1: MY SUBMITTED INCIDENTS ─── */}
          <TabsContent value="reports" className="space-y-6 animate-in fade-in duration-200">
            <Card className="glass-panel border-white/10 rounded-2xl p-2 sm:p-4">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white text-lg uppercase font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
                      <FileText className="w-5 h-5 text-accent-cyan" />
                      <span>My Filed Incident Reports</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary mt-1">
                      Track the verification status, assigned evidence, and recovery bounty progress of your scam filings.
                    </CardDescription>
                  </div>

                  <Link href="/submit-report">
                    <Button size="sm" className="btn btn-red text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>File New Report</span>
                    </Button>
                  </Link>
                </div>

                {/* Sub-Filters & In-Deck Search */}
                {userReports.length > 0 && (
                  <div className="pt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-white/5">
                    {/* Status Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
                      {[
                        { id: 'all', label: `All (${userReports.length})` },
                        { id: 'approved', label: `Approved (${approvedCount})` },
                        { id: 'pending', label: `Pending (${userReports.filter(r => r.status === 'pending').length})` },
                        { id: 'withdrawn', label: `Withdrawn (${userReports.filter(r => r.status === 'withdrawn').length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setReportFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                            reportFilter === tab.id
                              ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : 'bg-white/[0.02] text-text-secondary hover:text-white border border-white/5'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Search */}
                    <div className="relative min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                      <input
                        type="text"
                        value={reportSearch}
                        onChange={(e) => setReportSearch(e.target.value)}
                        placeholder="Search by suspect or UPI..."
                        className="w-full bg-[#080a0f]/90 border border-white/10 focus:border-accent-cyan rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-text-muted focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {loadingReports ? (
                  <div className="p-12 text-center text-xs font-mono text-text-muted space-y-2">
                    <span className="w-6 h-6 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block" />
                    <p>Loading filed incident records...</p>
                  </div>
                ) : filteredUserReports.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground space-y-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <History className="w-12 h-12 mx-auto opacity-20 text-accent-cyan" />
                    <p className="text-xs font-mono text-text-secondary">
                      {userReports.length === 0 
                        ? "You have not submitted any scam incident reports yet." 
                        : "No filed reports match your active filter."}
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <Link href="/submit-report">
                        <Button className="btn btn-cyan text-xs font-mono">
                          Report a Scammer
                        </Button>
                      </Link>
                      <Link href="/search">
                        <Button variant="outline" className="text-xs font-mono border-white/20">
                          Search Registry
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    {filteredUserReports.map((rep) => {
                      const statusColor = 
                        rep.status === 'approved' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        rep.status === 'withdrawn' ? 'bg-amber-500/15 text-accent-amber border-accent-amber/30' :
                        rep.status === 'rejected' ? 'bg-gray-500/15 text-gray-400 border-gray-500/30' :
                        'bg-sky-500/15 text-sky-400 border-sky-500/30';

                      return (
                        <div 
                          key={rep.id} 
                          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-black/30 border border-white/10 hover:border-accent-cyan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-white font-sans truncate">{rep.scammer_name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border uppercase font-bold ${statusColor}`}>
                                {rep.status}
                              </span>
                              <span className="text-[10px] text-text-muted">
                                ID: <strong className="text-white">{rep.id.slice(0, 14)}</strong>
                              </span>
                            </div>

                            <p className="text-xs text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>Type: <strong className="text-white capitalize">{rep.scam_type?.replace(/_/g, ' ')}</strong></span>
                              <span>Loss: <strong className="text-accent-red">₹{rep.amount_lost?.toLocaleString('en-IN')}</strong></span>
                              {rep.upi_id && <span>UPI: <strong className="text-accent-cyan">{rep.upi_id}</strong></span>}
                              {rep.whatsapp_number && <span>WA: <strong className="text-emerald-400">{rep.whatsapp_number}</strong></span>}
                            </p>

                            <span className="text-[10px] text-text-muted block">
                              Filed on: {new Date(rep.created_at || rep.incident_date).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <Link href={`/report/${rep.id}`}>
                              <Button variant="outline" size="sm" className="text-xs font-mono hover:border-accent-cyan hover:text-accent-cyan flex items-center gap-1">
                                <span>View File</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB 2: STORE PROFILE / MEMBER IDENTITY ─── */}
          <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-200">
            {isVerifiedReseller ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Detailed Configuration */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-panel border-white/10 rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white uppercase font-bold text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
                            <Building2 className="w-5 h-5 text-accent-cyan" />
                            <span>Store Trading Credentials</span>
                          </CardTitle>
                          <CardDescription className="text-xs text-text-secondary mt-1">
                            Your verified BGMI store operating parameters visible across the network.
                          </CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs font-mono border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 flex items-center gap-1.5"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Profile</span>
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {loadingStore ? (
                        <div className="p-8 text-center text-muted-foreground text-xs font-mono">Loading store profile...</div>
                      ) : storeData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Store / Trade Name</span>
                            <span className="text-sm font-bold text-white block">{storeData.store_name || storeData.storeName || "N/A"}</span>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Seller Full Name</span>
                            <span className="text-sm font-bold text-white block">{storeData.owner_name || storeData.ownerName || displayName}</span>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Operating State</span>
                            <span className="text-sm font-bold text-accent-cyan block flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{storeData.state || profile?.state || "N/A"}</span>
                            </span>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Primary WhatsApp Line</span>
                            <span className="text-sm font-bold text-emerald-400 block">{storeData.whatsapp_number || storeData.whatsappNumber || "N/A"}</span>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Backup WhatsApp Line</span>
                            <span className="text-sm font-bold text-emerald-300 block">{storeData.backup_whatsapp_number || storeData.backupWhatsappNumber || "Not configured"}</span>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Telegram Username</span>
                            <span className="text-sm font-bold text-sky-400 block">
                              {storeData.telegram_username || storeData.telegramUsername ? `@${(storeData.telegram_username || storeData.telegramUsername).replace('@', '')}` : 'N/A'}
                            </span>
                          </div>

                          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Operating Since</span>
                            <span className="text-sm font-bold text-accent-amber block">
                              {storeData.operating_since_year || 2022} ({new Date().getFullYear() - (storeData.operating_since_year || 2022)} yrs experience)
                            </span>
                          </div>

                          <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                            <span className="text-[10px] text-text-muted uppercase block">Specializations</span>
                            <div className="flex flex-wrap gap-2">
                              {(storeData.specializes_in || storeData.specializesIn || ['budget_accounts', 'premium_accounts', 'uc_recharge']).map((spec: string) => (
                                <span key={spec} className="px-2.5 py-1 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-[10px] text-accent-cyan uppercase font-bold">
                                  {spec.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                            <span className="text-[10px] text-text-muted uppercase block">Store Bio</span>
                            <p className="text-text-secondary text-xs leading-relaxed font-sans">{storeData.bio || 'Official verified BGMI merchant.'}</p>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>

                {/* Right 1 Col: Live Public Directory Preview */}
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/40 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-accent-cyan uppercase font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Public Directory Preview</span>
                      </span>
                      <span className="badge badge-amber text-[9px]">LIVE</span>
                    </div>

                    <div className="p-5 rounded-2xl border border-accent-cyan/30 bg-black/60 space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan flex items-center justify-center font-black text-accent-cyan font-mono text-base shrink-0">
                          {(storeData?.store_name || displayName).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white uppercase truncate" style={{ fontFamily: 'var(--font-h)' }}>
                            {storeData?.store_name || storeData?.storeName || displayName}
                          </h4>
                          <span className="text-[10px] font-mono text-accent-amber flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{stateLocation}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{storeData?.trust_score || 94}/100</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] font-mono">
                          SENTINEL VERIFIED
                        </Badge>
                      </div>
                    </div>

                    {profile?.username && (
                      <Link href={`/resellers/${profile.username}`} className="block">
                        <Button variant="outline" className="w-full text-xs font-mono uppercase flex items-center justify-center gap-1.5 hover:border-accent-cyan">
                          <span>View Public Page</span>
                          <ExternalLink className="w-3.5 h-3.5 text-accent-cyan" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Member Identity Card */
              <Card className="glass-panel border-white/10 rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg uppercase font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                        Sentinel Member Identity
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary">
                        Your verified community account details used for fraud dispute filings and victim asset recovery.
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingMemberContact(true)}
                      className="text-xs font-mono border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Contact Info</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-accent-cyan" />
                        <span>Member Name / Alias</span>
                      </p>
                      <p className="text-base font-bold text-white">{displayName}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp / Phone Contact</span>
                      </p>
                      <p className="text-base font-mono font-bold text-emerald-400">{contactPhone}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span>Registered Google Email</span>
                      </p>
                      <p className="text-sm font-mono text-white/90">{user.email}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                        <span>Account Role & Status</span>
                      </p>
                      <p className="text-sm font-mono font-bold text-accent-cyan">Sentinel Member (Active)</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-accent-cyan/[0.03] border border-accent-cyan/20 text-xs text-text-secondary leading-relaxed">
                    💡 <strong className="text-white">Community Protection Notice:</strong> As a Sentinel Member, you can report fraudulent accounts, look up suspicious UPI/Telegram handles, and withdraw reports once scammers refund lost funds.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── TAB 3: VERIFICATION TIERS (Resellers Only) ─── */}
          {isVerifiedReseller && (
            <TabsContent value="verification" className="space-y-6 animate-in fade-in duration-200">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Tier 1: Sentinel Verified */}
                <div className="p-6 rounded-2xl border border-accent-cyan/40 bg-gradient-to-b from-accent-cyan/[0.05] to-transparent space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-7 h-7 text-accent-cyan" />
                      <div>
                        <h3 className="font-bold text-lg text-white uppercase" style={{ fontFamily: 'var(--font-h)' }}>
                          Sentinel Verified
                        </h3>
                        <span className="text-[10px] font-mono text-accent-cyan uppercase">Tier 1 &bull; Regional Cleared</span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] uppercase font-mono">
                      ACTIVE
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Your trade identity, contact channels, and state operating territory have been audited and approved by the <strong className="text-white">{stateLocation}</strong> Regional Admin.
                  </p>

                  <ul className="space-y-2 text-xs font-mono text-text-secondary pt-2 border-t border-white/5">
                    <li className="flex items-center gap-2 text-white">
                      <Check className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Listed in B2B Verified Resellers Directory</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <Check className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Direct WhatsApp & Telegram click-to-chat links</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <Check className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Fast-track scam report filing clearance</span>
                    </li>
                  </ul>
                </div>
                
                {/* Tier 2: Sentinel Trusted */}
                <div className="p-6 rounded-2xl border border-accent-amber/40 bg-gradient-to-b from-accent-amber/[0.05] to-transparent space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-7 h-7 text-accent-amber" />
                      <div>
                        <h3 className="font-bold text-lg text-white uppercase" style={{ fontFamily: 'var(--font-h)' }}>
                          Sentinel Trusted
                        </h3>
                        <span className="text-[10px] font-mono text-accent-amber uppercase">Tier 2 &bull; Elite Distinction</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase font-mono border-accent-amber/40 ${isTier2 ? 'bg-accent-amber/20 text-accent-amber' : 'text-accent-amber/70'}`}>
                      {isTier2 ? "APPROVED" : "AVAILABLE"}
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Elite merchant tier for high-volume BGMI account brokers with priority middleman escrows and top placement.
                  </p>

                  <ul className="space-y-2 text-xs font-mono text-text-secondary pt-2 border-t border-white/5">
                    <li className="flex items-center gap-2 text-white">
                      <Star className="w-3.5 h-3.5 text-accent-amber fill-current" />
                      <span>Golden Crown verified seal on all listings</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <Star className="w-3.5 h-3.5 text-accent-amber fill-current" />
                      <span>Priority middleman escrow authorization</span>
                    </li>
                    <li className="flex items-center gap-2 text-white">
                      <Star className="w-3.5 h-3.5 text-accent-amber fill-current" />
                      <span>Peer vouch endorsements from verified traders</span>
                    </li>
                  </ul>

                  {!isTier2 && (
                    <div className="pt-3">
                      <Button
                        onClick={handleApplyTier2}
                        disabled={applyingTier2}
                        className="btn btn-amber w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{applyingTier2 ? "SUBMITTING..." : "APPLY FOR TIER 2 TRUSTED"}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* ─── TAB 4: APPEALS & COMPLIANCE (Resellers Only) ─── */}
          {isVerifiedReseller && (
            <TabsContent value="appeals" className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left 1 Col: Clearance Card */}
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white text-base uppercase" style={{ fontFamily: 'var(--font-h)' }}>
                      Clean Clearance Record
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Zero active fraud disputes, fake account claims, or customer complaints lodged against your store.
                    </p>
                  </div>
                </div>

                {/* Right 2 Cols: Direct Inquiry / Appeal Form */}
                <div className="md:col-span-2">
                  <Card className="glass-panel border-white/10 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-white uppercase font-bold text-base flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
                        <MessageSquare className="w-4 h-4 text-accent-cyan" />
                        <span>Moderation Desk &amp; Inquiries</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-text-secondary">
                        Submit an appeal, inquiry, or territory update directly to your Regional Admin.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={handleInquirySubmit} className="space-y-4 font-sans">
                        <div>
                          <label className="text-[11px] uppercase tracking-wider font-bold text-text-secondary block mb-1.5 font-mono">
                            Inquiry Category
                          </label>
                          <select
                            value={inquiryType}
                            onChange={(e) => setInquiryType(e.target.value)}
                            className="w-full bg-[#080a0f] border border-white/10 focus:border-accent-cyan rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                          >
                            <option value="verification_update">Store Details / Territory Update</option>
                            <option value="impersonation_claim">Impersonation / Clone Channel Report</option>
                            <option value="escrow_dispute">Middleman Escrow Clearance</option>
                            <option value="general_moderation">General Moderation Inquiry</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-wider font-bold text-text-secondary block mb-1.5 font-mono">
                            Inquiry Message / Details
                          </label>
                          <textarea
                            value={inquiryMessage}
                            onChange={(e) => setInquiryMessage(e.target.value)}
                            placeholder="Provide any relevant transaction links, handles, or context for the Regional Admin team..."
                            rows={3}
                            required
                            className="w-full bg-[#080a0f] border border-white/10 focus:border-accent-cyan rounded-xl p-3 text-xs text-white focus:outline-none placeholder:text-text-muted font-sans"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={submittingInquiry}
                          className="btn btn-cyan text-xs font-mono uppercase font-bold flex items-center gap-1.5 py-2.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingInquiry ? "DISPATCHING..." : "DISPATCH INQUIRY TO ADMIN"}</span>
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* Modals */}
        {isEditingProfile && (
          <StoreOnboardingModal
            initialData={storeData}
            onComplete={() => {
              setIsEditingProfile(false);
              setLoadingStore(true);
              db.getUserStoreApplication(profile?.id!).then((res) => {
                setStoreData(res);
                setLoadingStore(false);
              });
            }}
          />
        )}

        {isEditingMemberContact && (
          <MemberOnboardingModal
            onComplete={() => {
              setIsEditingMemberContact(false);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
