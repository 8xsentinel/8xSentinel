'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import EvidenceLink from '../../../components/ui/EvidenceLink';
import RiskBadge from '../../../components/ui/RiskBadge';
import { db } from '../../../lib/db';
import { ScamReport } from '../../../types';
import { toast } from 'sonner';
import { ArrowLeft, User, Calendar, IndianRupee, Shield, FileText, Vote, CheckCircle2, AlertOctagon } from 'lucide-react';
import Link from 'next/link';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [report, setReport] = useState<ScamReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      db.getReport(id).then((data) => {
        setReport(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleVote = async (voteType: 'upvote' | 'verify') => {
    if (!report) return;
    const user = db.getCurrentUser();
    if (!user) {
      toast.error('Authentication required. Switch test role in the header.');
      return;
    }

    const updated = await db.voteReport(report.id, voteType);
    if (updated) {
      // Re-fetch report details
      const refresh = await db.getReport(report.id);
      setReport(refresh);
      toast.success(
        voteType === 'upvote' 
          ? 'Upvoted this warning record!' 
          : 'Thank you for verifying this scam record.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex flex-col font-mono text-xs text-text-muted justify-center items-center">
        <span className="w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></span>
        <p className="mt-2 uppercase tracking-widest">Accessing File logs...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto py-20 px-4 text-center font-mono text-sm space-y-4">
          <AlertOctagon className="w-12 h-12 text-accent-red mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-text-primary">Record not found</h2>
          <p className="text-text-secondary text-xs font-sans">
            The referenced serial ID is invalid, rejected, or restricted under encryption protocols.
          </p>
          <button
            onClick={() => router.push('/search')}
            className="bg-transparent border border-border-subtle hover:border-accent-cyan/30 text-accent-cyan px-4 py-2 rounded text-xs"
          >
            &larr; Back to Search
          </button>
        </main>
        <Footer />
      </>
    );
  }

  const scammerEntityId = report.scammer_entity_id;
  const isApproved = report.status === 'approved';
  const incidentDateFormatted = new Date(report.incident_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto py-12 px-4 space-y-8 font-mono">
        {/* Navigation Link */}
        <Link 
          href="/search" 
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-accent-cyan text-xs uppercase tracking-wider transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Registry</span>
        </Link>

        {/* Header Alert Card */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] text-text-muted border border-border-subtle px-2 py-0.5 rounded font-mono font-semibold uppercase bg-bg-surface">
                ID: {report.id.toUpperCase()}
              </span>
              <RiskBadge risk={report.scammer_entity?.risk_level || 'medium'} pulse={isApproved} />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide text-text-primary">
              Threat Report Against: <span className="text-accent-red">{report.scammer_name}</span>
            </h1>
            
            <p className="text-xs text-text-secondary font-sans font-medium flex items-center gap-1">
              <span>Incident Category:</span>
              <span className="font-mono text-accent-cyan uppercase">{report.scam_type.replace(/_/g, ' ')}</span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Total Lost</span>
            <span className="text-3xl font-bold font-mono text-accent-red">
              ₹{report.amount_lost.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-text-muted">Currency: INR</span>
          </div>
        </div>

        {/* Split Layout: Details & Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Incident Description Logs</span>
              </h3>
              <p className="text-sm font-sans text-text-secondary leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {/* Evidence Card */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Evidence Reference list ({report.evidence_links.length})</span>
              </h3>
              
              {report.evidence_links.length === 0 ? (
                <p className="text-xs text-text-muted italic">No evidence link reference attached to this record.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {report.evidence_links.map((link, idx) => (
                    <EvidenceLink key={idx} evidence={link} />
                  ))}
                </div>
              )}
            </div>

            {/* Verification actions */}
            {isApproved && (
              <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 flex items-center justify-between gap-4">
                <div className="font-mono text-xs text-text-secondary space-y-0.5">
                  <p className="font-bold text-text-primary uppercase flex items-center gap-1">
                    <Vote className="w-4 h-4 text-accent-cyan" />
                    <span>Registry Verification Feed</span>
                  </p>
                  <p className="text-text-muted text-[10px] font-sans">Help corroborate this record with standard votes.</p>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleVote('upvote')}
                    className="bg-white/[0.03] border border-border-subtle hover:border-accent-cyan/30 text-text-secondary hover:text-accent-cyan px-3.5 py-2 rounded text-xs font-bold uppercase transition-all duration-150"
                  >
                    Upvote ({report.upvotes})
                  </button>
                  <button
                    onClick={() => handleVote('verify')}
                    className="bg-accent-cyan/15 border border-accent-cyan/30 hover:bg-accent-cyan hover:text-bg-void text-accent-cyan px-3.5 py-2 rounded text-xs font-bold uppercase transition-all duration-150"
                  >
                    Verify ({report.verified_by_count})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-6">
            {/* Scammer Identifiers */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Marker Identifiers
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">Telegram</span>
                  <span className="font-bold text-text-secondary">{report.telegram_username || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">WhatsApp</span>
                  <span className="font-bold text-text-secondary">{report.whatsapp_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">UPI Address</span>
                  <span className="font-bold text-text-secondary truncate block">{report.upi_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">Instagram</span>
                  <span className="font-bold text-text-secondary">{report.instagram_username || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">BGMI Character UID</span>
                  <span className="font-bold text-text-secondary">{report.bgmi_uid || 'N/A'}</span>
                </div>
              </div>

              {scammerEntityId && (
                <div className="pt-3 border-t border-border-subtle/30">
                  <Link 
                    href={`/scammer/${scammerEntityId}`}
                    className="w-full block text-center bg-accent-cyan/15 hover:bg-accent-cyan border border-accent-cyan/30 text-accent-cyan hover:text-bg-void py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
                  >
                    View Grouped Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Moderation File Stamps */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                File Details
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <div>
                    <span className="text-[9px] text-text-muted uppercase tracking-widest block">Incident Date</span>
                    <span className="font-bold text-text-secondary">{incidentDateFormatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-green" />
                  <div>
                    <span className="text-[9px] text-text-muted uppercase tracking-widest block">Moderation State</span>
                    <span className="font-bold text-text-secondary uppercase">{report.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-text-muted" />
                  <div>
                    <span className="text-[9px] text-text-muted uppercase tracking-widest block">Filed By Reporter</span>
                    <span className="font-bold text-text-secondary">{report.reporter?.display_name || 'Anonymous User'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
