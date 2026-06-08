import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MessageCircle, AtSign, Phone, Info } from "lucide-react";
import Link from "next/link";

export default function ResellerProfilePage({ params }: { params: { slug: string } }) {
  // Mock data
  const profile = {
    name: "Apex Trades",
    username: params.slug,
    bio: "Premium account reseller with 5+ years of experience in the trading community.",
    level: "sentinel_trusted",
    score: 98,
    reports: 0,
    communitySince: "2021-04-12",
  };

  return (
    <div className="container py-12 md:py-24 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{profile.name}</h1>
          <p className="text-muted-foreground text-lg">@{profile.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/file-report?reseller=${profile.username}`}>
            <Button variant="destructive" size="sm">Report Scam</Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{profile.bio}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                  <MessageCircle className="w-4 h-4 mr-2 text-blue-500" /> Telegram Verified
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                  <AtSign className="w-4 h-4 mr-2 text-pink-500" /> Instagram Verified
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                  <Phone className="w-4 h-4 mr-2 text-green-500" /> Phone Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trust Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg flex flex-col items-center justify-center bg-muted/20">
                  <span className="text-4xl font-bold text-green-500 mb-2">{profile.score}</span>
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                </div>
                <div className="p-4 border rounded-lg flex flex-col items-center justify-center bg-muted/20">
                  <span className="text-4xl font-bold text-primary mb-2">{profile.reports}</span>
                  <span className="text-sm text-muted-foreground">Scam Reports</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.level === "sentinel_trusted" && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                  <ShieldCheck className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Sentinel Trusted</h3>
                  <p className="text-xs text-muted-foreground mt-2">Identity and physical presence verified</p>
                </div>
              )}
              
              <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Community Member</span>
                  <span>Since {new Date(profile.communitySince).getFullYear()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Identity Checks</span>
                  <span className="text-green-500">Passed</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0" />
            <p>8xSentinel protects user privacy. Government IDs and physical locations are verified but never publicly disclosed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
