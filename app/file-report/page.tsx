"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldAlert, UploadCloud } from "lucide-react";

export default function FileReportPage() {
  return (
    <div className="container py-12 md:py-24 max-w-3xl mx-auto flex flex-col items-center">
      <div className="text-center space-y-4 mb-10">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="w-16 h-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Report a Scam</h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
          Help us keep the community safe. Submit detailed evidence of fraudulent activity. False reports will result in a ban.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>Provide as much accurate information as possible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resellerId">Reseller Username or ID</Label>
            <Input id="resellerId" placeholder="@username" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Primary Reason</Label>
            <select id="reason" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="">Select a reason</option>
              <option value="payment_scam">Took payment, didn't deliver account</option>
              <option value="account_recovery">Recovered account after sale</option>
              <option value="fake_identity">Impersonating a trusted seller</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the entire transaction and how the scam occurred..." 
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Evidence</Label>
            <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">Upload screenshots of chats, payment receipts, etc. (Max 5MB per file)</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button variant="destructive">Submit Report</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
