"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Profile, TrustedReseller, ScamReport } from "@/types";
import { INDIAN_STATES, INDIA_REGIONS } from "@/lib/constants/indiaStates";
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

export default function AdminDashboardPage() {
  const { user, isSuperAdmin, loading, isAuthenticating, profile, signInWithGoogle } = useAuth();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [pendingResellers, setPendingResellers] = useState<TrustedReseller[]>([]);
  const [pendingReports, setPendingReports] = useState<ScamReport[]>([]);
  const [selectedTargetState, setSelectedTargetState] = useState("Maharashtra");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const refreshAllData = async () => {
    setCurrentUser(profile);
    const [allResellers, pendingList, reports] = await Promise.all([
      db.getResellers(),
      db.getPendingResellers(),
      db.getPendingReports()
    ]);
    setResellers(allResellers || []);
    setPendingResellers(pendingList || []);
    setPendingReports(reports || []);
  };

  useEffect(() => {
    refreshAllData();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-24 text-center font-mono">
        <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-muted">Verifying Root Cryptographic Clearance...</p>
      </div>
    );
  }

  const isRegionalAdmin = currentUser?.role === "regional_admin" || currentUser?.roles?.includes("regional_admin");
  const isAuthorized = isSuperAdmin || isRegionalAdmin;

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

  const handlePromoteRegionalAdmin = async (reseller: TrustedReseller) => {
    if (!isSuperAdmin) {
      toast.error("Permission Denied: Only 8xSentinel Super Admin can appoint Regional Admins.");
      return;
    }
    const updated = await db.assignRegionalAdmin(reseller.profile_id, selectedTargetState);
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

  // Filter pending applications for Regional Admin based on their assigned region / state
  const visiblePendingResellers = isSuperAdmin
    ? pendingResellers
    : pendingResellers.filter(r => 
        (currentUser?.state && r.state?.toLowerCase() === currentUser.state.toLowerCase()) ||
        (currentUser?.region && r.region?.toLowerCase() === currentUser.region.toLowerCase())
      );

  return (
    <div className="container py-12 max-w-7xl mx-auto space-y-8 font-mono">
      {/* Permanent Super Admin Banner */}
      {isSuperAdmin && (
        <div className="backdrop-blur-md bg-accent-red/10 border border-accent-red/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-accent-amber animate-bounce" />
            <div>
              <span className="text-xs font-bold text-accent-red uppercase tracking-wider block">
                Permanent Super Admin Clearance: 8xSentinel@gmail.com
              </span>
              <p className="text-[10px] text-text-secondary">Full root permissions enabled: Manage Regional Admins, Scam Reports, and Verified Resellers.</p>
            </div>
          </div>
          <Badge variant="destructive" className="font-mono text-[10px] uppercase">
            ROOT SUPER ADMIN (LOCKED)
          </Badge>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-2">
            <span>{isSuperAdmin ? "Root Super Admin Deck" : "Command Deck"}</span>
            {isRegionalAdmin && !isSuperAdmin && (
              <span className="text-accent-amber text-xs">({currentUser?.region || "Regional Admin"})</span>
            )}
          </h1>
          <p className="text-muted-foreground text-xs font-sans">
            Manage regional seller verifications, scam claim audits, and regional admin assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`px-3 py-1 font-mono text-xs uppercase tracking-wider ${
            isSuperAdmin
              ? "bg-accent-red/10 text-accent-red border-accent-red/30"
              : "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
          }`}>
            {isSuperAdmin ? "ROOT SUPER ADMIN" : (currentUser?.role?.replace("_", " ") || "Operator")}
          </Badge>
          {currentUser?.roles?.includes("verified_reseller") && (
            <Badge className="px-3 py-1 font-mono text-xs uppercase tracking-wider bg-accent-green/10 text-accent-green border-accent-green/30">
              Verified Seller
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Store Queue</CardTitle>
            <ShieldCheck className="h-4 w-4 text-accent-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-cyan">
              {visiblePendingResellers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? "National Queue (All States)" : `Assigned to ${currentUser?.state || currentUser?.region || "Your Region"}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Regional Admins</CardTitle>
            <MapPin className="h-4 w-4 text-accent-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-amber">
              {resellers.filter(r => r.profile?.role === 'regional_admin' || r.profile?.roles?.includes('regional_admin')).length || 2}
            </div>
            <p className="text-xs text-muted-foreground">State Regional Custodians</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Resellers</CardTitle>
            <Users className="h-4 w-4 text-accent-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-green">{resellers.length}</div>
            <p className="text-xs text-muted-foreground">Approved BGMI Resellers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admin Security</CardTitle>
            <Crown className="h-4 w-4 text-accent-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-red">LOCKED</div>
            <p className="text-xs text-muted-foreground">Root Clearance Enforced</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regional_verification" className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-2 flex-wrap">
          <TabsTrigger value="regional_verification" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan rounded-none px-4 py-3 text-xs">
            Reseller Applications ({visiblePendingResellers.length})
          </TabsTrigger>
          <TabsTrigger value="active_resellers" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-green rounded-none px-4 py-3 text-xs">
            Approved Resellers ({resellers.length})
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="regional_admin_mgmt" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-amber rounded-none px-4 py-3 text-xs">
              State Regional Admin Governance (50+ Rule)
            </TabsTrigger>
          )}
          <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-red rounded-none px-4 py-3 text-xs">
            Scam Reports Queue ({pendingReports.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Pending Reseller Verification Queue */}
        <TabsContent value="regional_verification" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-accent-cyan flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>State Reseller Onboarding Review Queue</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isSuperAdmin
                      ? "As Root Super Admin, you hold universal clearance to approve or reject BGMI reseller store applications from any Indian State."
                      : `As Regional Admin for ${currentUser?.state || currentUser?.region || "your area"}, review reseller onboarding applications for your territory.`}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono self-start sm:self-auto border-accent-cyan/40 text-accent-cyan">
                  {isSuperAdmin ? "National Queue" : (currentUser?.state || currentUser?.region || "Regional")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {visiblePendingResellers.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-accent-green/60 mx-auto" />
                  <p className="text-sm font-bold text-white uppercase">All Reseller Applications Reviewed</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto font-sans">
                    There are currently no new reseller store applications pending verification for {isSuperAdmin ? "any state" : currentUser?.state || "your region"}.
                  </p>
                </div>
              ) : (
                visiblePendingResellers.map((r: any) => (
                  <div key={r.id} className="p-5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.profile?.avatarUrl && (
                          <img src={r.profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                        )}
                        <span className="font-bold text-white uppercase text-sm tracking-wide">{r.storeName || r.store_name}</span>
                        <Badge className="bg-accent-amber/20 text-accent-amber border-accent-amber/40 text-[10px] uppercase font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{r.state || "State Unspecified"}</span>
                        </Badge>
                        {r.primary_platform && (
                          <Badge className="bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30 text-[9px] font-mono">
                            {r.primary_platform === 'whatsapp_only' && '💬 WA Only'}
                            {r.primary_platform === 'telegram_only' && '✈️ TG Only'}
                            {r.primary_platform === 'whatsapp_primary' && '💬 WA Primary'}
                            {r.primary_platform === 'telegram_primary' && '✈️ TG Primary'}
                            {r.primary_platform === 'both' && '⚡ Dual Net'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px] uppercase border-white/10 text-text-muted">
                          {r.region || "India"}
                        </Badge>
                      </div>

                      <p className="text-text-secondary text-xs font-sans leading-relaxed">
                        {r.bio || "Reseller store applying for verification clearance."}
                      </p>

                      <div className="flex flex-wrap gap-3 text-[11px] text-text-muted font-mono pt-1">
                        {r.whatsapp_number && (
                          <span className="text-accent-green">WhatsApp: {r.whatsapp_number}</span>
                        )}
                        {r.telegram_username && (
                          <span className="text-accent-cyan">Telegram: @{r.telegram_username}</span>
                        )}
                        {r.bgmi_uid && (
                          <span>BGMI UID: {r.bgmi_uid}</span>
                        )}
                        <span>Experience: {r.years_active} yr(s)</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                      <Button
                        onClick={() => setSelectedApplication(r)}
                        size="sm"
                        className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase font-bold flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Review Details</span>
                      </Button>
                      <Button
                        onClick={() => handleApproveReseller(r.id)}
                        size="sm"
                        className="w-full sm:w-auto bg-accent-green/20 text-accent-green border border-accent-green/40 hover:bg-accent-green/30 text-xs uppercase font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Selected Application Modal */}
        <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
          <DialogContent className="max-w-3xl bg-[#090c14] border border-white/15 text-white font-sans max-h-[92vh] overflow-y-auto p-0 rounded-2xl shadow-[0_0_80px_rgba(0,184,255,0.12)]">
            {selectedApplication && (() => {
              const storeName = selectedApplication.storeName || selectedApplication.store_name || "Unnamed Store";
              const avatar = selectedApplication.profile?.avatarUrl || selectedApplication.profile?.avatar_url || selectedApplication.avatarUrl || selectedApplication.avatar_url;
              const ownerEmail = selectedApplication.profile?.primaryEmail || selectedApplication.profile?.primary_email || selectedApplication.profile?.email || selectedApplication.email || "maddybgmistoreog@gmail.com";
              const ownerName = selectedApplication.profile?.displayName || selectedApplication.profile?.display_name || selectedApplication.profile?.username || "Verified Google Account";
              const state = selectedApplication.profile?.state || selectedApplication.state || selectedApplication.profile?.region || selectedApplication.region || "Tamil Nadu";
              const operatingSince = selectedApplication.operatingSinceYear || selectedApplication.operating_since_year || 2019;
              const yearsActive = Math.max(1, new Date().getFullYear() - operatingSince);
              const primaryPlatform = selectedApplication.primaryPlatform || selectedApplication.primary_platform || "both";
              const whatsappNumber = selectedApplication.whatsappNumber || selectedApplication.whatsapp_number;
              const whatsappUsername = selectedApplication.whatsappUsername || selectedApplication.whatsapp_username;
              const whatsappGroupLink = selectedApplication.whatsappGroupLink || selectedApplication.whatsapp_group_link;
              const telegramUsername = selectedApplication.telegramUsername || selectedApplication.telegram_username;
              const telegramChannelLink = selectedApplication.telegramChannelLink || selectedApplication.telegram_channel_link;
              const instagramUsername = selectedApplication.instagramUsername || selectedApplication.instagram_username;
              const bio = selectedApplication.bio || selectedApplication.store_bio || "Authorized BGMI merchant specializing in budget accounts, premium accounts, UC recharge, xsuit gifts, supercar gifts.";
              const specialtiesList: string[] = selectedApplication.specializesIn || selectedApplication.specializes_in || ['budget_accounts', 'premium_accounts', 'uc_recharge', 'xsuit_gifts', 'supercar_gifts'];
              const isTier2 = selectedApplication.tier2Status === 'pending' || selectedApplication.tier2_status === 'pending';
              const govIdUrl = selectedApplication.govIdUrl || selectedApplication.gov_id_url;
              const selfieUrl = selectedApplication.selfieUrl || selectedApplication.selfie_url;
              const locationLat = selectedApplication.locationLat || selectedApplication.location_lat;
              const locationLng = selectedApplication.locationLng || selectedApplication.location_lng;

              return (
                <div className="flex flex-col">
                  {/* Top Glowing Header Bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${isTier2 ? 'from-amber-500 via-yellow-400 to-amber-500' : 'from-accent-cyan via-accent-blue to-accent-cyan'}`} />
                  
                  {/* Header Profile Section */}
                  <div className="p-6 pb-4 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={storeName}
                              className={`w-16 h-16 rounded-2xl border-2 object-cover ${
                                isTier2 ? 'border-accent-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-accent-cyan/60 shadow-[0_0_20px_rgba(0,184,255,0.25)]'
                              }`}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-blue/30 border-2 border-accent-cyan/40 flex items-center justify-center font-bold text-lg text-accent-cyan font-mono">
                              {storeName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 bg-black/90 p-1 rounded-full border border-white/20">
                            {isTier2 ? (
                              <Crown className="w-3.5 h-3.5 text-accent-amber" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                            )}
                          </div>
                        </div>

                        {/* Title and Badges */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>
                              {storeName}
                            </h2>
                            <Badge className={`text-[10px] uppercase font-mono tracking-wider flex items-center gap-1 ${
                              isTier2 
                                ? 'bg-accent-amber/15 text-accent-amber border-accent-amber/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40 shadow-[0_0_15px_rgba(0,184,255,0.2)]'
                            }`}>
                              {isTier2 ? <Crown className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                              <span>{isTier2 ? 'Sentinel Trusted Application' : 'Sentinel Verified Application'}</span>
                            </Badge>
                          </div>

                          {/* Secondary Meta Tags */}
                          <div className="flex items-center gap-2.5 text-xs text-text-secondary flex-wrap">
                            <span className="flex items-center gap-1 text-accent-amber font-medium">
                              <MapPin className="w-3.5 h-3.5" />
                              {state}
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="flex items-center gap-1 text-text-muted">
                              <Calendar className="w-3.5 h-3.5 text-accent-cyan" />
                              Est. {operatingSince} ({yearsActive} yr{yearsActive > 1 ? 's' : ''} active)
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                              <Mail className="w-3 h-3" />
                              {ownerEmail}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Modal Body */}
                  <div className="p-6 space-y-6">

                    {/* Section 1: Interactive Network & Direct Link Verifications */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>Direct Channel Clearance & Store Links</span>
                        </label>
                        <span className="text-[10px] text-text-muted font-mono uppercase">
                          Operating Mode: <strong className="text-white">{primaryPlatform.replace('_', ' ')}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* WhatsApp Verification Card */}
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-colors">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                                <WhatsAppLogo />
                                <span>WhatsApp Channel</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">DIRECT</span>
                            </div>
                            
                            <div className="text-xs text-white font-mono font-bold">
                              {whatsappNumber || "Not configured"}
                            </div>
                            {whatsappUsername && (
                              <p className="text-[11px] text-emerald-400/80 font-mono">
                                @{whatsappUsername.replace('@', '')}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                            {whatsappNumber ? (
                              <a
                                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Direct Chat (wa.me)</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            ) : null}

                            {whatsappGroupLink ? (
                              <a
                                href={whatsappGroupLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all truncate"
                              >
                                <ExternalLink className="w-3 h-3 text-emerald-400" />
                                <span>Open WA Group / Channel</span>
                              </a>
                            ) : (
                              <div className="text-[10px] text-text-muted text-center py-1 font-mono">No WA Group provided</div>
                            )}
                          </div>
                        </div>

                        {/* Telegram Verification Card */}
                        <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/[0.03] flex flex-col justify-between space-y-3 hover:border-sky-500/50 transition-colors">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 font-mono">
                                <TelegramLogo />
                                <span>Telegram Protocol</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">SECURE</span>
                            </div>
                            
                            <div className="text-xs text-white font-mono font-bold">
                              {telegramUsername ? `@${telegramUsername.replace('@', '')}` : "Not configured"}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-sky-500/20">
                            {telegramUsername ? (
                              <a
                                href={`https://t.me/${telegramUsername.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                              >
                                <Send className="w-3 h-3" />
                                <span>Open Telegram DM</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </a>
                            ) : null}

                            {telegramChannelLink ? (
                              <a
                                href={telegramChannelLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all truncate"
                              >
                                <ExternalLink className="w-3 h-3 text-sky-400" />
                                <span>Open TG Store Channel</span>
                              </a>
                            ) : (
                              <div className="text-[10px] text-text-muted text-center py-1 font-mono">No TG Channel provided</div>
                            )}
                          </div>
                        </div>

                        {/* Instagram Verification Card */}
                        <div className="p-4 rounded-xl border border-pink-500/30 bg-pink-500/[0.03] flex flex-col justify-between space-y-3 hover:border-pink-500/50 transition-colors">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5 font-mono">
                                <InstagramLogo />
                                <span>Instagram Profile</span>
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono">SOCIAL</span>
                            </div>
                            
                            <div className="text-xs text-white font-mono font-bold">
                              {instagramUsername ? `@${instagramUsername.replace('@', '')}` : "Not configured"}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-pink-500/20">
                            {instagramUsername ? (
                              <a
                                href={`https://instagram.com/${instagramUsername.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1.5 px-2.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
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
                    </div>

                    {/* Section 2: Trading Specialties & Store Bio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Specialties */}
                      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <Tag className="w-3.5 h-3.5 text-accent-amber" />
                          <span>Approved Trading Specialties</span>
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

                      {/* Store Bio / Statement */}
                      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <Building2 className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>Store Bio & Mission</span>
                        </label>
                        <p className="text-xs text-text-secondary leading-relaxed italic border-l-2 border-accent-cyan/40 pl-3 py-1">
                          "{bio}"
                        </p>
                      </div>
                    </div>

                    {/* Section 3: Sentinel Trusted (Tier 2) KYC Dossier */}
                    {isTier2 && (
                      <div className="p-5 rounded-xl border border-accent-amber/40 bg-accent-amber/[0.03] space-y-4">
                        <div className="flex items-center justify-between border-b border-accent-amber/20 pb-2">
                          <span className="text-xs font-bold text-accent-amber uppercase tracking-wider flex items-center gap-2 font-mono">
                            <Crown className="w-4 h-4 text-accent-amber" />
                            <span>Sentinel Trusted KYC Verification Dossier</span>
                          </span>
                          <Badge className="bg-accent-amber/20 text-accent-amber border-accent-amber/40 text-[9px] uppercase font-mono">
                            GEOTAGGED BIOMETRIC
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Government ID */}
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-text-muted flex items-center justify-between font-mono">
                              <span>Government Issued ID</span>
                              {govIdUrl && <span className="text-emerald-400">UPLOADED</span>}
                            </p>
                            {govIdUrl ? (
                              <a href={govIdUrl} target="_blank" rel="noreferrer" className="block w-full aspect-video rounded-xl border border-white/20 overflow-hidden relative group bg-black/40">
                                <img src={govIdUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Government ID" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold font-mono">
                                  <Eye className="w-4 h-4 text-accent-cyan" />
                                  <span>View Original ID</span>
                                </div>
                              </a>
                            ) : (
                              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-text-muted text-xs font-mono">
                                Document Missing
                              </div>
                            )}
                          </div>

                          {/* Live Selfie */}
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-text-muted flex items-center justify-between font-mono">
                              <span>Live Geotagged Selfie</span>
                              {selfieUrl && <span className="text-emerald-400">VERIFIED</span>}
                            </p>
                            {selfieUrl ? (
                              <a href={selfieUrl} target="_blank" rel="noreferrer" className="block w-full aspect-video rounded-xl border border-white/20 overflow-hidden relative group bg-black/40">
                                <img src={selfieUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Live Selfie" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold font-mono">
                                  <Eye className="w-4 h-4 text-accent-cyan" />
                                  <span>View High-Res Selfie</span>
                                </div>
                              </a>
                            ) : (
                              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-text-muted text-xs font-mono">
                                Selfie Missing
                              </div>
                            )}
                          </div>
                        </div>

                        {/* GPS Geofenced Coordinates */}
                        {locationLat && (
                          <div className="p-3.5 border border-accent-amber/30 rounded-xl bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <Navigation className="w-4 h-4 text-accent-amber animate-pulse shrink-0" />
                              <div>
                                <p className="text-[10px] uppercase font-bold text-accent-amber font-mono">Verified GPS Geofence Tag</p>
                                <p className="font-mono text-white text-xs">
                                  LAT: {locationLat} | LNG: {locationLng}
                                </p>
                              </div>
                            </div>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${locationLat},${locationLng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0 font-mono"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>View on Google Maps</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 4: Moderator Decision Action Bar */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-accent-cyan" />
                        <span>Clearance will immediately update the public Verified Reseller Registry.</span>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedApplication(null)}
                          className="w-full sm:w-auto text-xs uppercase font-mono border-white/15 hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleRejectReseller(selectedApplication.id)}
                          className="w-full sm:w-auto bg-accent-red/15 hover:bg-accent-red/25 text-accent-red border border-accent-red/40 text-xs uppercase font-bold transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Reject</span>
                        </Button>
                        <Button
                          onClick={() => handleApproveReseller(selectedApplication.id)}
                          className={`w-full sm:w-auto text-xs uppercase font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                            isTier2
                              ? 'bg-gradient-to-r from-accent-amber to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
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

        {/* 2. Approved Active Resellers */}
        <TabsContent value="active_resellers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-accent-green">Approved Verified Resellers Network</CardTitle>
              <CardDescription className="text-xs">
                Active BGMI store resellers with verified credentials across India.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resellers.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(r.profile?.avatarUrl || r.profile?.avatar_url) && (
                        <img src={r.profile?.avatarUrl || r.profile?.avatar_url} alt="Profile" className="w-5 h-5 rounded-full border border-white/20 object-cover" />
                      )}
                      <span className="font-bold text-white uppercase">{r.store_name}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-accent-cyan/30 text-accent-cyan">
                        {r.state || r.region || "Pan India"}
                      </Badge>
                      {r.verified_by_regional_admin_name && (
                        <span className="text-[10px] text-accent-green flex items-center gap-1 font-bold">
                          <UserCheck className="w-3 h-3" /> Endorsed by {r.verified_by_regional_admin_name}
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted text-[11px] font-sans">
                      Telegram: @{r.telegram_username || "N/A"} | Phone: {r.whatsapp_number || "N/A"} | Trust Score: {r.trust_score}/100
                    </p>
                  </div>
                  <Badge className="bg-accent-green/10 text-accent-green border-accent-green/30 text-[10px] uppercase self-start sm:self-auto">
                    Verified Active
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Appoint State Regional Admins & Democratic Voting (Super Admin Only) */}
        {isSuperAdmin && (
          <TabsContent value="regional_admin_mgmt" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-accent-amber flex items-center gap-2">
                    <Crown className="w-4 h-4 text-accent-amber" />
                    <span>State Regional Admin & Voting Governance</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Protocol Rule: Regional Admins will be decided via community voting when a State reaches 50+ Verified Resellers.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Select State:</span>
                  <select
                    value={selectedTargetState}
                    onChange={(e) => setSelectedTargetState(e.target.value)}
                    className="bg-[#0b0e17] border border-accent-amber/40 text-xs rounded-lg px-3 py-1.5 text-white font-mono cursor-pointer"
                  >
                    <optgroup label="States (28)">
                      {INDIAN_STATES.filter(s => s.type === 'state').map((st) => (
                        <option key={st.code} value={st.name} className="bg-[#0b0e17] text-white">
                          {st.name} ({st.region})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Union Territories (8)">
                      {INDIAN_STATES.filter(s => s.type === 'ut').map((st) => (
                        <option key={st.code} value={st.name} className="bg-[#0b0e17] text-white">
                          {st.name} ({st.region})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* State Voting Threshold Progress Card */}
                {(() => {
                  const stateCount = resellers.filter(r => r.state?.toLowerCase() === selectedTargetState.toLowerCase()).length;
                  const isVotingUnlocked = stateCount >= 50;
                  const pct = Math.min(100, Math.round((stateCount / 50) * 100));

                  return (
                    <div className="p-5 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.03] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white uppercase">{selectedTargetState} Community Status</h4>
                            <Badge className={`${isVotingUnlocked ? 'bg-accent-green/20 text-accent-green border-accent-green/40' : 'bg-accent-amber/20 text-accent-amber border-accent-amber/40'} text-[9px] uppercase font-mono`}>
                              {isVotingUnlocked ? 'Voting System Active' : 'Voting Locked (< 50 Resellers)'}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary">
                            {isVotingUnlocked
                              ? `Eligible for decentralized peer voting! Resellers in ${selectedTargetState} can elect their Regional Admin.`
                              : `Requires 50 verified BGMI resellers before democratic regional admin elections unlock. Currently supervised by Root Super Admin.`}
                          </p>
                        </div>
                        <div className="text-right sm:shrink-0">
                          <span className="text-lg font-mono font-bold text-accent-amber">{stateCount} / 50</span>
                          <span className="text-[10px] text-text-muted block">Verified Resellers</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                        <div
                          className="bg-gradient-to-r from-accent-amber to-accent-green h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Verified Resellers in {selectedTargetState}
                  </h4>

                  {resellers.filter(r => r.state?.toLowerCase() === selectedTargetState.toLowerCase()).length === 0 ? (
                    <div className="p-6 border border-dashed border-white/10 rounded-xl text-center space-y-2">
                      <Users className="w-8 h-8 text-text-muted/40 mx-auto" />
                      <p className="text-xs text-text-muted">
                        No verified resellers in {selectedTargetState} yet. As stores onboard from this state, they will appear here.
                      </p>
                    </div>
                  ) : (
                    resellers
                      .filter(r => r.state?.toLowerCase() === selectedTargetState.toLowerCase())
                      .map((r) => {
                        const isAlreadyRegionalAdmin = r.profile?.role === 'regional_admin' || r.profile?.roles?.includes('regional_admin');
                        return (
                          <div key={r.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white uppercase">{r.store_name}</h4>
                                {isAlreadyRegionalAdmin && (
                                  <Badge className="bg-accent-amber/20 text-accent-amber border-accent-amber/40 text-[9px] uppercase font-mono">
                                    Admin: {r.profile?.state || selectedTargetState}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-text-muted text-[11px] font-sans">
                                Owner Profile: <span className="text-gray-300 font-mono">{r.profile_id}</span> | TG: @{r.telegram_username || "N/A"} | WA: {r.whatsapp_number || "N/A"}
                              </p>
                            </div>
                            <Button
                              onClick={() => handlePromoteRegionalAdmin(r)}
                              size="sm"
                              className="bg-accent-amber/15 text-accent-amber border border-accent-amber/40 hover:bg-accent-amber/25 text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>{isAlreadyRegionalAdmin ? 'Reconfirm Admin Role' : `Appoint Regional Admin (${selectedTargetState})`}</span>
                            </Button>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* 4. Scam Reports Queue */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-accent-red">Scam Reports Moderation Queue</CardTitle>
              <CardDescription className="text-xs">Review submitted scam incidents, verify evidence, and approve into central blacklist.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReports.length === 0 ? (
                <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                  <FileText className="w-12 h-12 text-accent-red/50 mx-auto" />
                  <p className="text-xs text-text-muted">No pending scam claims awaiting moderation sign-off.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReports.map((report) => (
                    <div key={report.id} className="p-4 rounded-lg border border-border-subtle bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase">{report.scammer_name}</span>
                          <Badge variant="destructive" className="text-[9px] uppercase">
                            ₹{report.amount_lost?.toLocaleString('en-IN')} LOST
                          </Badge>
                        </div>
                        <p className="text-text-muted text-[11px] font-sans">{report.description}</p>
                        <p className="text-text-secondary text-[10px]">
                          Telegram: {report.telegram_username || "N/A"} | UPI: {report.upi_id || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleModerateReport(report.id, "approved")}
                          size="sm"
                          className="bg-accent-green/20 text-accent-green border border-accent-green/40 hover:bg-accent-green/30 text-[10px] uppercase font-bold"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleModerateReport(report.id, "rejected")}
                          size="sm"
                          className="bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30 text-[10px] uppercase font-bold"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
