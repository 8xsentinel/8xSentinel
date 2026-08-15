"use client";

import { useAuth } from "@/lib/firebase/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, UserCircle, History, UploadCloud, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const userRole: "customer" | "reseller" = "reseller"; 

  if (loading) {
    return <div className="container py-24 text-center font-sans">Loading dashboard...</div>;
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || "Operator";

  return (
    <div className="container py-12 max-w-6xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-h)' }}>Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {displayName}.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 uppercase tracking-wider">
          {userRole} Account
        </Badge>
      </div>

      <Tabs defaultValue={userRole === "reseller" ? "profile" : "reports"} className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          {userRole === "reseller" && (
            <>
              <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                My Profile
              </TabsTrigger>
              <TabsTrigger value="verification" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                Verification Status
              </TabsTrigger>
              <TabsTrigger value="appeals" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
                Appeals & Reports
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="reports" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
            My Submitted Reports
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
            Saved Profiles
          </TabsTrigger>
        </TabsList>

        {userRole === "reseller" && (
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
                  <CardTitle>Verification Badges</CardTitle>
                  <CardDescription>Apply for trust badges to increase your credibility.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 border rounded-lg space-y-4 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-6 h-6 text-blue-500" />
                      <h3 className="font-semibold text-lg">Sentinel Verified</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Requires phone, telegram, instagram, and UPI verification.</p>
                    <Button className="w-full">Apply Now</Button>
                  </div>
                  
                  <div className="p-6 border rounded-lg space-y-4 relative overflow-hidden bg-muted/30 opacity-70">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-6 h-6 text-yellow-500" />
                      <h3 className="font-semibold text-lg">Sentinel Trusted</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Requires Sentinel Verified + Govt ID and Location Verification.</p>
                    <Button variant="outline" className="w-full" disabled>Requires Sentinel Verified</Button>
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
                <Link href="/file-report">
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
  );
}
