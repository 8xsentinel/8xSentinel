'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import RiskBadge from '../../../components/ui/RiskBadge';
import TrustScoreRing from '../../../components/ui/TrustScoreRing';
import EvidenceLink from '../../../components/ui/EvidenceLink';
import { db } from '../../../lib/db';
import { ScammerEntity, ScamReport } from '../../../types';
import { AlertCircle, IndianRupee, Calendar, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function ScammerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const entityId = params.entityId as string;

  const [entity, setEntity] = useState<ScammerEntity | null>(null);
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (entityId) {
      db.getScammerEntity(entityId).then((data) => {
        if (data) {
          setEntity(data.entity);
          setReports(data.reports);
        }
        setLoading(false);
      });
    }
  }, [entityId]);

  const toggleExpand = (reportId: string) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex flex-col font-mono text-xs text-text-muted justify-center items-center">
        <span className="w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></span>
        <p className="mt-2 uppercase tracking-widest">Opening File Profile...</p>
      </div>
    );
  }

  if (!entity) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto py-20 px-4 text-center font-mono text-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-accent-red mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-text-primary">Profile Not Found</h2>
          <p className="text-text-secondary text-xs font-sans">
            The requested scammer entity code is unregistered or under moderation clearance.
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

  const getRiskBannerClass = () => {
    switch (entity.risk_level) {
      case 'confirmed': return 'bg-accent-red';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-accent-amber';
      case 'low': return 'bg-lime-500';
      default: return 'bg-accent-cyan';
    }
  };

  const bannerClass = getRiskBannerClass();
  const knownIds = entity.known_identifiers || {};

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto py-12 px-4 space-y-8 font-mono">
        
        {/* Risk Banner Alert */}
        <div className={`w-full py-2 px-4 rounded text-center text-xs font-bold uppercase tracking-widest text-bg-void ${bannerClass}`}>
          ⚠️ Blacklist File Status: {entity.risk_level} threat level · Extreme Precaution Advised
        </div>

        {/* Identity Panel & Risk Ring split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Canonical metadata profile */}
          <div className="md:col-span-2 backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <RiskBadge risk={entity.risk_level} />
              <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
                {entity.canonical_name}
              </h1>
              <p className="text-xs text-text-muted">
                Grouped Entity ID: {entity.id.toUpperCase()}
              </p>
            </div>

            {/* Identifiers list grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-accent-cyan tracking-wider border-b border-border-subtle/30 pb-1.5">
                Known Account Markers
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-1">Telegram Handles</span>
                  <div className="space-y-1">
                    {knownIds.telegram && knownIds.telegram.length > 0 ? (
                      knownIds.telegram.map(tg => <span key={tg} className="block text-text-secondary font-bold">@{tg}</span>)
                    ) : (
                      <span className="text-text-muted italic">N/A</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-1">WhatsApp Numbers</span>
                  <div className="space-y-1">
                    {knownIds.whatsapp && knownIds.whatsapp.length > 0 ? (
                      knownIds.whatsapp.map(wa => <span key={wa} className="block text-text-secondary font-bold">{wa}</span>)
                    ) : (
                      <span className="text-text-muted italic">N/A</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-1">UPI Addresses</span>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    {knownIds.upi && knownIds.upi.length > 0 ? (
                      knownIds.upi.map(upi => <span key={upi} className="block text-text-secondary font-bold truncate">{upi}</span>)
                    ) : (
                      <span className="text-text-muted italic">N/A</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-1">Instagram Names</span>
                  <div className="space-y-1">
                    {knownIds.instagram && knownIds.instagram.length > 0 ? (
                      knownIds.instagram.map(ig => <span key={ig} className="block text-text-secondary font-bold">@{ig}</span>)
                    ) : (
                      <span className="text-text-muted italic">N/A</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest block mb-1">BGMI Character UIDs</span>
                  <div className="space-y-1">
                    {knownIds.bgmi_uid && knownIds.bgmi_uid.length > 0 ? (
                      knownIds.bgmi_uid.map(uid => <span key={uid} className="block text-text-secondary font-bold">{uid}</span>)
                    ) : (
                      <span className="text-text-muted italic">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {entity.admin_notes && (
              <div className="p-4 rounded border border-border-subtle bg-white/[0.01] text-xs text-text-secondary font-sans leading-normal">
                <strong className="font-mono text-[9px] uppercase tracking-wider text-accent-cyan block mb-1">Sentinel Investigator Notes:</strong>
                {entity.admin_notes}
              </div>
            )}
          </div>

          {/* Risk gauge and sidebar stats */}
          <div className="space-y-6">
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 flex flex-col items-center text-center space-y-4">
              <TrustScoreRing score={entity.trust_score} size={110} type="scammer" />
              
              <div className="space-y-1 font-mono">
                <h4 className="text-text-muted text-xs uppercase tracking-widest">Risk Factor Score</h4>
                <p className="text-[10px] text-text-secondary leading-normal font-sans px-4">
                  Calculated from report density, total ₹ stolen, and community validations. (Lower = More Dangerous).
                </p>
              </div>
            </div>

            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 text-xs space-y-4">
              <h4 className="text-text-primary font-bold uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Incident Summary stats
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Stolen:</span>
                  <span className="font-bold text-accent-red">₹{entity.total_amount_lost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Reports Linked:</span>
                  <span className="font-bold text-text-primary">{entity.report_count} files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">First Activity:</span>
                  <span className="font-bold text-text-primary">
                    {entity.first_reported_at ? new Date(entity.first_reported_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Last Activity:</span>
                  <span className="font-bold text-text-primary">
                    {entity.last_reported_at ? new Date(entity.last_reported_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle/30">
                <Link
                  href={`/submit-report?name=${encodeURIComponent(entity.canonical_name)}`}
                  className="w-full text-center block bg-accent-red/10 border border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-bg-void py-2.5 rounded font-bold uppercase tracking-wider text-[10px] transition-all"
                >
                  ➕ I was also scammed by them
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline of linked reports */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display uppercase tracking-widest text-text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-amber animate-pulse" />
            <span>Incident File Records ({reports.length})</span>
          </h2>

          <div className="space-y-4">
            {reports.map((report, idx) => {
              const isExpanded = !!expandedReports[report.id];
              return (
                <div 
                  key={report.id}
                  className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4"
                >
                  {/* Timeline Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/20 pb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded font-mono font-bold text-text-secondary">
                        FILE #{idx + 1}
                      </span>
                      <span className="text-text-muted font-sans font-medium">
                        Inc Date: {new Date(report.incident_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="font-bold text-accent-red">₹{report.amount_lost.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => toggleExpand(report.id)}
                        className="text-accent-cyan hover:text-accent-cyan/85 font-mono text-[10px] uppercase font-bold flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <EyeOff className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Expand details</span>
                            <Eye className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-2">
                    <p className="text-xs text-text-secondary font-mono">
                      <strong className="text-text-muted">Type: </strong>{report.scam_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    
                    {/* Collapsed Snippet or Full Text */}
                    <p className="text-sm font-sans text-text-secondary leading-relaxed">
                      {isExpanded 
                        ? report.description 
                        : `${report.description.slice(0, 140)}...`}
                    </p>
                  </div>

                  {/* Expanded evidence references */}
                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-border-subtle/20">
                      <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Evidence Reference References:</span>
                      {report.evidence_links.length === 0 ? (
                        <p className="text-xs text-text-muted italic">No proof link reference attached.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2.5">
                          {report.evidence_links.map((link, lIdx) => (
                            <EvidenceLink key={lIdx} evidence={link} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
