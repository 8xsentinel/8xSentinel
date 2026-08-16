"use client";

import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, UserCircle, History, UploadCloud, AlertCircle, Crown, MapPin } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoreOnboardingModal from "@/components/auth/StoreOnboardingModal";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const { user, profile, isSuperAdmin, loading } = useAuth();
  const router = useRouter();

  const isAdmin = isSuperAdmin || profile?.role === "regional_admin" || profile?.role === "admin";
  const [storeData, setStoreData] = useState<any>(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (isAdmin) {
        router.push("/admin");
      } else if (profile?.id) {
        setLoadingStore(true);
        db.getUserStoreApplication(profile.id).then((res) => {
          setStoreData(res);
          setLoadingStore(false);
        });

        setLoadingReports(true);
        db.getUserReports(profile.id).then((res) => {
          setUserReports(res || []);
          setLoadingReports(false);
        });
      }
    }
  }, [loading, user, isAdmin, router, profile?.id]);

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
                  {loadingStore ? (
                    <div className="p-8 text-center text-muted-foreground">Loading profile...</div>
                  ) : storeData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">Store Name</p>
                          <p className="font-bold text-white text-base">{storeData.store_name || storeData.storeName || "N/A"}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">Operating Network</p>
                          <p className="font-medium text-accent-cyan capitalize">
                            {(storeData.primary_platform || storeData.primaryPlatform || 'whatsapp_primary').replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">Telegram Handle</p>
                          <p className="font-medium text-sky-400 font-mono">
                            {storeData.telegram_username || storeData.telegramUsername ? `@${(storeData.telegram_username || storeData.telegramUsername).replace('@', '')}` : 'N/A'}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">WhatsApp Number</p>
                          <p className="font-medium text-emerald-400 font-mono">{storeData.whatsapp_number || storeData.whatsappNumber || 'N/A'}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">Store Description / Bio</p>
                          <p className="text-text-secondary text-xs leading-relaxed">{storeData.bio || 'No bio provided'}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1.5 font-mono">Trading Specialties</p>
                          <div className="flex flex-wrap gap-2">
                            {(storeData.specializes_in || storeData.specializesIn || [])?.map((spec: string) => (
                              <Badge key={spec} variant="outline" className="text-[10px] uppercase font-mono border-white/15 text-text-secondary">
                                {spec.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="w-full text-xs font-mono uppercase" onClick={() => setIsEditingProfile(true)}>
                          Edit Profile Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                      <UserCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">No profile configured yet.</p>
                      <Button>Create Reseller Profile</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reseller Verification Tiers</CardTitle>
                  <CardDescription>View your current credentials and apply for elite trust badges.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  {/* Sentinel Verified */}
                  <div className="p-6 border border-accent-cyan/40 bg-accent-cyan/[0.03] rounded-xl space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-accent-cyan" />
                        <h3 className="font-semibold text-lg text-white">Sentinel Verified</h3>
                      </div>
                      <Badge className="bg-accent-green/20 text-accent-green border-accent-green/40 text-[10px] uppercase font-mono">
                        ACTIVE
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Your identity and store handles have been verified by your State Regional Admin or Root Admin. You hold verified BGMI reseller standing in the registry.
                    </p>
                    <div className="text-[11px] text-accent-green font-mono flex items-center gap-1.5 pt-2 border-t border-white/5">
                      <span>✓ State Operating Clearance Granted</span>
                    </div>
                  </div>
                  
                  {/* Sentinel Trusted Reseller */}
                  <div className="p-6 border border-accent-amber/40 bg-accent-amber/[0.03] rounded-xl space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-accent-amber" />
                        <h3 className="font-semibold text-lg text-white">Sentinel Trusted</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono border-accent-amber/40 text-accent-amber">
                        ELITE DISTINCTION
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Elite trust seal for high-volume BGMI account traders. Includes highlighted reseller ranking, priority escrow, and gold verification badge.
                    </p>
                    
                    {(storeData?.tier2_status === 'pending' || storeData?.tier2Status === 'pending') ? (
                      <div className="pt-2">
                        <Badge className="w-full justify-center bg-accent-amber/10 text-accent-amber border-accent-amber/30 py-2 uppercase tracking-widest text-[10px]">
                          Sentinel Trusted Application Under Review
                        </Badge>
                      </div>
                    ) : (storeData?.tier2_status === 'approved' || storeData?.tier2Status === 'approved') ? (
                      <div className="pt-2">
                        <Badge className="w-full justify-center bg-accent-green/10 text-accent-green border-accent-green/30 py-2 uppercase tracking-widest text-[10px]">
                          Sentinel Trusted Approved (Active)
                        </Badge>
                      </div>
                    ) : (
                      <Link href="/apply-verification" className="block pt-2">
                        <Button className="w-full bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/40 font-mono text-xs uppercase font-bold py-2.5">
                          Apply for Sentinel Trusted Reseller
                        </Button>
                      </Link>
                    )}
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
                  <CardDescription>Track the status, recovery bounties, and withdraw reports once resolved.</CardDescription>
                </div>
                <Link href="/submit-report">
                  <Button size="sm" className="bg-accent-red hover:bg-accent-red/90 text-white font-mono text-xs uppercase font-bold">
                    File New Report
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="p-8 text-center text-xs font-mono text-text-muted">Loading your submitted threat records...</div>
              ) : userReports.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground space-y-4">
                  <History className="w-12 h-12 mx-auto opacity-20" />
                  <p>You haven't submitted any reports yet.</p>
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  {userReports.map((rep) => {
                    const statusColor = 
                      rep.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      rep.status === 'withdrawn' ? 'bg-amber-500/10 text-accent-amber border-accent-amber/30' :
                      rep.status === 'rejected' ? 'bg-red-500/10 text-accent-red border-red-500/30' :
                      'bg-sky-500/10 text-sky-400 border-sky-500/30';

                    return (
                      <div 
                        key={rep.id} 
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-accent-cyan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white font-sans">{rep.scammer_name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${statusColor}`}>
                              {rep.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">
                            Category: <span className="text-white capitalize">{rep.scam_type?.replace(/_/g, ' ')}</span> &bull; Loss: <span className="text-accent-red font-bold">₹{rep.amount_lost?.toLocaleString('en-IN')}</span>
                          </p>
                          <span className="text-[10px] text-text-muted block">
                            Filed on: {new Date(rep.created_at || rep.incident_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Link href={`/report/${rep.id}`}>
                            <Button variant="outline" size="sm" className="text-xs font-mono">
                              View File
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
    </div>
  </ProtectedRoute>
  );
}
