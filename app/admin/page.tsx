"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Crown, 
  UserCheck, 
  Lock, 
  LogIn, 
  CheckCircle, 
  XCircle, 
  Building2, 
  ExternalLink,
  Phone,
  Send,
  Mail,
  Calendar,
  Sparkles,
  Tag,
  Zap,
  Flame,
  Gauge,
  CheckCheck,
  Globe,
  Copy,
  Check,
  Shield,
  Eye,
  Navigation,
  MessageCircle,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Edit3,
  Sliders,
  TrendingUp,
  AlertOctagon,
  Radio,
  Share2,
  Trash2,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Profile, TrustedReseller, ScamReport } from "@/types";
import { INDIAN_STATES, INDIA_REGIONS } from "@/lib/constants/indiaStates";
import { validateWhatsAppLink, validateTelegramLink, normalizeExternalUrl, validatePhoneNumber } from "@/lib/validators/linkValidators";
import { toast } from "sonner";

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

function AdminAvatarWithFallback({ src, alt, isTier2, className = "w-16 h-16 rounded-2xl" }: { src?: string | null; alt: string; isTier2?: boolean; className?: string }) {
  const [hasError, setHasError] = useState(false);
  const cleanInitials = (alt || "ST").replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "ST";

  if (!src || hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-accent-cyan/20 to-accent-blue/30 border-2 flex items-center justify-center font-bold text-base text-accent-cyan font-mono shadow-[0_0_20px_rgba(0,184,255,0.2)] shrink-0 ${
        isTier2 ? 'border-accent-amber text-accent-amber from-amber-500/20 to-yellow-500/20' : 'border-accent-cyan/60'
      }`}>
        {cleanInitials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => setHasError(true)}
      className={`${className} border-2 object-cover shrink-0 ${
        isTier2 ? 'border-accent-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-accent-cyan/60 shadow-[0_0_20px_rgba(0,184,255,0.25)]'
      }`}
    />
  );
}

export default function AdminDashboardPage() {
  const { user, isSuperAdmin, loading, isAuthenticating, profile, signInWithGoogle } = useAuth();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [pendingResellers, setPendingResellers] = useState<TrustedReseller[]>([]);
  const [pendingReports, setPendingReports] = useState<ScamReport[]>([]);
  
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState<string>("pending_apps");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [selectedTargetState, setSelectedTargetState] = useState<string>("Tamil Nadu");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals State
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [editingReseller, setEditingReseller] = useState<TrustedReseller | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [evidenceLightboxUrl, setEvidenceLightboxUrl] = useState<string | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>("");
  const [broadcastSeverity, setBroadcastSeverity] = useState<string>("warning");
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState<boolean>(false);
  const [whitelistFormData, setWhitelistFormData] = useState<any>({
    storeName: "",
    ownerName: "",
    whatsappNumber: "",
    telegramUsername: "",
    state: "Tamil Nadu",
    specializesIn: ["budget_accounts", "premium_accounts", "uc_recharge"]
  });

  const refreshAllData = async () => {
    setIsRefreshing(true);
    setCurrentUser(profile);
    try {
      const [allResellers, pendingList, reports] = await Promise.all([
        db.getResellers(),
        db.getPendingResellers(),
        db.getPendingReports()
      ]);
      setResellers(allResellers || []);
      setPendingResellers(pendingList || []);
      setPendingReports(reports || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [user]);

  const isRegionalAdmin = currentUser?.role === "regional_admin" || currentUser?.roles?.includes("regional_admin");
  const isAuthorized = isSuperAdmin || isRegionalAdmin;

  // Filtered Lists (Declared at top level for React Rules of Hooks)
  const filteredResellers = useMemo(() => {
    return resellers.filter((r) => {
      const matchesSearch = !searchQuery || 
        r.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.whatsapp_number?.includes(searchQuery);
      const matchesState = stateFilter === "all" || r.state?.toLowerCase() === stateFilter.toLowerCase();
      return matchesSearch && matchesState;
    });
  }, [resellers, searchQuery, stateFilter]);

  const filteredPendingResellers = useMemo(() => {
    const list = isSuperAdmin
      ? pendingResellers
      : pendingResellers.filter(r => 
          (currentUser?.state && r.state?.toLowerCase() === currentUser.state.toLowerCase()) ||
          (currentUser?.region && r.region?.toLowerCase() === currentUser.region.toLowerCase())
        );
    return list.filter((r: any) => {
      const name = r.storeName || r.store_name || "";
      const owner = r.ownerName || r.owner_name || "";
      const tg = r.telegramUsername || r.telegram_username || "";
      const phone = r.whatsappNumber || r.whatsapp_number || "";
      const matchesSearch = !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);
      const matchesState = stateFilter === "all" || (r.state || "").toLowerCase() === stateFilter.toLowerCase();
      return matchesSearch && matchesState;
    });
  }, [pendingResellers, isSuperAdmin, currentUser, searchQuery, stateFilter]);

  const filteredReports = useMemo(() => {
    return pendingReports.filter((rep) => {
      const matchesSearch = !searchQuery ||
        rep.scammer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.upi_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [pendingReports, searchQuery]);

  // Statistics Calculations
  const totalFraudBlocked = pendingReports.reduce((acc, curr) => acc + (curr.amount_lost || 0), 0);
  const avgTrustScore = resellers.length > 0
    ? Math.round(resellers.reduce((acc, curr) => acc + (curr.trust_score || 30), 0) / resellers.length)
    : 100;
  const regionalAdminCount = resellers.filter(r => r.profile?.role === 'regional_admin' || r.profile?.roles?.includes('regional_admin')).length;

  // Action Handlers
  const handleApproveReseller = async (resellerId: string) => {
    try {
      const activeAdminId = profile?.id || currentUser?.id;
      let res: any = null;
      if (isSuperAdmin) {
        res = await db.moderateReseller(resellerId, "approved");
      } else if (activeAdminId) {
        res = await db.verifySellerByRegionalAdmin(resellerId, activeAdminId);
      } else {
        toast.error("Admin identity could not be verified. Please re-authenticate.");
        return;
      }

      if (res) {
        toast.success(`Reseller "${res.store_name || res.storeName || 'Store'}" Approved!`, {
          description: `Clearance granted. Reseller is now live in the Verified Directory.`
        });
        setSelectedApplication(null);
        await refreshAllData();
      } else {
        toast.error("Approval could not be recorded in database.");
      }
    } catch (err: any) {
      console.error("Error in handleApproveReseller:", err);
      toast.error(err?.message || "Failed to approve reseller.");
    }
  };

  const handleRejectReseller = async (resellerId: string) => {
    try {
      const res = await db.moderateReseller(resellerId, "rejected", "Application did not meet verification standards.");
      if (res) {
        toast.info(`Store application rejected.`);
        setSelectedApplication(null);
        await refreshAllData();
      } else {
        toast.error("Rejection could not be recorded.");
      }
    } catch (err: any) {
      console.error("Error in handleRejectReseller:", err);
      toast.error(err?.message || "Failed to reject reseller.");
    }
  };

  const handleToggleTier2 = async (reseller: TrustedReseller) => {
    if (!isSuperAdmin) {
      toast.error("Only Root Super Admin can toggle Sentinel Trusted (Tier 2) Clearance.");
      return;
    }
    const isCurrentlyTier2 = reseller.tier === 2 || reseller.tier2_status === 'approved' || (reseller as any).tier2Status === 'approved';
    const newTier = isCurrentlyTier2 ? 1 : 2;
    const newStatus = isCurrentlyTier2 ? 'not_applied' : 'approved';
    
    const res = await db.adminUpdateReseller(reseller.id, {
      tier: newTier,
      tier2Status: newStatus
    });

    if (res) {
      toast.success(isCurrentlyTier2 ? "Revoked Tier 2 Trusted (reverted to Tier 1 Verified)" : "Granted Tier 2 Sentinel Trusted Badge!");
      await refreshAllData();
    } else {
      toast.error("Failed to update Tier status.");
    }
  };

  const handleAdjustTrust = async (resellerId: string, delta: number) => {
    try {
      const updated = await db.adjustResellerTrustScore(resellerId, delta);
      if (updated !== null) {
        toast.success(`Trust Score updated to ${updated}/100!`);
        await refreshAllData();
      }
    } catch (err) {
      toast.error("Could not update trust score.");
    }
  };

  const handleSuspendReseller = async (reseller: TrustedReseller) => {
    if (!confirm(`Are you sure you want to suspend clearance for "${reseller.store_name}"? This will remove them from the public registry.`)) {
      return;
    }
    const res = await db.moderateReseller(reseller.id, "suspended", "Administrative suspension.");
    if (res) {
      toast.warning(`Store "${reseller.store_name}" suspended.`);
      await refreshAllData();
    }
  };

  const handleOpenEditReseller = (reseller: TrustedReseller) => {
    setEditingReseller(reseller);
    setEditFormData({
      storeName: reseller.store_name,
      ownerName: reseller.owner_name || '',
      whatsappNumber: reseller.whatsapp_number || '',
      whatsappUsername: reseller.whatsapp_username || '',
      whatsappGroupLink: reseller.whatsapp_group_link || '',
      telegramUsername: reseller.telegram_username || '',
      telegramChannelLink: reseller.telegram_channel_link || '',
      instagramUsername: reseller.instagram_username || '',
      state: reseller.state || 'Tamil Nadu',
      bio: reseller.bio || '',
      trustScore: reseller.trust_score || 30
    });
  };

  const handleSaveResellerEdit = async () => {
    if (!editingReseller) return;
    setIsSavingEdit(true);
    try {
      const res = await db.adminUpdateReseller(editingReseller.id, editFormData);
      if (res) {
        toast.success(`Updated store credentials for "${editFormData.storeName}"!`);
        setEditingReseller(null);
        await refreshAllData();
      } else {
        toast.error("Failed to save changes.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update store.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handlePromoteRegionalAdmin = async (reseller: TrustedReseller) => {
    if (!isSuperAdmin) {
      toast.error("Permission Denied: Only 8xSentinel Super Admin can appoint Regional Admins.");
      return;
    }
    const profId = reseller.profile_id || reseller.profileId || reseller.profile?.id;
    if (!profId) {
      toast.error("Could not resolve profile ID for this store.");
      return;
    }
    const updated = await db.assignRegionalAdmin(profId, selectedTargetState);
    if (updated) {
      toast.success(`Promoted ${reseller.store_name} to Regional Admin (${selectedTargetState})`, {
        description: "User now holds dual roles: Seller + State Regional Admin."
      });
      await refreshAllData();
    }
  };

  const handleModerateReport = async (reportId: string, status: "approved" | "rejected") => {
    const res = await db.moderateReport(reportId, status);
    if (res) {
      toast.success(`Scam Report marked as ${status.toUpperCase()}`);
      await refreshAllData();
    }
  };

  const handleExportRegistry = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      timestamp: new Date().toISOString(),
      verifiedResellers: resellers,
      pendingApplications: pendingResellers,
      scamReports: pendingReports
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `8xSentinel_Registry_Audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Downloaded 8xSentinel Registry Audit Backup!");
  };

  const handleBroadcastAlert = () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter broadcast alert text.");
      return;
    }
    localStorage.setItem("sentinel_active_threat_broadcast", JSON.stringify({
      message: broadcastMessage.trim(),
      severity: broadcastSeverity,
      timestamp: Date.now()
    }));
    toast.success("🚨 Emergency Threat Alert broadcasted to all visitors!");
    setIsBroadcastModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container py-24 text-center font-mono">
        <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-muted">Verifying Root Cryptographic Clearance...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container py-24 max-w-2xl mx-auto text-center space-y-6 font-mono px-4">
        <div className="w-20 h-20 rounded-2xl bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto text-accent-red">
          <Lock className="w-10 h-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight uppercase text-accent-red">
            Restricted Area
          </h1>
          <p className="text-text-secondary text-sm font-sans max-w-md mx-auto">
            You do not have administrative clearance to access the Command Deck.
          </p>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3">
          <p className="text-xs text-text-muted">
            Current Authenticated Identity:{" "}
            <span className="text-white font-bold">{user?.email || "Unauthenticated Session"}</span>
          </p>
          <Button
            onClick={signInWithGoogle}
            disabled={isAuthenticating}
            className="w-full bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30 font-mono text-xs uppercase font-bold py-2.5 flex items-center justify-center gap-2"
          >
            <LogIn className={`w-4 h-4 ${isAuthenticating ? 'animate-spin' : ''}`} />
            {isAuthenticating ? "AUTHENTICATING SESSION..." : "Authenticate with Authorized Account"}
          </Button>
        </div>

        <p className="text-[11px] text-text-muted">
          Unauthorized access attempts are monitored and logged.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Header Deck */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-white flex items-center gap-2.5 font-mono">
              <ShieldCheck className="w-7 h-7 text-accent-cyan" />
              <span>{isSuperAdmin ? "Root Super Admin Deck" : "Regional Command Deck"}</span>
            </h1>
            <Badge className={`px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 ${
              isSuperAdmin ? "bg-accent-red/20 text-accent-red border-accent-red/40" : "bg-accent-amber/20 text-accent-amber border-accent-amber/40"
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isSuperAdmin ? "ROOT SUPER ADMIN (LOCKED)" : `REGIONAL CUSTODIAN (${currentUser?.state || 'ASSIGNED'})`}</span>
            </Badge>
          </div>
          <p className="text-text-secondary text-xs sm:text-sm font-sans mt-1">
            Real-time verification clearance, fraud prevention triage, and decentralized peer admin governance.
          </p>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <Button
            onClick={refreshAllData}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="text-xs uppercase font-mono border-white/15 hover:bg-white/5 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            onClick={handleExportRegistry}
            variant="outline"
            size="sm"
            className="text-xs uppercase font-mono border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Audit JSON</span>
          </Button>

          {isSuperAdmin && (
            <Button
              onClick={() => setIsBroadcastModalOpen(true)}
              size="sm"
              className="bg-accent-red/15 hover:bg-accent-red/25 text-accent-red border border-accent-red/40 text-xs uppercase font-mono font-bold flex items-center gap-1.5 shadow-sm"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Threat Alert</span>
            </Button>
          )}
        </div>
      </div>

      {/* 4 Interactive Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Card 1: Pending Verifications */}
        <div 
          onClick={() => setActiveTab("pending_apps")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "pending_apps" 
              ? 'bg-accent-cyan/10 border-accent-cyan/60 shadow-[0_0_30px_rgba(0,184,255,0.15)]' 
              : 'bg-white/[0.02] border-white/10 hover:border-accent-cyan/40 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Pending Queue</span>
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 flex items-center justify-center text-accent-cyan">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{pendingResellers.length}</span>
            <span className="text-[10px] text-text-muted uppercase">Awaiting Sign-off</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent-cyan">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
            <span>Live National Queue</span>
          </div>
        </div>

        {/* Card 2: Approved Resellers */}
        <div 
          onClick={() => setActiveTab("active_resellers")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "active_resellers" 
              ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
              : 'bg-white/[0.02] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified Network</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{resellers.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Avg Score {avgTrustScore}%</span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">100% Cryptographically Vetted</p>
        </div>

        {/* Card 3: Scam Reports Triage */}
        <div 
          onClick={() => setActiveTab("reports")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "reports" 
              ? 'bg-accent-red/10 border-accent-red/60 shadow-[0_0_30px_rgba(255,51,102,0.15)]' 
              : 'bg-white/[0.02] border-white/10 hover:border-accent-red/40 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent-red uppercase tracking-wider">Fraud Reports</span>
            <div className="w-8 h-8 rounded-xl bg-accent-red/15 flex items-center justify-center text-accent-red">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{pendingReports.length}</span>
            <span className="text-[10px] text-accent-red font-bold uppercase">₹{totalFraudBlocked.toLocaleString('en-IN')} Loss</span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Central Blacklist Enforcer</p>
        </div>

        {/* Card 4: National State Governance */}
        <div 
          onClick={() => setActiveTab("regional_admin_mgmt")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "regional_admin_mgmt" 
              ? 'bg-accent-amber/10 border-accent-amber/60 shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
              : 'bg-white/[0.02] border-white/10 hover:border-accent-amber/40 hover:bg-white/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent-amber uppercase tracking-wider">Regional Custodians</span>
            <div className="w-8 h-8 rounded-xl bg-accent-amber/15 flex items-center justify-center text-accent-amber">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{Math.max(1, regionalAdminCount)}</span>
            <span className="text-[10px] text-accent-amber uppercase">50+ Rule Active</span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">Democratic State Chapters</p>
        </div>
      </div>

      {/* Global Real-time Search & Filter Tool */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores, handles, phones, cases..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-text-muted focus:border-accent-cyan focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted font-mono uppercase">State:</span>
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-black/60 border border-white/15 text-xs rounded-xl px-3 py-2 text-white font-mono cursor-pointer focus:border-accent-cyan focus:outline-none"
          >
            <option value="all">All States & Territories ({resellers.length + pendingResellers.length})</option>
            {INDIAN_STATES.map((st) => (
              <option key={st.code} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tabs Deck */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-white/[0.03] border border-white/10 p-1 rounded-2xl font-mono text-xs">
          <TabsTrigger value="pending_apps" className="rounded-xl data-[state=active]:bg-accent-cyan/20 data-[state=active]:text-accent-cyan data-[state=active]:border data-[state=active]:border-accent-cyan/40">
            <span>Applications ({filteredPendingResellers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="active_resellers" className="rounded-xl data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-500/40">
            <span>Active Resellers ({filteredResellers.length})</span>
          </TabsTrigger>
          <TabsTrigger value="regional_admin_mgmt" className="rounded-xl data-[state=active]:bg-accent-amber/20 data-[state=active]:text-accent-amber data-[state=active]:border data-[state=active]:border-accent-amber/40">
            <span>State Governance</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl data-[state=active]:bg-accent-red/20 data-[state=active]:text-accent-red data-[state=active]:border data-[state=active]:border-accent-red/40">
            <span>Scam Reports ({filteredReports.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Pending Reseller Applications Tab */}
        <TabsContent value="pending_apps" className="space-y-4">
          {filteredPendingResellers.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-white/[0.01]">
              <ShieldCheck className="w-12 h-12 text-accent-cyan/40 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono uppercase">All Applications Processed</h3>
              <p className="text-xs text-text-muted font-sans max-w-sm mx-auto">
                There are currently no merchant applications pending review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPendingResellers.map((r: any) => {
                const storeName = r.storeName || r.store_name || "Unnamed Store";
                const ownerName = r.ownerName || r.owner_name || r.sellerName || "Verified Merchant";
                const state = r.state || r.region || "Tamil Nadu";
                const whatsappNumber = r.whatsappNumber || r.whatsapp_number || "";
                const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
                const tgUsername = (r.telegramUsername || r.telegram_username || "").replace('@', '');
                const avatar = r.profile?.avatarUrl || r.profile?.avatar_url || r.avatarUrl || r.avatar_url;
                const specialties: string[] = r.specializesIn || r.specializes_in || [];

                return (
                  <div 
                    key={r.id}
                    className="p-5 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.02] hover:border-accent-cyan/60 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <AdminAvatarWithFallback
                        src={avatar}
                        alt={storeName}
                        className="w-14 h-14 rounded-2xl"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white uppercase font-mono">{storeName}</h3>
                          <Badge className="bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40 text-[9px] uppercase font-mono">
                            {r.primary_platform ? r.primary_platform.replace('_', ' ') : 'DUAL NETWORK'}
                          </Badge>
                          <Badge className="bg-accent-amber/15 text-accent-amber border-accent-amber/40 text-[9px] uppercase font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{state}</span>
                          </Badge>
                        </div>

                        <p className="text-xs text-text-secondary font-mono flex items-center gap-2">
                          <span>Owner: <strong className="text-white">{ownerName}</strong></span>
                          <span>•</span>
                          <span className="text-text-muted">{r.profile?.primaryEmail || r.email || "Email Verified"}</span>
                        </p>

                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                          {cleanWa && (
                            <a
                              href={`https://wa.me/${cleanWa}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <WhatsAppLogo />
                              <span>{whatsappNumber}</span>
                            </a>
                          )}
                          {tgUsername && (
                            <a
                              href={`https://t.me/${tgUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1"
                            >
                              <TelegramLogo />
                              <span>@{tgUsername}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 w-full lg:w-auto self-end lg:self-center shrink-0">
                      <Button
                        onClick={() => setSelectedApplication(r)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs uppercase font-mono border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/10"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Inspect Dossier</span>
                      </Button>
                      <Button
                        onClick={() => handleRejectReseller(r.id)}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs uppercase font-mono border-accent-red/40 text-accent-red hover:bg-accent-red/10"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Reject</span>
                      </Button>
                      <Button
                        onClick={() => handleApproveReseller(r.id)}
                        size="sm"
                        className="w-full sm:w-auto bg-accent-green hover:bg-accent-green/80 text-black text-xs uppercase font-mono font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        <span>1-Click Approve</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 2. Approved Active Resellers Network Tab */}
        <TabsContent value="active_resellers" className="space-y-4">
          {filteredResellers.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-white/[0.01]">
              <Users className="w-12 h-12 text-text-muted/40 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono uppercase">No Resellers Found</h3>
              <p className="text-xs text-text-muted font-sans max-w-sm mx-auto">
                No verified merchants match your current search query or state filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredResellers.map((r) => {
                const avatar = r.profile?.avatarUrl || r.profile?.avatar_url;
                const isTier2 = r.tier === 2 || r.tier2Status === 'approved' || r.tier2_status === 'approved';
                const specialties: string[] = r.specializes_in || r.specializesIn || [];
                const cleanWa = (r.whatsapp_number || '').replace(/[^0-9]/g, '');
                const cleanTg = (r.telegram_username || '').replace('@', '');

                return (
                  <div 
                    key={r.id}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.015] hover:border-white/20 transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <AdminAvatarWithFallback
                        src={avatar}
                        alt={r.store_name}
                        isTier2={isTier2}
                        className="w-14 h-14 rounded-2xl"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white uppercase font-mono">{r.store_name}</h3>
                          <Badge className={`text-[9px] uppercase font-mono flex items-center gap-1 ${
                            isTier2 
                              ? 'bg-accent-amber/20 text-accent-amber border-accent-amber/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          }`}>
                            {isTier2 ? <Crown className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            <span>{isTier2 ? 'Sentinel Trusted' : 'Sentinel Verified'}</span>
                          </Badge>
                          <Badge className="bg-white/5 text-text-secondary border-white/10 text-[9px] font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-accent-amber" />
                            <span>{r.state || 'Tamil Nadu'}</span>
                          </Badge>
                        </div>

                        <p className="text-xs text-text-secondary font-mono flex items-center gap-2 flex-wrap">
                          <span>Owner: <strong className="text-white">{r.owner_name || r.profile?.display_name || "Verified Legal Name"}</strong></span>
                          <span>•</span>
                          <span className="text-text-muted">{r.profile?.primary_email || "Verified Google Account"}</span>
                          <span>•</span>
                          <span className="text-accent-cyan font-bold">Trust Score: {r.trust_score || 30}/100</span>
                        </p>

                        {/* Direct Channel Links */}
                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                          {cleanWa && (
                            <a
                              href={`https://wa.me/${cleanWa}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <WhatsAppLogo />
                              <span>{r.whatsapp_number}</span>
                            </a>
                          )}
                          {r.whatsapp_group_link && (
                            <a
                              href={normalizeExternalUrl(r.whatsapp_group_link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-emerald-300/80 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>WA Channel ↗</span>
                            </a>
                          )}
                          {cleanTg && (
                            <a
                              href={`https://t.me/${cleanTg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1"
                            >
                              <TelegramLogo />
                              <span>@{cleanTg}</span>
                            </a>
                          )}
                          {r.telegram_channel_link && (
                            <a
                              href={normalizeExternalUrl(r.telegram_channel_link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-sky-300/80 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>TG Store Channel ↗</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trust Controller & Action Toolbar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto self-end xl:self-center shrink-0 font-mono">
                      
                      {/* Quick Trust Score Adjuster */}
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-text-muted px-2 uppercase">Score</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustTrust(r.id, 5)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                          title="Increase Trust Score by +5"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustTrust(r.id, -5)}
                          className="px-2 py-1 rounded-lg bg-accent-red/20 text-accent-red hover:bg-accent-red/30 text-[10px] font-bold"
                          title="Decrease Trust Score by -5"
                        >
                          -5
                        </button>
                      </div>

                      {/* Action Dropdown / Toolbar */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/resellers/${r.profile?.username || r.store_name?.toLowerCase().replace(/\s+/g, '-')}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono flex items-center gap-1 transition-all"
                        >
                          <span>Public Page</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>

                        <Button
                          onClick={() => handleOpenEditReseller(r)}
                          variant="outline"
                          size="sm"
                          className="text-xs uppercase font-mono border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>

                        {isSuperAdmin && (
                          <Button
                            onClick={() => handleToggleTier2(r)}
                            variant="outline"
                            size="sm"
                            className={`text-xs uppercase font-mono flex items-center gap-1 ${
                              isTier2 
                                ? 'border-accent-amber/40 text-accent-amber hover:bg-accent-amber/10'
                                : 'border-white/15 text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isTier2 ? 'Tier 2 Active' : 'Upgrade Tier 2'}</span>
                          </Button>
                        )}

                        <Button
                          onClick={() => handleSuspendReseller(r)}
                          variant="outline"
                          size="sm"
                          className="text-xs uppercase font-mono border-accent-red/30 text-accent-red hover:bg-accent-red/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 3. State Regional Admin & 50+ Rule Governance Tab */}
        <TabsContent value="regional_admin_mgmt" className="space-y-6">
          <Card className="border-white/10 bg-[#090c14] font-sans">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-accent-amber flex items-center gap-2 font-mono uppercase">
                  <Crown className="w-4 h-4 text-accent-amber" />
                  <span>State Regional Admin & 50+ Rule Governance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Protocol Rule: Regional Admins are decided via decentralized community voting when a State reaches 50+ Verified Resellers.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-text-muted">Target State:</span>
                <select
                  value={selectedTargetState}
                  onChange={(e) => setSelectedTargetState(e.target.value)}
                  className="bg-black/60 border border-accent-amber/40 text-xs rounded-xl px-3 py-1.5 text-white font-mono cursor-pointer focus:outline-none"
                >
                  <optgroup label="States (28)">
                    {INDIAN_STATES.filter(s => s.type === 'state').map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name} ({st.region})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories (8)">
                    {INDIAN_STATES.filter(s => s.type === 'ut').map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name} ({st.region})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              {/* State Voting Progress Bar */}
              {(() => {
                const stateCount = resellers.filter(r => r.state?.toLowerCase() === selectedTargetState.toLowerCase()).length;
                const isVotingUnlocked = stateCount >= 50;
                const pct = Math.min(100, Math.round((stateCount / 50) * 100));

                return (
                  <div className="p-5 rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.03] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white uppercase">{selectedTargetState} Community Status</h4>
                          <Badge className={`${isVotingUnlocked ? 'bg-accent-green/20 text-accent-green border-accent-green/40' : 'bg-accent-amber/20 text-accent-amber border-accent-amber/40'} text-[9px] uppercase font-mono`}>
                            {isVotingUnlocked ? 'Elections Active' : 'Voting Locked (< 50 Resellers)'}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary font-sans">
                          {isVotingUnlocked
                            ? `Eligible for decentralized peer voting! Resellers in ${selectedTargetState} can elect their Regional Custodian.`
                            : `Requires 50 verified BGMI resellers before democratic regional admin elections unlock. Currently supervised by Root Super Admin.`}
                        </p>
                      </div>
                      <div className="text-right sm:shrink-0">
                        <span className="text-xl font-mono font-bold text-accent-amber">{stateCount} / 50</span>
                        <span className="text-[10px] text-text-muted block">Verified Stores</span>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/10">
                      <div
                        className="bg-gradient-to-r from-accent-amber to-accent-green h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* State Verified Merchants */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted font-mono">
                  Verified Merchants Registered in {selectedTargetState}
                </h4>

                {resellers.filter(r => r.state?.toLowerCase() === selectedTargetState.toLowerCase()).length === 0 ? (
                  <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-2">
                    <Users className="w-8 h-8 text-text-muted/40 mx-auto" />
                    <p className="text-xs text-text-muted font-sans">
                      No verified resellers registered in {selectedTargetState} yet. As stores onboard, they will appear here.
                    </p>
                  </div>
                ) : (
                  resellers
                    .filter(r => r.state?.toLowerCase() === selectedTargetState.toLowerCase())
                    .map((r) => {
                      const isAlreadyRegionalAdmin = r.profile?.role === 'regional_admin' || r.profile?.roles?.includes('regional_admin');
                      return (
                        <div key={r.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white uppercase">{r.store_name}</h4>
                              {isAlreadyRegionalAdmin && (
                                <Badge className="bg-accent-amber/20 text-accent-amber border-accent-amber/40 text-[9px] uppercase font-mono">
                                  Regional Admin ({selectedTargetState})
                                </Badge>
                              )}
                            </div>
                            <p className="text-text-muted text-[11px] font-sans mt-0.5">
                              Owner: <span className="text-gray-300 font-mono">{r.owner_name || r.profile?.display_name || "Merchant"}</span> | TG: @{r.telegram_username || "N/A"} | WA: {r.whatsapp_number || "N/A"}
                            </p>
                          </div>
                          <Button
                            onClick={() => handlePromoteRegionalAdmin(r)}
                            size="sm"
                            className="bg-accent-amber/15 text-accent-amber border border-accent-amber/40 hover:bg-accent-amber/25 text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>{isAlreadyRegionalAdmin ? 'Reconfirm Admin Clearance' : `Appoint Regional Admin (${selectedTargetState})`}</span>
                          </Button>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Scam Reports Moderation Tab */}
        <TabsContent value="reports" className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-white/[0.01]">
              <FileText className="w-12 h-12 text-accent-green/40 mx-auto" />
              <h3 className="text-base font-bold text-white font-mono uppercase">Scam Triage Clean</h3>
              <p className="text-xs text-text-muted font-sans max-w-sm mx-auto">
                No unresolved scam claims awaiting administrative sign-off.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((report) => (
                <div 
                  key={report.id} 
                  className="p-5 rounded-2xl border border-accent-red/30 bg-accent-red/[0.02] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1 font-mono">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white uppercase">{report.scammer_name}</span>
                      <Badge variant="destructive" className="text-[10px] uppercase font-mono font-bold">
                        ₹{report.amount_lost?.toLocaleString('en-IN')} LOST
                      </Badge>
                      <Badge className="bg-white/5 text-text-secondary border-white/10 text-[9px] uppercase font-mono">
                        {report.scam_type ? report.scam_type.replace(/_/g, ' ') : 'BGMI DEAL'}
                      </Badge>
                    </div>

                    <p className="text-text-secondary text-xs font-sans leading-relaxed">
                      "{report.description}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-text-muted flex-wrap">
                      <span>TG: <strong className="text-white">{report.telegram_username ? `@${report.telegram_username.replace('@', '')}` : 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Phone: <strong className="text-white">{report.whatsapp_number || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>UPI: <strong className="text-accent-cyan">{report.upi_id || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>BGMI UID: <strong className="text-accent-amber">{report.bgmi_uid || 'N/A'}</strong></span>
                    </div>

                    {((report.evidence_links && report.evidence_links.length > 0 && report.evidence_links[0]?.url) || (report as any).evidence_url) && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setEvidenceLightboxUrl((report.evidence_links && report.evidence_links[0]?.url) || (report as any).evidence_url || null)}
                          className="text-[11px] text-accent-cyan hover:underline flex items-center gap-1 font-mono cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>View Submitted Screenshot / Video Evidence ↗</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 font-mono">
                    <Button
                      onClick={() => handleModerateReport(report.id, "rejected")}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs uppercase border-white/15 hover:bg-white/5"
                    >
                      Dismiss Claim
                    </Button>
                    <Button
                      onClick={() => handleModerateReport(report.id, "approved")}
                      size="sm"
                      className="w-full sm:w-auto bg-accent-red hover:bg-accent-red/80 text-white text-xs uppercase font-bold shadow-[0_0_15px_rgba(255,51,102,0.3)]"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                      <span>Blacklist Scammer</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Selected Application Review Dossier Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-w-3xl bg-[#090c14] border border-white/15 text-white font-sans max-h-[92vh] overflow-y-auto p-0 rounded-2xl shadow-[0_0_80px_rgba(0,184,255,0.15)]">
          {selectedApplication && (() => {
            const storeName = selectedApplication.storeName || selectedApplication.store_name || "Unnamed Store";
            const avatar = selectedApplication.profile?.avatarUrl || selectedApplication.profile?.avatar_url || selectedApplication.avatarUrl || selectedApplication.avatar_url;
            const ownerEmail = selectedApplication.profile?.primaryEmail || selectedApplication.profile?.primary_email || selectedApplication.profile?.email || selectedApplication.email || "maddybgmistoreog@gmail.com";
            const ownerName = selectedApplication.ownerName || selectedApplication.owner_name || selectedApplication.profile?.displayName || selectedApplication.profile?.display_name || "Verified Legal Seller";
            const state = selectedApplication.profile?.state || selectedApplication.state || selectedApplication.profile?.region || selectedApplication.region || "Tamil Nadu";
            const operatingSince = selectedApplication.operatingSinceYear || selectedApplication.operating_since_year || 2022;
            const yearsActive = Math.max(1, new Date().getFullYear() - operatingSince);
            const primaryPlatform = selectedApplication.primaryPlatform || selectedApplication.primary_platform || "both";
            const whatsappNumber = selectedApplication.whatsappNumber || selectedApplication.whatsapp_number;
            const whatsappUsername = selectedApplication.whatsappUsername || selectedApplication.whatsapp_username;
            const whatsappGroupLink = selectedApplication.whatsappGroupLink || selectedApplication.whatsapp_group_link;
            const telegramUsername = selectedApplication.telegramUsername || selectedApplication.telegram_username;
            const telegramChannelLink = selectedApplication.telegramChannelLink || selectedApplication.telegram_channel_link;
            const instagramUsername = selectedApplication.instagramUsername || selectedApplication.instagram_username;
            const bio = selectedApplication.bio || selectedApplication.store_bio || "Authorized BGMI merchant specializing in budget accounts, premium accounts, UC recharge.";
            const specialtiesList: string[] = selectedApplication.specializesIn || selectedApplication.specializes_in || ['budget_accounts', 'premium_accounts', 'uc_recharge'];
            const isTier2 = selectedApplication.tier2Status === 'pending' || selectedApplication.tier2_status === 'pending';

            return (
              <div className="flex flex-col">
                <div className={`h-1.5 w-full bg-gradient-to-r ${isTier2 ? 'from-amber-500 via-yellow-400 to-amber-500' : 'from-accent-cyan via-accent-blue to-accent-cyan'}`} />
                
                {/* Header Profile Section */}
                <div className="p-6 pb-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <AdminAvatarWithFallback
                          src={avatar}
                          alt={storeName}
                          isTier2={isTier2}
                          className="w-16 h-16 rounded-2xl"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-black/90 p-1 rounded-full border border-white/20">
                          {isTier2 ? (
                            <Crown className="w-3.5 h-3.5 text-accent-amber" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold uppercase tracking-wider text-white font-mono">
                            {storeName}
                          </h2>
                          <Badge className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 ${
                            isTier2 
                              ? 'bg-accent-amber/15 text-accent-amber border-accent-amber/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40 shadow-[0_0_15px_rgba(0,184,255,0.2)]'
                          }`}>
                            {isTier2 ? <Crown className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            <span>{isTier2 ? 'Sentinel Trusted Clearance' : 'Sentinel Verification Dossier'}</span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-text-secondary flex-wrap font-mono">
                          <span className="text-white font-bold">{ownerName}</span>
                          <span className="text-white/20">•</span>
                          <span className="flex items-center gap-1 text-accent-amber font-medium">
                            <MapPin className="w-3.5 h-3.5" />
                            {state}
                          </span>
                          <span className="text-white/20">•</span>
                          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                            <Mail className="w-3 h-3" />
                            {ownerEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Modal Body */}
                <div className="p-6 space-y-6 font-sans">
                  {/* Channels Clearance */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between font-mono">
                      <label className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                        <span>Direct Channel Clearance & Store Links</span>
                      </label>
                      <span className="text-[10px] text-text-muted uppercase">
                        Mode: <strong className="text-white">{primaryPlatform.replace('_', ' ')}</strong>
                      </span>
                    </div>

                    {(() => {
                      const cleanWaDigits = (whatsappNumber || '').replace(/[^0-9]/g, '');
                      const waValidation = whatsappGroupLink ? validateWhatsAppLink(whatsappGroupLink) : null;
                      const safeWaGroupLink = waValidation && waValidation.isValid ? waValidation.normalizedUrl : normalizeExternalUrl(whatsappGroupLink);

                      const cleanTgHandle = (telegramUsername || '').replace('@', '').trim();
                      const tgValidation = telegramChannelLink ? validateTelegramLink(telegramChannelLink) : null;
                      const safeTgChannelLink = tgValidation && tgValidation.isValid ? tgValidation.normalizedUrl : normalizeExternalUrl(telegramChannelLink);

                      const cleanIgHandle = (instagramUsername || '').replace('@', '').trim();
                      const safeIgLink = cleanIgHandle ? `https://instagram.com/${cleanIgHandle}` : '';

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                          {/* WhatsApp Verification Card */}
                          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                  <WhatsAppLogo />
                                  <span>WhatsApp Channel</span>
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">DIRECT</span>
                              </div>
                              <div className="text-xs text-white font-bold flex items-center justify-between">
                                <span>{whatsappNumber || "Not configured"}</span>
                                {cleanWaDigits && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(whatsappNumber || '');
                                      toast.success("Copied WhatsApp number");
                                    }}
                                    className="text-[10px] text-text-muted hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                              {cleanWaDigits ? (
                                <a
                                  href={`https://wa.me/${cleanWaDigits}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Direct Chat (wa.me)</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              ) : null}

                              {safeWaGroupLink ? (
                                <a
                                  href={safeWaGroupLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center justify-center gap-1.5 truncate"
                                >
                                  <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">Open WA Group</span>
                                </a>
                              ) : (
                                <div className="text-[10px] text-text-muted text-center py-1 font-mono">No WA Group</div>
                              )}
                            </div>
                          </div>

                          {/* Telegram Verification Card */}
                          <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/[0.03] flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                                  <TelegramLogo />
                                  <span>Telegram Protocol</span>
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">SECURE</span>
                              </div>
                              <div className="text-xs text-white font-bold flex items-center justify-between">
                                <span>{cleanTgHandle ? `@${cleanTgHandle}` : "Not configured"}</span>
                                {cleanTgHandle && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`@${cleanTgHandle}`);
                                      toast.success("Copied Telegram handle");
                                    }}
                                    className="text-[10px] text-text-muted hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-sky-500/20">
                              {cleanTgHandle ? (
                                <a
                                  href={`https://t.me/${cleanTgHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Open Telegram DM</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              ) : null}

                              {safeTgChannelLink ? (
                                <a
                                  href={safeTgChannelLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-medium flex items-center justify-center gap-1.5 truncate"
                                >
                                  <ExternalLink className="w-3 h-3 text-sky-400 shrink-0" />
                                  <span className="truncate">Open TG Channel</span>
                                </a>
                              ) : (
                                <div className="text-[10px] text-text-muted text-center py-1 font-mono">No TG Channel</div>
                              )}
                            </div>
                          </div>

                          {/* Instagram Verification Card */}
                          <div className="p-4 rounded-xl border border-pink-500/30 bg-pink-500/[0.03] flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                                  <InstagramLogo />
                                  <span>Instagram Profile</span>
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">SOCIAL</span>
                              </div>
                              <div className="text-xs text-white font-bold flex items-center justify-between">
                                <span>{cleanIgHandle ? `@${cleanIgHandle}` : "Not configured"}</span>
                                {cleanIgHandle && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`@${cleanIgHandle}`);
                                      toast.success("Copied Instagram handle");
                                    }}
                                    className="text-[10px] text-text-muted hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-pink-500/20">
                              {safeIgLink ? (
                                <a
                                  href={safeIgLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1.5 px-2.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5"
                                >
                                  <InstagramLogo />
                                  <span>Inspect Instagram</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              ) : (
                                <div className="text-[10px] text-text-muted text-center py-1 font-mono">No Instagram handle</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Specialties & Bio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Tag className="w-3.5 h-3.5 text-accent-amber" />
                        <span>Trading Specialties</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {specialtiesList.map((id) => {
                          const meta = specialtyMeta[id] || { label: id.replace('_', ' '), icon: Tag, color: 'text-accent-cyan', bg: 'bg-white/5', border: 'border-white/10' };
                          const IconComponent = meta.icon;
                          return (
                            <span
                              key={id}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 ${meta.bg} ${meta.border} ${meta.color}`}
                            >
                              <IconComponent className="w-3 h-3" />
                              <span>{meta.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Building2 className="w-3.5 h-3.5 text-accent-cyan" />
                        <span>Store Mission & Bio</span>
                      </label>
                      <p className="text-xs text-text-secondary leading-relaxed italic border-l-2 border-accent-cyan/40 pl-3 py-1">
                        "{bio}"
                      </p>
                    </div>
                  </div>

                  {/* Decision Bar */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                    <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Decisions are cryptographically recorded in the audit trail.</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedApplication(null)}
                        className="w-full sm:w-auto text-xs uppercase border-white/15 hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleRejectReseller(selectedApplication.id)}
                        className="w-full sm:w-auto bg-accent-red/15 hover:bg-accent-red/25 text-accent-red border border-accent-red/40 text-xs uppercase font-bold"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Reject</span>
                      </Button>
                      <Button
                        onClick={() => handleApproveReseller(selectedApplication.id)}
                        className={`w-full sm:w-auto text-xs uppercase font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                          isTier2
                            ? 'bg-gradient-to-r from-accent-amber to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                            : 'bg-accent-green hover:bg-accent-green/80 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{isTier2 ? 'Grant Sentinel Trusted Clearance' : 'Approve Sentinel Verification'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Super Admin Store Edit Modal */}
      <Dialog open={!!editingReseller} onOpenChange={(open) => !open && setEditingReseller(null)}>
        <DialogContent className="max-w-2xl bg-[#090c14] border border-white/15 text-white font-sans p-6 rounded-2xl shadow-[0_0_80px_rgba(0,184,255,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold uppercase font-mono text-accent-cyan flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-accent-cyan" />
              <span>Edit Store Credentials: {editingReseller?.store_name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary font-sans">
              Update direct verified trading channels and legal profile credentials in PostgreSQL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-text-muted block mb-1">Store Display Name</label>
                <input
                  type="text"
                  value={editFormData.storeName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, storeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-accent-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-text-muted block mb-1">Seller Full Legal Name</label>
                <input
                  type="text"
                  value={editFormData.ownerName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-accent-cyan focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-emerald-400 block mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={editFormData.whatsappNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-emerald-400 block mb-1">WhatsApp Channel / Group Link</label>
                <input
                  type="text"
                  value={editFormData.whatsappGroupLink || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsappGroupLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-sky-400 block mb-1">Telegram Handle (@username)</label>
                <input
                  type="text"
                  value={editFormData.telegramUsername || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, telegramUsername: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-sky-400 block mb-1">Telegram Store Channel Link</label>
                <input
                  type="text"
                  value={editFormData.telegramChannelLink || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, telegramChannelLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-pink-400 block mb-1">Instagram Username (@handle)</label>
                <input
                  type="text"
                  value={editFormData.instagramUsername || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, instagramUsername: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-accent-amber block mb-1">State / Jurisdiction</label>
                <select
                  value={editFormData.state || 'Tamil Nadu'}
                  onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-accent-amber focus:outline-none cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-text-muted block mb-1">Store Mission / Bio</label>
              <textarea
                rows={3}
                value={editFormData.bio || ''}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-accent-cyan focus:outline-none font-sans text-xs"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingReseller(null)}
                className="text-xs uppercase border-white/15 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveResellerEdit}
                disabled={isSavingEdit}
                className="bg-accent-cyan hover:bg-accent-cyan/80 text-black text-xs uppercase font-bold shadow-[0_0_15px_rgba(0,184,255,0.3)]"
              >
                {isSavingEdit ? "Saving Changes..." : "Save Credentials"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Threat Broadcast Modal */}
      <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
        <DialogContent className="max-w-lg bg-[#090c14] border border-accent-red/40 text-white font-sans p-6 rounded-2xl shadow-[0_0_80px_rgba(255,51,102,0.2)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold uppercase font-mono text-accent-red flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-accent-red" />
              <span>Broadcast Emergency Threat Alert</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-text-secondary">
              Broadcast an urgent cyber-threat directive to all visitors across the 8xSentinel registry.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 font-mono text-xs">
            <div>
              <label className="text-[10px] uppercase text-text-muted block mb-1">Alert Severity</label>
              <select
                value={broadcastSeverity}
                onChange={(e) => setBroadcastSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:outline-none cursor-pointer"
              >
                <option value="critical">🔴 CRITICAL RED (Impersonation Ring / Severe Active Fraud)</option>
                <option value="warning">🟡 ELEVATED WARNING (Suspicious Handle Advisory)</option>
                <option value="info">🔵 GENERAL ADVISORY (Official Maintenance / Policy)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase text-text-muted block mb-1">Threat Notice Text</label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. CRITICAL: Beware of impersonator @fake_escrow claiming to be Goblin BGMI Store. Verify only through 8xSentinel."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white focus:border-accent-red focus:outline-none font-sans text-xs"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="text-xs uppercase border-white/15 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBroadcastAlert}
                className="bg-accent-red hover:bg-accent-red/80 text-white text-xs uppercase font-bold shadow-[0_0_15px_rgba(255,51,102,0.4)]"
              >
                Publish Live Alert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence Lightbox Modal */}
      <Dialog open={!!evidenceLightboxUrl} onOpenChange={(open) => !open && setEvidenceLightboxUrl(null)}>
        <DialogContent className="max-w-4xl bg-black/95 border border-white/20 p-2 text-white rounded-2xl">
          {evidenceLightboxUrl && (
            <div className="space-y-2">
              <div className="w-full max-h-[80vh] overflow-auto rounded-xl flex items-center justify-center bg-black/60">
                <img
                  src={evidenceLightboxUrl}
                  alt="Scam Evidence Preview"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex items-center justify-between px-2 pt-1 font-mono text-xs">
                <span className="text-text-muted">Evidence Attachment Review</span>
                <a
                  href={evidenceLightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-cyan hover:underline flex items-center gap-1"
                >
                  <span>Open Full Resolution</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
