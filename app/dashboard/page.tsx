"use client";

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
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StoreOnboardingModal from "@/components/auth/StoreOnboardingModal";
import MemberOnboardingModal from "@/components/auth/MemberOnboardingModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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

  if (loading || !user || isAdmin) {
    return <div className="container py-24 text-center font-sans">Loading dashboard...</div>;
  }

  const displayName = profile?.display_name || profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Member";
  const contactPhone = profile?.whatsapp_username || "Not set";

  return (
    <ProtectedRoute>
      <div className="container py-12 max-w-6xl mx-auto space-y-8 font-sans">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge badge-cyan">
                {isVerifiedReseller ? "RESELLER PORTAL" : "MEMBER HUB"}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-h)' }}>
              {isVerifiedReseller ? "Store Operations Deck" : "Sentinel Member Hub"}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Welcome, <span className="text-white font-bold">{displayName}</span>. Manage your filed scam reports, dispute resolutions, and identity details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {profile?.state && (
              <Badge className="bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30 px-3 py-1 font-mono text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.state}</span>
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className={`px-4 py-1 uppercase tracking-wider font-mono text-xs ${
                isVerifiedReseller 
                  ? "text-accent-amber border-accent-amber/50 bg-accent-amber/10" 
                  : "text-accent-cyan border-accent-cyan/50 bg-accent-cyan/10"
              }`}
            >
              {isVerifiedReseller ? "🛡️ Verified Reseller" : "🛡️ Sentinel Member"}
            </Badge>
          </div>
        </div>

        {/* Dynamic Role Tabs */}
        <Tabs defaultValue="reports" className="w-full space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto hide-scrollbar snap-x whitespace-nowrap">
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan rounded-none px-4 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold"
            >
              My Submitted Reports ({userReports.length})
            </TabsTrigger>

            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan rounded-none px-4 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold"
            >
              {isVerifiedReseller ? "Store Dossier" : "Member Identity"}
            </TabsTrigger>

            {isVerifiedReseller && (
              <>
                <TabsTrigger 
                  value="verification" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan rounded-none px-4 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold"
                >
                  Verification Status
                </TabsTrigger>
                <TabsTrigger 
                  value="appeals" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-accent-cyan rounded-none px-4 py-3 shrink-0 snap-start text-xs uppercase font-mono font-bold"
                >
                  Appeals & Inquiries
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* 1. Reports Tab (Accessible by both Members and Resellers) */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="glass-panel border-white/10">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white text-lg uppercase font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                      My Filed Incident Reports
                    </CardTitle>
                    <CardDescription className="text-xs text-text-secondary">
                      Track the verification status, assigned evidence, and recovery bounty progress of your scam filings.
                    </CardDescription>
                  </div>
                  <Link href="/submit-report">
                    <Button size="sm" className="btn btn-red text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>File New Scam Report</span>
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent>
                {loadingReports ? (
                  <div className="p-8 text-center text-xs font-mono text-text-muted">Loading filed incident records...</div>
                ) : userReports.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground space-y-4">
                    <History className="w-12 h-12 mx-auto opacity-20 text-accent-cyan" />
                    <p className="text-xs font-mono">You have not submitted any scam incident reports yet.</p>
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
                              Type: <span className="text-white capitalize">{rep.scam_type?.replace(/_/g, ' ')}</span> &bull; Amount: <span className="text-accent-red font-bold">₹{rep.amount_lost?.toLocaleString('en-IN')}</span>
                            </p>
                            <span className="text-[10px] text-text-muted block">
                              Filed on: {new Date(rep.created_at || rep.incident_date).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Link href={`/report/${rep.id}`}>
                              <Button variant="outline" size="sm" className="text-xs font-mono">
                                View File &rarr;
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

          {/* 2. Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {isVerifiedReseller ? (
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="text-white uppercase font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                    Store Dossier Management
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update your public verified reseller credentials and trading channels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingStore ? (
                    <div className="p-8 text-center text-muted-foreground text-xs font-mono">Loading store profile...</div>
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
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">WhatsApp Contact</p>
                          <p className="font-medium text-emerald-400 font-mono">{storeData.whatsapp_number || storeData.whatsappNumber || 'N/A'}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-mono">Store Bio</p>
                          <p className="text-text-secondary text-xs leading-relaxed">{storeData.bio || 'No bio provided'}</p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" className="w-full text-xs font-mono uppercase" onClick={() => setIsEditingProfile(true)}>
                          Edit Store Dossier
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              /* Member Profile Card */
              <Card className="glass-panel border-white/10">
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

          {/* 3. Verification Tab (Resellers only) */}
          {isVerifiedReseller && (
            <TabsContent value="verification" className="space-y-6">
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="text-white uppercase font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                    Reseller Verification Tiers
                  </CardTitle>
                  <CardDescription className="text-xs">
                    View your credentials and apply for elite distinction badges.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 border border-accent-cyan/40 bg-accent-cyan/[0.03] rounded-xl space-y-4">
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
                      Your identity and store handles have been verified by your State Regional Admin or Root Admin.
                    </p>
                  </div>
                  
                  <div className="p-6 border border-accent-amber/40 bg-accent-amber/[0.03] rounded-xl space-y-4">
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
                      Elite trust seal for high-volume BGMI account traders with priority escrow.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 4. Appeals Tab (Resellers only) */}
          {isVerifiedReseller && (
            <TabsContent value="appeals" className="space-y-6">
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="text-white uppercase font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                    Disputes & Clearance Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-8 border border-white/10 rounded-xl bg-emerald-500/[0.03] text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h3 className="font-bold text-white text-sm">Clean Clearance Record</h3>
                    <p className="text-xs text-text-secondary">Zero active scam disputes or customer claims registered against your store.</p>
                  </div>
                </CardContent>
              </Card>
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
