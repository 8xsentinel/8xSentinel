"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VerifyIdentityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  // Placeholder for Convex query
  // const searchResults = useQuery(api.resellers.search, { term: submittedTerm });
  const searchResults: any[] = []; // Mock data for now until Convex functions are written

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedTerm(searchTerm);
  };

  return (
    <div className="container py-12 md:py-24 max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Verify Identity</h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
          Search for a reseller by Phone Number, Telegram, Instagram, or UPI ID to confirm their verification status.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lookup Directory</CardTitle>
          <CardDescription>Enter the identifier exactly as provided to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <Input
                id="search"
                placeholder="e.g. +1234567890, @username, or UPI ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          {submittedTerm && (
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-lg">Results for "{submittedTerm}"</h3>
              
              {searchResults === undefined ? (
                <p className="text-muted-foreground text-sm">Searching...</p>
              ) : searchResults.length === 0 ? (
                <div className="p-8 border rounded-lg text-center space-y-4 bg-muted/50">
                  <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No verified reseller found with this identifier.</p>
                  <p className="text-sm text-destructive font-medium">Trade with caution. This user is not verified on our platform.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((reseller) => (
                    <Card key={reseller._id}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-lg">{reseller.displayName}</p>
                          <p className="text-sm text-muted-foreground">@{reseller.username}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {reseller.verificationLevel === "sentinel_trusted" && (
                            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Sentinel Trusted
                            </Badge>
                          )}
                          {reseller.verificationLevel === "sentinel_verified" && (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                              <ShieldCheck className="w-3 h-3 mr-1" /> Sentinel Verified
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
