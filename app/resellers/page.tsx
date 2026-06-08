import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ResellersDirectory() {
  // Mock data for UI display until Convex is connected
  const mockResellers = [
    { id: "1", name: "Apex Trades", username: "apextrades", level: "sentinel_trusted", score: 98, reports: 0 },
    { id: "2", name: "ProGaming Accounts", username: "pro_gaming", level: "sentinel_verified", score: 85, reports: 1 },
    { id: "3", name: "Elite Sellers", username: "elitesellers", level: "none", score: 50, reports: 4 },
  ];

  return (
    <div className="container py-12 md:py-24 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Reseller Directory</h1>
          <p className="text-muted-foreground">Browse and search for trusted account resellers.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search resellers..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockResellers.map((reseller) => (
          <Card key={reseller.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{reseller.name}</CardTitle>
                  <CardDescription>@{reseller.username}</CardDescription>
                </div>
                {reseller.level === "sentinel_trusted" && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Trusted
                  </Badge>
                )}
                {reseller.level === "sentinel_verified" && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-muted-foreground">Trust Score</span>
                <span className={`font-medium ${reseller.score >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {reseller.score}/100
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2 mb-6">
                <span className="text-muted-foreground">Reports</span>
                <span className="font-medium text-destructive">{reseller.reports}</span>
              </div>
              <Link href={`/reseller/${reseller.username}`} className="w-full">
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
