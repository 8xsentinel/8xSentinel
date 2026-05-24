'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { db } from '../../lib/db';
import { ScamReport, TrustedReseller, Profile } from '../../types';
import { toast } from 'sonner';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle, 
  ArrowRightLeft, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [pendingReports, setPendingReports] = useState<ScamReport[]>([]);
  const [pendingResellers, setPendingResellers] = useState<TrustedReseller[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'resellers'>('reports');
  const [expandedReports, setExpandedReports] = useState<Record<string, boolean>>({});
  
  // Rejection feedback input states
  const [rejectionReasonReport, setRejectionReasonReport] = useState<Record<string, string>>({});
  const [rejectionReasonReseller, setRejectionReasonReseller] = useState<Record<string, string>>({});
  const [showRejectInputReport, setShowRejectInputReport] = useState<Record<string, boolean>>({});
  const [showRejectInputReseller, setShowRejectInputReseller] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      const statsData = await db.getPlatformStats();
      const reportsData = await db.getPendingReports();
      const resellersData = await db.getPendingResellers();
      setStats(statsData);
      setPendingReports(reportsData);
      setPendingResellers(resellersData);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (role: 'user' | 'moderator' | 'admin') => {
    db.setCurrentUser(role);
    toast.success(`Role switched to ${role.toUpperCase()}`);
    await loadData();
  };

  const handleApproveReport = async (reportId: string) => {
    const res = await db.moderateReport(reportId, 'approved');
    if (res) {
      toast.success('Dispute report successfully approved and cataloged.');
      await loadData();
    } else {
      toast.error('Action failed.');
    }
  };

  const handleRejectReport = async (reportId: string) => {
    const reason = rejectionReasonReport[reportId]?.trim() || 'Insufficient evidence matching guidelines.';
    const res = await db.moderateReport(reportId, 'rejected', reason);
    if (res) {
      toast.success('Dispute report rejected.');
      // Reset inputs
      setRejectionReasonReport(prev => ({ ...prev, [reportId]: '' }));
      setShowRejectInputReport(prev => ({ ...prev, [reportId]: false }));
      await loadData();
    } else {
      toast.error('Action failed.');
    }
  };

  const handleApproveReseller = async (resellerId: string) => {
    const res = await db.moderateReseller(resellerId, 'approved');
    if (res) {
      toast.success('Reseller application approved and badge granted.');
      await loadData();
    } else {
      toast.error('Action failed.');
    }
  };

  const handleRejectReseller = async (resellerId: string) => {
    const reason = rejectionReasonReseller[resellerId]?.trim() || 'Store does not meet standard transaction history requirements.';
    const res = await db.moderateReseller(resellerId, 'rejected', reason);
    if (res) {
      toast.success('Reseller application rejected.');
      // Reset inputs
      setRejectionReasonReseller(prev => ({ ...prev, [resellerId]: '' }));
      setShowRejectInputReseller(prev => ({ ...prev, [resellerId]: false }));
      await loadData();
    } else {
      toast.error('Action failed.');
    }
  };

  const toggleReportExpand = (reportId: string) => {
    setExpandedReports(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto py-20 px-4 text-center font-mono text-xs space-y-4">
          <AlertCircle className="w-12 h-12 text-accent-red mx-auto animate-pulse" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-text-primary">Terminal Session Required</h2>
          <p className="text-text-secondary font-sans">
            Please log in or switch to an authorized administrative role using the dropdown selector in the navigation bar.
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <button
              onClick={() => handleRoleChange('admin')}
              className="bg-accent-purple/15 border border-accent-purple/30 text-accent-purple px-4 py-2 rounded text-xs uppercase font-bold"
            >
              Set Admin Role
            </button>
            <button
              onClick={() => handleRoleChange('moderator')}
              className="bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan px-4 py-2 rounded text-xs uppercase font-bold"
            >
              Set Moderator Role
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthorized) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto py-20 px-4 text-center font-mono text-xs space-y-6">
          <div className="border border-accent-red/20 bg-accent-red/5 p-6 rounded-lg space-y-4">
            <AlertCircle className="w-12 h-12 text-accent-red mx-auto" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-accent-red">Security Alert: Access Denied</h2>
            <p className="text-text-secondary font-sans leading-relaxed">
              Your profile (<span className="text-text-primary font-bold">@{currentUser.username}</span>) has insufficient clearance level. Access to the security logs queue is restricted to moderators and admins.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-text-muted">Quick override for evaluation / testing purposes:</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleRoleChange('admin')}
                className="bg-accent-purple/15 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple hover:text-bg-void px-4 py-2 rounded text-[10px] uppercase font-bold transition-all"
              >
                Switch to Admin
              </button>
              <button
                onClick={() => handleRoleChange('moderator')}
                className="bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan hover:text-bg-void px-4 py-2 rounded text-[10px] uppercase font-bold transition-all"
              >
                Switch to Moderator
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Render Stats details if loaded
  const statsCounters = stats?.counters || { totalReports: 0, totalScammers: 0, totalProtected: 0, verifiedSellers: 0 };
  const statsQueues = stats?.queues || { pendingReportsCount: 0, pendingResellersCount: 0 };

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 font-mono text-xs">
        
        {/* Terminal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border-subtle/50 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent-purple" />
              <span className="text-accent-purple uppercase tracking-widest font-bold">Security Operation Core</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
              Control Terminal Dashboard
            </h1>
            <p className="text-text-secondary font-sans">
              Logged in as: <strong className="text-accent-purple uppercase font-mono">{currentUser.role}</strong> ({currentUser.display_name || currentUser.username})
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRoleChange('user')}
              className="flex items-center gap-1 bg-white/[0.02] border border-border-subtle hover:border-accent-green/20 text-text-secondary px-3 py-1.5 rounded transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Demote Session</span>
            </button>
          </div>
        </div>

        {/* Analytics Counter strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-5 space-y-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Approved Warnings</span>
            <span className="text-2xl font-bold text-text-primary">{statsCounters.totalReports}</span>
            <p className="text-[9px] text-text-muted">Total active logs</p>
          </div>
          <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-5 space-y-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Blacklisted Targets</span>
            <span className="text-2xl font-bold text-accent-red">{statsCounters.totalScammers}</span>
            <p className="text-[9px] text-text-muted">Grouped scam entities</p>
          </div>
          <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-5 space-y-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Verified Resellers</span>
            <span className="text-2xl font-bold text-accent-green">{statsCounters.verifiedSellers}</span>
            <p className="text-[9px] text-text-muted">Active store certificates</p>
          </div>
          <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-5 space-y-1">
            <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Loss Prevented Est.</span>
            <span className="text-2xl font-bold text-accent-cyan">₹{statsCounters.totalProtected.toLocaleString('en-IN')}</span>
            <p className="text-[9px] text-text-muted">Stolen value cataloged</p>
          </div>
        </div>

        {/* Analytics charts section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scam types breakdown chart */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4 md:col-span-2">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Dispute Incident Categories
              </h3>
              
              <div className="space-y-3 font-sans">
                {Object.entries(stats.scamTypesCount || {}).map(([type, count]: any) => {
                  const pct = Math.max(8, Math.round((count / (statsCounters.totalReports || 1)) * 100));
                  const displayType = type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-secondary font-bold">{displayType}</span>
                        <span className="text-text-muted font-bold">{count} reports ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/[0.02] border border-border-subtle h-2 rounded overflow-hidden">
                        <div 
                          className="bg-accent-purple h-full rounded transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(stats.scamTypesCount || {}).length === 0 && (
                  <p className="text-text-muted italic text-center py-4">No categories logged yet.</p>
                )}
              </div>
            </div>

            {/* Moderation Queues state summary */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Clearance Queue Load
              </h3>

              <div className="space-y-4 font-sans">
                <div 
                  onClick={() => setActiveTab('reports')} 
                  className={`p-3 rounded border cursor-pointer transition-all ${activeTab === 'reports' ? 'bg-accent-purple/5 border-accent-purple/35' : 'border-border-subtle bg-white/[0.01] hover:border-border-subtle/80'}`}
                >
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-text-primary">DISPUTES QUEUE</span>
                    <span className="px-2 py-0.5 rounded bg-accent-red/10 text-accent-red font-bold text-[10px]">
                      {pendingReports.length} pending
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">
                    Requires verification of chat screenshots and transactional proof URL links.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('resellers')} 
                  className={`p-3 rounded border cursor-pointer transition-all ${activeTab === 'resellers' ? 'bg-accent-cyan/5 border-accent-cyan/35' : 'border-border-subtle bg-white/[0.01] hover:border-border-subtle/80'}`}
                >
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-text-primary">RESELLERS QUEUE</span>
                    <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan font-bold text-[10px]">
                      {pendingResellers.length} pending
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-normal">
                    Verify trader references, channel sizes, and reputation points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-border-subtle/50 pb-3">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all border ${activeTab === 'reports' ? 'border-accent-purple text-accent-purple bg-accent-purple/5' : 'border-border-subtle text-text-secondary hover:text-text-primary bg-transparent'}`}
          >
            Dispute Reports Queue ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('resellers')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all border ${activeTab === 'resellers' ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5' : 'border-border-subtle text-text-secondary hover:text-text-primary bg-transparent'}`}
          >
            Reseller Applications ({pendingResellers.length})
          </button>
        </div>

        {/* QUEUE 1: Scam Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-12 text-center text-text-muted">
                <CheckCircle2 className="w-8 h-8 mx-auto text-accent-green/60 mb-2" />
                <p className="text-sm font-sans font-medium text-text-secondary">Dispute Queue Clean</p>
                <p className="text-xs mt-1">All filed warnings have been successfully moderated.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReports.map((report, idx) => {
                  const isExpanded = !!expandedReports[report.id];
                  const isRejecting = !!showRejectInputReport[report.id];

                  return (
                    <div 
                      key={report.id}
                      className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4"
                    >
                      {/* Queue Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/20 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded font-bold text-text-secondary">
                              QUEUE FILE #{idx + 1}
                            </span>
                            <span className="text-accent-red font-bold">₹{report.amount_lost.toLocaleString('en-IN')} Stolen</span>
                          </div>
                          <p className="text-[10px] text-text-muted">
                            Incident Date: {report.incident_date} · Scam Type: <span className="uppercase text-text-secondary">{report.scam_type.replace(/_/g, ' ')}</span>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleReportExpand(report.id)}
                            className="bg-white/[0.03] border border-border-subtle hover:border-accent-cyan/30 text-text-secondary hover:text-text-primary px-3 py-1.5 rounded transition-all"
                          >
                            {isExpanded ? 'Hide Details' : 'Inspect File Logs'}
                          </button>
                        </div>
                      </div>

                      {/* Snippet / Expanded Content */}
                      <div className="space-y-2">
                        <p className="text-text-primary text-xs">
                          <strong className="text-text-muted">Target Name:</strong> {report.scammer_name}
                        </p>
                        <p className="text-text-secondary font-sans leading-relaxed">
                          {isExpanded ? report.description : `${report.description.slice(0, 150)}...`}
                        </p>
                      </div>

                      {/* Expanded Section Details */}
                      {isExpanded && (
                        <div className="space-y-4 pt-4 border-t border-border-subtle/20">
                          
                          {/* Identifiers Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white/[0.01] border border-border-subtle p-4 rounded-lg">
                            <div>
                              <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-0.5">Telegram</span>
                              <span className="font-bold text-text-secondary">{report.telegram_username ? `@${report.telegram_username}` : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-0.5">WhatsApp</span>
                              <span className="font-bold text-text-secondary">{report.whatsapp_number || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-0.5">UPI ID</span>
                              <span className="font-bold text-text-secondary truncate block">{report.upi_id || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-0.5">Instagram</span>
                              <span className="font-bold text-text-secondary">{report.instagram_username ? `@${report.instagram_username}` : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-0.5">BGMI UID</span>
                              <span className="font-bold text-text-secondary">{report.bgmi_uid || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-text-muted uppercase tracking-widest block mb-0.5">Reporter</span>
                              <span className="font-bold text-text-secondary">{report.reporter?.display_name || 'Anonymous User'}</span>
                            </div>
                          </div>

                          {/* Evidence Links */}
                          <div className="space-y-2">
                            <span className="text-[9px] text-text-muted uppercase tracking-widest block font-bold">Evidence URL Proof links:</span>
                            {report.evidence_links.length === 0 ? (
                              <p className="text-text-muted italic">No evidence links attached.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {report.evidence_links.map((link, lIdx) => (
                                  <a
                                    key={lIdx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 rounded border border-border-subtle bg-white/[0.01] hover:border-accent-cyan/30 text-accent-cyan flex items-center gap-1"
                                  >
                                    <span className="font-bold">{link.label}</span>
                                    <span className="text-[9px] text-text-muted font-normal">({link.type})</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions strip */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border-subtle/10">
                        <div className="flex items-center gap-1.5 text-text-muted text-[10px]">
                          <span>Action authorization: APPROVED MODERATOR</span>
                        </div>

                        {!isRejecting ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowRejectInputReport(prev => ({ ...prev, [report.id]: true }))}
                              className="bg-transparent border border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-bg-void px-4 py-2 rounded text-[10px] font-bold uppercase transition-all"
                            >
                              Reject Report
                            </button>
                            <button
                              onClick={() => handleApproveReport(report.id)}
                              className="bg-accent-green text-bg-void hover:shadow-glow-green px-5 py-2 rounded text-[10px] font-bold uppercase transition-all"
                            >
                              Approve & Catalog
                            </button>
                          </div>
                        ) : (
                          <div className="w-full sm:max-w-md flex items-center gap-2">
                            <input
                              value={rejectionReasonReport[report.id] || ''}
                              onChange={(e) => setRejectionReasonReport(prev => ({ ...prev, [report.id]: e.target.value }))}
                              type="text"
                              placeholder="Reason for rejection (e.g. Chat logs cropped, fake receipts...)"
                              className="flex-1 bg-bg-surface border border-border-subtle focus:border-accent-red focus:outline-none rounded px-3 py-1.5 text-text-primary"
                              required
                            />
                            <button
                              onClick={() => handleRejectReport(report.id)}
                              className="bg-accent-red text-bg-void px-4 py-1.5 rounded text-[10px] font-bold uppercase"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowRejectInputReport(prev => ({ ...prev, [report.id]: false }))}
                              className="bg-white/[0.02] border border-border-subtle text-text-secondary px-3 py-1.5 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* QUEUE 2: Reseller Applications */}
        {activeTab === 'resellers' && (
          <div className="space-y-4">
            {pendingResellers.length === 0 ? (
              <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-12 text-center text-text-muted">
                <CheckCircle2 className="w-8 h-8 mx-auto text-accent-green/60 mb-2" />
                <p className="text-sm font-sans font-medium text-text-secondary">Applications Queue Clean</p>
                <p className="text-xs mt-1">No reseller verification requests are waiting for approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingResellers.map((reseller, idx) => {
                  const isRejecting = !!showRejectInputReseller[reseller.id];

                  return (
                    <div 
                      key={reseller.id}
                      className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4"
                    >
                      {/* Application header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle/20 pb-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-text-primary uppercase flex items-center gap-1.5">
                            <span>{reseller.store_name}</span>
                            <span className="text-[10px] font-normal text-text-muted">(@{reseller.profile?.username})</span>
                          </h3>
                          <p className="text-[10px] text-text-muted">
                            Submitted: {new Date(reseller.created_at).toLocaleDateString()} · Active Years: {reseller.years_active}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan font-bold text-[10px] uppercase font-mono">
                          STATUS: {reseller.verification_status}
                        </span>
                      </div>

                      {/* Application details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <span className="text-[9px] text-text-muted uppercase tracking-widest block font-bold">Store Tagline:</span>
                            <p className="text-text-primary text-xs font-sans leading-normal">{reseller.tagline || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-muted uppercase tracking-widest block font-bold">Bio / Services:</span>
                            <p className="text-text-secondary text-xs font-sans leading-relaxed">{reseller.bio}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-muted uppercase tracking-widest block font-bold">Specialties:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {reseller.specializes_in.map(spec => (
                                <span key={spec} className="px-2 py-0.5 rounded border border-border-subtle/80 bg-white/[0.01] text-[9px] text-text-secondary uppercase">
                                  {spec.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 bg-white/[0.01] border border-border-subtle/60 p-4 rounded-lg">
                          <span className="text-[9px] text-text-muted uppercase tracking-widest block font-bold border-b border-border-subtle/30 pb-1">Store Contacts</span>
                          <div className="space-y-1 text-xs">
                            <p><span className="text-text-muted">TG:</span> @{reseller.telegram_username || 'N/A'}</p>
                            <p><span className="text-text-muted">WhatsApp:</span> {reseller.whatsapp_number || 'N/A'}</p>
                            <p><span className="text-text-muted">Instagram:</span> @{reseller.instagram_username || 'N/A'}</p>
                            {reseller.youtube_channel && (
                              <p className="truncate"><span className="text-text-muted">YouTube:</span> <a href={reseller.youtube_channel} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">Link</a></p>
                            )}
                            <p><span className="text-text-muted">Price Range:</span> {reseller.price_range || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Application actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-border-subtle/10">
                        <div className="text-[10px] text-text-muted font-mono">
                          <span>Verification Protocol: SECURE_OG_BADGE</span>
                        </div>

                        {!isRejecting ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowRejectInputReseller(prev => ({ ...prev, [reseller.id]: true }))}
                              className="bg-transparent border border-accent-red/20 text-accent-red hover:bg-accent-red hover:text-bg-void px-4 py-2 rounded text-[10px] font-bold uppercase transition-all"
                            >
                              Reject Apply
                            </button>
                            <button
                              onClick={() => handleApproveReseller(reseller.id)}
                              className="bg-accent-green text-bg-void hover:shadow-glow-green px-5 py-2 rounded text-[10px] font-bold uppercase transition-all"
                            >
                              Approve Merchant
                            </button>
                          </div>
                        ) : (
                          <div className="w-full sm:max-w-md flex items-center gap-2">
                            <input
                              value={rejectionReasonReseller[reseller.id] || ''}
                              onChange={(e) => setRejectionReasonReseller(prev => ({ ...prev, [reseller.id]: e.target.value }))}
                              type="text"
                              placeholder="Reason for rejection (e.g. Channel ownership unverified...)"
                              className="flex-1 bg-bg-surface border border-border-subtle focus:border-accent-red focus:outline-none rounded px-3 py-1.5 text-text-primary"
                              required
                            />
                            <button
                              onClick={() => handleRejectReseller(reseller.id)}
                              className="bg-accent-red text-bg-void px-4 py-1.5 rounded text-[10px] font-bold uppercase"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowRejectInputReseller(prev => ({ ...prev, [reseller.id]: false }))}
                              className="bg-white/[0.02] border border-border-subtle text-text-secondary px-3 py-1.5 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
