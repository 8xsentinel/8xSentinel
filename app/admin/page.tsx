"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Users, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser();

  // Mock role logic until Convex syncing is implemented
  const userRole: "community_admin" | "chief_admin" | "customer" = (user?.publicMetadata?.role as any) || "chief_admin";

  if (!isLoaded) {
    return <div className="container py-24 text-center">Loading admin dashboard...</div>;
  }

  if (userRole !== "community_admin" && userRole !== "chief_admin") {
    return (
      <div className="container py-24 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view the admin area.</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Manage verifications, reports, and system settings.</p>
        </div>
        <Badge variant="destructive" className="px-4 py-1 uppercase tracking-wider">
          {userRole.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Scam Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">5</div>
            <p className="text-xs text-muted-foreground">Requires immediate review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Resellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+18 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">100%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verifications" className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="verifications" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
            Verification Queue
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
            Reports Queue
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
            User Management
          </TabsTrigger>
          {userRole === "chief_admin" && (
            <TabsTrigger value="audit" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3">
              Audit Logs
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="verifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Queue</CardTitle>
              <CardDescription>Review and approve identity verification applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Connect Convex backend to load pending verifications.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports Queue</CardTitle>
              <CardDescription>Review incoming scam reports and evidence.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Connect Convex backend to load pending reports.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users, roles, and platform access.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                <Users className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">User table will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {userRole === "chief_admin" && (
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>Track administrative actions across the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 border border-dashed rounded-lg text-center space-y-4">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Audit logs are empty.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
}
