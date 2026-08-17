'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EvidenceLink from '../../../components/ui/EvidenceLink';
import RiskBadge from '../../../components/ui/RiskBadge';
import { db } from '../../../lib/db';
import { ScamReport } from '../../../types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  IndianRupee, 
  Shield, 
  FileText, 
  Vote, 
  CheckCircle2, 
  AlertOctagon, 
  Award, 
  Phone, 
  ExternalLink, 
  Sparkles,
  RotateCcw,
  XCircle,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../lib/firebase/AuthContext';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [report, setReport] = useState<ScamReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile: currentUser } = useAuth();

  // Withdraw state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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
    const user = currentUser;
    if (!user) {
      toast.error('Authentication required.');
      return;
    }

    const updated = await db.voteReport(report.id, voteType);
    if (updated) {
      const refresh = await db.getReport(report.id);
      setReport(refresh);
      toast.success(
        voteType === 'upvote' 
          ? 'Upvoted this warning record!' 
          : 'Thank you for verifying this scam record.'
      );
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    if (!withdrawalReason.trim()) {
      toast.error('Please state the reason for withdrawing this report.');
      return;
    }

    setIsWithdrawing(true);
    try {
      await db.withdrawReport(report.id, withdrawalReason, currentUser?.id);
      const refresh = await db.getReport(report.id);
      setReport(refresh);
      setIsWithdrawModalOpen(false);
      toast.success('Scam report successfully withdrawn.', {
        description: 'The registry threat score has been adjusted accordingly.'
      });
    } catch (err) {
      toast.error('Failed to withdraw report.');
    } finally {
      setIsWithdrawing(false);
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
      <div className="max-w-xl mx-auto py-20 px-4 text-center font-sans space-y-4">
        <AlertOctagon className="w-12 h-12 text-accent-red mx-auto" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>Record not found</h2>
        <p className="text-text-secondary text-xs font-sans">
          The referenced serial ID is invalid, rejected, or restricted under moderation protocols.
        </p>
        <button
          onClick={() => router.push('/search')}
          className="btn btn-outline py-2 px-4 text-xs"
        >
          &larr; Back to Search
        </button>
      </div>
    );
  }

  const scammerEntityId = report.scammer_entity_id;
  const isApproved = report.status === 'approved';
  const isWithdrawn = report.status === 'withdrawn';
  const isReporterOrAdmin = currentUser && (currentUser.id === report.reporter_id || currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'regional_admin');

  const incidentDateFormatted = new Date(report.incident_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 font-sans">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/search" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-cyan text-xs uppercase tracking-wider font-bold transition-colors"
          style={{ fontFamily: 'var(--font-h)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Registry</span>
        </Link>

        {/* Withdraw Option for Reporter / Admin */}
        {isReporterOrAdmin && !isWithdrawn && (
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-accent-amber text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Withdraw Report</span>
          </button>
        )}
      </div>

      {/* WITHDRAWN BANNER */}
      {isWithdrawn && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-accent-amber/40 flex items-start gap-4 animate-in fade-in">
          <RotateCcw className="w-6 h-6 text-accent-amber shrink-0 mt-0.5" />
          <div className="space-y-1 font-mono text-xs">
            <span className="font-bold text-accent-amber uppercase tracking-wider block">
              Report Status: WITHDRAWN BY REPORTER
            </span>
            <p className="text-text-secondary font-sans leading-relaxed">
              This scam report was withdrawn because the dispute has been resolved, refunded, or mutually settled.
            </p>
            {report.rejection_reason && (
              <p className="text-[11px] text-text-muted mt-1 bg-black/30 p-2 rounded-lg border border-white/5">
                <strong>Reason:</strong> {report.rejection_reason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header Alert Card */}
      <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] text-text-muted border border-border-subtle px-2 py-0.5 rounded font-mono font-semibold uppercase bg-bg-surface">
              ID: {report.id.toUpperCase()}
            </span>
            <RiskBadge risk={report.scammer_entity?.risk_level || 'medium'} pulse={isApproved} />
            {isWithdrawn && (
              <span className="text-[10px] font-mono font-bold text-accent-amber bg-accent-amber/10 border border-accent-amber/30 px-2 py-0.5 rounded uppercase">
                Withdrawn
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide text-text-primary">
            Threat Report Against: <span className="text-accent-red">{report.scammer_name}</span>
          </h1>
          
          <p className="text-xs text-text-secondary font-sans font-medium flex items-center gap-1">
            <span>Incident Category:</span>
            <span className="font-mono text-accent-cyan uppercase">{report.scam_type.replace(/_/g, ' ')}</span>
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 font-mono">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Total Lost / Impact</span>
          <span className="text-3xl font-bold text-accent-red">
            ₹{report.amount_lost.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-text-muted">Currency: INR</span>
        </div>
      </div>

      {/* Community Recovery Bounty Card */}
      {((report.additional_identifiers as any)?.recovery_bounty_percentage || report.amount_lost > 0) && !isWithdrawn && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-yellow-950/20 to-amber-950/30 border border-accent-amber/40 shadow-[0_0_40px_rgba(245,158,11,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-amber animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent-amber">
                Active Community Recovery Bounty ({((report.additional_identifiers as any)?.recovery_bounty_percentage || 20)}% Pledged)
              </span>
            </div>
            <p className="text-xs text-text-secondary font-sans leading-relaxed">
              The victim will reward <strong className="text-accent-amber">₹{((report.additional_identifiers as any)?.recovery_bounty_amount || Math.round((report.amount_lost * 0.2))).toLocaleString('en-IN')}</strong> ({((report.additional_identifiers as any)?.recovery_bounty_percentage || 20)}% of total loss) to any verified reseller, admin, or investigator who helps freeze the scammer or recover the stolen assets.
            </p>
          </div>

            {report.victim_phone_number && (
              <a
                href={`https://wa.me/${report.victim_phone_number.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20saw%20your%20fraud%20report%20on%208xSentinel%20against%20${encodeURIComponent(report.scammer_name || 'Scammer')}.%20I%20have%20information%20to%20help%20recover%20your%20funds.`}
                target="_blank"
                rel="noreferrer"
              className="shrink-0 bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/50 font-bold font-mono text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contact Victim to Help</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Split Layout: Details & Identifiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="md:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2 flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4" />
              <span>Incident Description Logs</span>
            </h3>
            <p className="text-sm font-sans text-text-secondary leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Evidence Card with Google Drive Highlight */}
          <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-4 font-mono">
            <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Evidence Reference list ({report.evidence_links?.length || 0})</span>
            </h3>
            
            {(!report.evidence_links || report.evidence_links.length === 0) ? (
              <p className="text-xs text-text-muted italic font-sans">No evidence link reference attached to this record.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.evidence_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-accent-cyan/40 rounded-xl flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate group-hover:text-accent-cyan">
                          {link.label || 'Evidence Document'}
                        </span>
                        <span className="text-[10px] text-text-muted truncate block">
                          {link.url}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-cyan shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Verification actions */}
          {isApproved && !isWithdrawn && (
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 flex items-center justify-between gap-4">
              <div className="font-mono text-xs text-text-secondary space-y-0.5">
                <p className="font-bold text-text-primary uppercase flex items-center gap-1">
                  <Vote className="w-4 h-4 text-accent-cyan" />
                  <span>Registry Verification Feed</span>
                </p>
                <p className="text-text-muted text-[10px] font-sans">Help corroborate this record with peer reseller votes.</p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => handleVote('upvote')}
                  className="bg-white/[0.03] border border-border-subtle hover:border-accent-cyan/30 text-text-secondary hover:text-accent-cyan px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 cursor-pointer font-mono"
                >
                  Upvote ({report.upvotes})
                </button>
                <button
                  onClick={() => handleVote('verify')}
                  className="bg-accent-cyan/15 border border-accent-cyan/30 hover:bg-accent-cyan hover:text-bg-void text-accent-cyan px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 cursor-pointer font-mono"
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
          <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4 font-mono">
            <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
              Marker Identifiers
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">Telegram</span>
                <span className="font-bold text-text-secondary">{report.telegram_username ? `@${report.telegram_username}` : 'N/A'}</span>
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
                <span className="font-bold text-text-secondary">{report.instagram_username ? `@${report.instagram_username}` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">BGMI Character UID</span>
                <span className="font-bold text-text-secondary">{report.bgmi_uid || 'N/A'}</span>
              </div>
              {(report.additional_identifiers as any)?.frozen_bank_name && (
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-0.5">Frozen Bank</span>
                  <span className="font-bold text-rose-400">{(report.additional_identifiers as any).frozen_bank_name}</span>
                </div>
              )}
            </div>

            {scammerEntityId && (
              <div className="pt-3 border-t border-border-subtle/30">
                <Link 
                  href={`/scammer/${scammerEntityId}`}
                  className="w-full block text-center bg-accent-cyan/15 hover:bg-accent-cyan border border-accent-cyan/30 text-accent-cyan hover:text-bg-void py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 font-mono"
                >
                  View Grouped Profile
                </Link>
              </div>
            )}
          </div>

          {/* Moderation File Stamps */}
          <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4 font-mono">
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
                <CheckCircle2 className={`w-4 h-4 ${isWithdrawn ? 'text-accent-amber' : 'text-accent-green'}`} />
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

      {/* WITHDRAW REPORT MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b101b] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.2)] font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-accent-amber font-bold text-sm">
                <RotateCcw className="w-5 h-5 text-accent-amber" />
                <span>Withdraw Scam Report</span>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-text-muted hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-text-secondary font-sans leading-relaxed">
              Withdrawing this report will mark the case as resolved, remove its active threat score penalty from the scammer registry, and close the recovery bounty.
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-text-secondary uppercase tracking-widest block font-mono">
                  Reason for Withdrawal *
                </label>
                <textarea
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="e.g. The scammer reached out and refunded the full amount of ₹15,000 / Dispute was resolved via escrow."
                  className="w-full h-28 bg-bg-surface border border-border-subtle focus:border-accent-amber focus:outline-none rounded-xl p-3 text-xs text-white font-sans leading-normal resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="btn btn-ghost py-2 px-4 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || !withdrawalReason.trim()}
                  className="py-2.5 px-5 bg-accent-amber hover:bg-accent-amber/90 text-bg-void font-bold rounded-xl text-xs uppercase transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer font-mono"
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
