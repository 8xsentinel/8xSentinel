import { ShieldCheck, Users, ShieldAlert } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-24 max-w-4xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About 8xSentinel</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The definitive trust infrastructure for the account trading ecosystem.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-lg leading-relaxed">
          The account trading community has historically been plagued by bad actors, impersonators, and scammers. 
          <strong>8xSentinel</strong> was built to solve this. We are a community-driven trust and verification platform that provides a central registry of trusted resellers and known scammers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pt-8 border-t">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Verification System</h3>
          <p className="text-muted-foreground">Our rigorous KYC process ensures that sellers are who they claim to be, tying their digital identity to real-world credentials.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold">Scam Protection</h3>
          <p className="text-muted-foreground">A centralized database of reported scams allows buyers to verify a seller's history before initiating a transaction.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold">Community Moderation</h3>
          <p className="text-muted-foreground">Reports and verification applications are reviewed by trusted community administrators to ensure fairness and accuracy.</p>
        </div>
      </div>
    </div>
  );
}
