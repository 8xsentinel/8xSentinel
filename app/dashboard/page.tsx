"use client";

import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, UserCircle, History, UploadCloud, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { MapPin } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, isSuperAdmin, loading } = useAuth();
  const router = useRouter();

  const isAdmin = isSuperAdmin || profile?.role === "regional_admin" || profile?.role === "admin";
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (isAdmin) {
        router.push("/admin");
      }
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || isAdmin) {
    return <div className="container py-24 text-center font-sans">Loading dashboard...</div>;
  }

  const isReseller = profile?.role === "verified_reseller";
  const userRoleDisplay = isReseller ? "reseller" : "standard";
  const displayName = user?.displayName || user?.email?.split('@')[0] || "Operator";

  return (
    <ProtectedRoute>
      <div className="container py-12 max-w-6xl mx-auto space-y-8 font-sans">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-h)' }}>Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {displayName}.</p>
          </div>
          <div className="flex items-center gap-2">
            {profile?.state && (
              <Badge className="bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30 px-3 py-1 font-mono text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.state}</span>
              </Badge>
            )}
            <Badge variant="outline" className="px-4 py-1 uppercase tracking-wider text-accent-green border-accent-green/50">
              {userRoleDisplay} Account
            </Badge>
          </div>
        </div>

      <Tabs defaultValue={isReseller ? "profile" : "reports"} className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto hide-scrollbar snap-x whitespace-nowrap">
          {isReseller && (
            <>
              <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 shrink-0 snap-start">
                My Profile
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 shrink-0 snap-start">
                Verification Status
              </TabsTrigger>
              <TabsTrigger value="appeals" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 shrink-0 snap-start">
                Appeals & Reports
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="reports" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 shrink-0 snap-start">
            My Submitted Reports
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 shrink-0 snap-start">
            Saved Profiles
          </TabsTrigger>
        </TabsList>

        {isReseller && (
          <>
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Management</CardTitle>
                  <CardDescription>Update your public reseller profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                    <UserCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No profile configured yet.</p>
                    <Button>Create Reseller Profile</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Merchant Verification Tiers</CardTitle>
                  <CardDescription>View your current credentials and apply for elite trust badges.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  {/* Tier 1: Sentinel Verified */}
                  <div className="p-6 border border-accent-cyan/40 bg-accent-cyan/[0.03] rounded-xl space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-accent-cyan" />
                        <h3 className="font-semibold text-lg text-white">Sentinel Verified</h3>
                      </div>
                      <Badge className="bg-accent-green/20 text-accent-green border-accent-green/40 text-[10px] uppercase font-mono">
                        ACTIVE (TIER 1)
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Your identity and store handles have been verified by your State Regional Admin. You hold cryptographic merchant standing in the registry.
                    </p>
                    <div className="text-[11px] text-accent-green font-mono flex items-center gap-1.5 pt-2 border-t border-white/5">
                      <span>✓ State Operating Clearance Granted</span>
                    </div>
                  </div>
                  
                  {/* Tier 2: Sentinel Trusted Reseller */}
                  <div className="p-6 border border-accent-amber/40 bg-accent-amber/[0.03] rounded-xl space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-accent-amber" />
                        <h3 className="font-semibold text-lg text-white">Sentinel Trusted Reseller</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-accent-amber/40 text-accent-amber">
                        TIER 2 (ELITE)
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Elite trust seal for high-volume OG account traders. Includes highlighted merchant ranking, priority escrow, and gold verification badge.
                    </p>
                    <Link href="/apply-verification" className="block pt-2">
                      <Button className="w-full bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/40 font-mono text-xs uppercase font-bold py-2.5">
                        Apply for Sentinel Trusted Reseller
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appeals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reports Against You</CardTitle>
                  <CardDescription>Manage active reports and submit appeals.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 border rounded-lg bg-green-500/10 border-green-500/20 text-center space-y-2">
                    <ShieldCheck className="w-8 h-8 text-green-500 mx-auto" />
                    <h3 className="font-medium text-green-600 dark:text-green-400">All Clear</h3>
                    <p className="text-sm text-muted-foreground">There are no active scam reports against your account.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Submitted Reports</CardTitle>
                  <CardDescription>Track the status of your scam reports.</CardDescription>
                </div>
                <Link href="/submit-report">
                  <Button size="sm">File New Report</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground space-y-4">
                <History className="w-12 h-12 mx-auto opacity-20" />
                <p>You haven't submitted any reports yet.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Profiles</CardTitle>
              <CardDescription>Resellers you have bookmarked for quick access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground space-y-4">
                <UserCircle className="w-12 h-12 mx-auto opacity-20" />
                <p>No saved profiles found.</p>
                <Link href="/resellers">
                  <Button variant="outline">Browse Directory</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </ProtectedRoute>
  );
}
