"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Users, FileText, Activity, ShieldCheck, MapPin, Crown, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Profile, TrustedReseller } from "@/types";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("North India");

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    db.getResellers().then(setResellers);
  }, []);

  if (loading) {
    return <div className="container py-24 text-center font-sans">Loading admin command deck...</div>;
  }

  const isSuperAdmin = user?.email?.toLowerCase() === "8xsentinel@gmail.com" || currentUser?.role === "super_admin" || currentUser?.role === "admin";
  const isRegionalAdmin = currentUser?.role === "regional_admin" || currentUser?.roles?.includes("regional_admin");
  const isAuthorized = isSuperAdmin || isRegionalAdmin || currentUser?.role === "admin" || currentUser?.role === "moderator";

  if (!isAuthorized) {
    return (
      <div className="container py-24 text-center space-y-4 font-mono">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto animate-pulse" />
        <h1 className="text-3xl font-bold tracking-tight uppercase text-accent-red">Access Clearance Denied</h1>
        <p className="text-muted-foreground text-xs">
          Only Regional Admins, Moderators, and Permanent Super Admin (<span className="text-accent-cyan font-bold">8xSentinel@gmail.com</span>) can access the Command Deck.
        </p>
      </div>
    );
  }

  const handleApproveRegional = async (resellerId: string) => {
    if (!currentUser) return;
    const res = await db.verifySellerByRegionalAdmin(resellerId, currentUser.id);
    if (res) {
      toast.success(`Seller Regional Verification Approved by ${currentUser.display_name || currentUser.username}`);
      const updated = await db.getResellers();
      setResellers(updated);
    }
  };

  const handlePromoteRegionalAdmin = async (reseller: TrustedReseller) => {
    const updated = await db.assignRegionalAdmin(reseller.profile_id, selectedRegion);
    if (updated) {
      toast.success(`Promoted ${reseller.store_name} to Regional Admin (${selectedRegion})`, {
        description: "User now holds dual roles: Seller + Regional Admin."
      });
      const resellersList = await db.getResellers();
      setResellers(resellersList);
    }
  };

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
              <p className="text-[10px] text-text-secondary">Full root permissions enabled: Manage Regional Admins, Moderators, and Sellers.</p>
            </div>
          </div>
          <Badge variant="destructive" className="font-mono text-[10px] uppercase">
            ROOT SUPER ADMIN
          </Badge>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase flex items-center gap-2">
            <span>Command Deck</span>
            {isRegionalAdmin && <span className="text-accent-amber text-xs">({currentUser?.region || "Regional Admin"})</span>}
          </h1>
          <p className="text-muted-foreground text-xs font-sans">
            Manage regional seller verifications, trust audits, and regional admin assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="px-3 py-1 font-mono text-xs uppercase tracking-wider bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30">
            {currentUser?.role?.replace("_", " ") || "Operator"}
          </Badge>
          {currentUser?.roles?.includes("seller") && (
            <Badge className="px-3 py-1 font-mono text-xs uppercase tracking-wider bg-accent-green/10 text-accent-green border-accent-green/30">
              Verified Seller
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regional Verification Queue</CardTitle>
            <ShieldCheck className="h-4 w-4 text-accent-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-cyan">
              {resellers.filter(r => r.verification_status === "pending").length || 3}
            </div>
            <p className="text-xs text-muted-foreground">Pending Regional Admin Sign-off</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Regional Admins</CardTitle>
            <MapPin className="h-4 w-4 text-accent-amber" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-amber">4</div>
            <p className="text-xs text-muted-foreground">Covering North, South, West & East India</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Resellers</CardTitle>
            <Users className="h-4 w-4 text-accent-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-green">{resellers.length}</div>
            <p className="text-xs text-muted-foreground">Community Vetted Merchants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admin Status</CardTitle>
            <Crown className="h-4 w-4 text-accent-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-red">ONLINE</div>
            <p className="text-xs text-muted-foreground">8xSentinel@gmail.com</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="regional_verification" className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-2">
          <TabsTrigger value="regional_verification" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan rounded-none px-4 py-3 text-xs">
            Regional Seller Verification
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="regional_admin_mgmt" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-amber rounded-none px-4 py-3 text-xs">
              Appoint Regional Admins (Super Admin)
            </TabsTrigger>
          )}
          <TabsTrigger value="reports" className="data-[state=active]:border-b-2 data-[state=active]:border-accent-red rounded-none px-4 py-3 text-xs">
            Scam Reports Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regional_verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-accent-cyan">Regional Admin Seller Vouching</CardTitle>
              <CardDescription className="text-xs">
                As a Regional Admin for <span className="font-bold text-accent-cyan">{currentUser?.region || "North India"}</span>, review and endorse regional merchants.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resellers.map((r) => (
                <div key={r.id} className="p-4 rounded-lg border border-border-subtle bg-white/[0.01] flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary uppercase text-sm">{r.store_name}</span>
                      <Badge variant="outline" className="text-[9px] uppercase border-border-subtle">
                        {r.region || "North India"}
                      </Badge>
                      {r.verified_by_regional_admin_name && (
                        <span className="text-[10px] text-accent-green flex items-center gap-1 font-bold">
                          <UserCheck className="w-3 h-3" /> Verified by {r.verified_by_regional_admin_name}
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted text-[11px] font-sans">Telegram: @{r.telegram_username || "N/A"} | Phone: {r.whatsapp_number || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleApproveRegional(r.id)}
                      size="sm"
                      className="bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 text-[10px] uppercase font-bold"
                    >
                      Approve Regional Seller
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="regional_admin_mgmt" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-accent-amber">Appoint Dual-Role Regional Admins</CardTitle>
                  <CardDescription className="text-xs">
                    Root privilege (8xSentinel@gmail.com): Grant trusted sellers Regional Admin clearance for their local trading region.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Target Region:</span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-bg-surface border border-border-subtle text-xs rounded px-2 py-1 text-text-primary font-mono"
                  >
                    <option value="North India">North India</option>
                    <option value="South India">South India</option>
                    <option value="West India">West India</option>
                    <option value="East India">East India</option>
                    <option value="Central India">Central India</option>
                    <option value="North-East India">North-East India</option>
                    <option value="Pan India">Pan India</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resellers.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg border border-border-subtle bg-white/[0.01] flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-text-primary uppercase">{r.store_name}</h4>
                      <p className="text-text-muted text-[10px] font-sans">Owner Profile ID: {r.profile_id}</p>
                    </div>
                    <Button
                      onClick={() => handlePromoteRegionalAdmin(r)}
                      size="sm"
                      className="bg-accent-amber/10 text-accent-amber border border-accent-amber/30 hover:bg-accent-amber/20 text-[10px] uppercase font-bold"
                    >
                      Promote to Regional Admin ({selectedRegion})
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-accent-red">Scam Reports Queue</CardTitle>
              <CardDescription className="text-xs">Review incoming reported loss amounts and victim contact phone numbers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                <FileText className="w-12 h-12 text-accent-red/50 mx-auto" />
                <p className="text-xs text-text-muted">No pending high-severity scam claims requiring regional escalation.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

