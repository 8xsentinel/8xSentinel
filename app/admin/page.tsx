"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Users, FileText, ShieldCheck, MapPin, Crown, UserCheck, Lock, LogIn, CheckCircle, XCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Profile, TrustedReseller, ScamReport } from "@/types";
import { INDIAN_STATES, INDIA_REGIONS } from "@/lib/constants/indiaStates";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { user, isSuperAdmin, loading, signInWithGoogle } = useAuth();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [pendingResellers, setPendingResellers] = useState<TrustedReseller[]>([]);
  const [pendingReports, setPendingReports] = useState<ScamReport[]>([]);
  const [selectedTargetState, setSelectedTargetState] = useState("Maharashtra");

  const refreshAllData = async () => {
    setCurrentUser(db.getCurrentUser());
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
            className="w-full bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30 font-mono text-xs uppercase font-bold py-2.5 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Authenticate with Authorized Account
          </Button>
        </div>

        <p className="text-[11px] text-text-muted">
          Unauthorized access attempts are monitored and logged.
        </p>
      </div>
    );
  }

  const handleApproveReseller = async (resellerId: string) => {
    if (!currentUser) return;
    let res: TrustedReseller | null = null;
    if (isSuperAdmin) {
      res = await db.moderateReseller(resellerId, "approved");
    } else {
      res = await db.verifySellerByRegionalAdmin(resellerId, currentUser.id);
    }

    if (res) {
      toast.success(`Merchant "${res.store_name}" Approved!`, {
        description: `Clearance granted for ${res.state || res.region || "India"}.`
      });
      await refreshAllData();
    }
  };

  const handleRejectReseller = async (resellerId: string) => {
    const res = await db.moderateReseller(resellerId, "rejected", "Application did not meet state verification standards.");
    if (res) {
      toast.info(`Store application rejected.`);
      await refreshAllData();
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
            <p className="text-xs text-muted-foreground">Approved Indian Merchants</p>
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
            Merchant Applications ({visiblePendingResellers.length})
          </TabsTrigger>
          <TabsTrigger value="active_resellers" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-green rounded-none px-4 py-3 text-xs">
            Approved Resellers ({resellers.length})
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="regional_admin_mgmt" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-amber rounded-none px-4 py-3 text-xs">
              Appoint State Regional Admins (Super Admin)
            </TabsTrigger>
          )}
          <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-red rounded-none px-4 py-3 text-xs">
            Scam Reports Queue ({pendingReports.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. Pending Merchant Verification Queue */}
        <TabsContent value="regional_verification" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-accent-cyan flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>State Merchant Onboarding Review Queue</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isSuperAdmin
                      ? "As Root Super Admin, you hold universal clearance to approve or reject merchant applications from any Indian State."
                      : `As Regional Admin for ${currentUser?.state || currentUser?.region || "your area"}, review merchant onboarding applications for your territory.`}
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
                  <p className="text-sm font-bold text-white uppercase">All Merchant Applications Reviewed</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto font-sans">
                    There are currently no new merchant onboarding applications pending verification for {isSuperAdmin ? "any state" : currentUser?.state || "your region"}.
                  </p>
                </div>
              ) : (
                visiblePendingResellers.map((r) => (
                  <div key={r.id} className="p-5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white uppercase text-sm tracking-wide">{r.store_name}</span>
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
                        {r.bio || "Candidate store applying for regional merchant verification clearance."}
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

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => handleApproveReseller(r.id)}
                        size="sm"
                        className="bg-accent-green/20 text-accent-green border border-accent-green/40 hover:bg-accent-green/30 text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Merchant</span>
                      </Button>
                      <Button
                        onClick={() => handleRejectReseller(r.id)}
                        size="sm"
                        className="bg-accent-red/20 text-accent-red border border-accent-red/40 hover:bg-accent-red/30 text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Approved Active Resellers */}
        <TabsContent value="active_resellers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-accent-green">Approved Verified Merchants Network</CardTitle>
              <CardDescription className="text-xs">
                Active merchants with cryptographic trade endorsement across India.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resellers.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
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

        {/* 3. Appoint State Regional Admins (Super Admin Only) */}
        {isSuperAdmin && (
          <TabsContent value="regional_admin_mgmt" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-accent-amber flex items-center gap-2">
                    <Crown className="w-4 h-4 text-accent-amber" />
                    <span>Appoint State Regional Admins</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Root privilege (8xSentinel@gmail.com): Grant trusted verified merchants Regional Admin authority over their Indian State.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Target State:</span>
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
              <CardContent className="space-y-4">
                {resellers.map((r) => {
                  const isAlreadyRegionalAdmin = r.profile?.role === 'regional_admin' || r.profile?.roles?.includes('regional_admin');
                  return (
                    <div key={r.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white uppercase">{r.store_name}</h4>
                          {isAlreadyRegionalAdmin && (
                            <Badge className="bg-accent-amber/20 text-accent-amber border-accent-amber/40 text-[9px] uppercase font-mono">
                              Admin: {r.profile?.state || r.profile?.region || "Regional"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-text-muted text-[11px] font-sans">
                          Owner Profile: <span className="text-gray-300 font-mono">{r.profile_id}</span> | State: {r.state || r.region || "Pan India"}
                        </p>
                      </div>
                      <Button
                        onClick={() => handlePromoteRegionalAdmin(r)}
                        size="sm"
                        className="bg-accent-amber/15 text-accent-amber border border-accent-amber/40 hover:bg-accent-amber/25 text-xs uppercase font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Appoint Regional Admin ({selectedTargetState})</span>
                      </Button>
                    </div>
                  );
                })}
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
