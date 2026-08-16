'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '../../components/ui/SearchBar';
import ScammerCard from '../../components/ui/ScammerCard';
import SellerCard from '../../components/ui/SellerCard';
import AuthButton from '../../components/auth/AuthButton';
import { db } from '../../lib/db';
import { ScammerEntity, TrustedReseller } from '../../types';
import { useAuth } from '../../lib/firebase/AuthContext';
import { Filter, Info, ShieldCheck, Lock, ShieldAlert } from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

function SearchContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as any;

  const [query, setQuery] = useState(queryParam);
  const [filterType, setFilterType] = useState<'all' | 'scammers' | 'resellers'>('all');
  const [results, setResults] = useState<{ scammers: ScammerEntity[]; reports: any[]; resellers: TrustedReseller[] }>({
    scammers: [],
    reports: [],
    resellers: []
  });
  const [loading, setLoading] = useState(false);

  const { user, profile } = useAuth();
  const currentUser = profile;

  useEffect(() => {}, [currentUser]);

  const isUserAuthenticated = !!user || !!currentUser;

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam && isUserAuthenticated) {
      setLoading(true);
      db.search(queryParam, typeParam).then((searchRes: any) => {
        setResults({
          scammers: searchRes.scammers || [],
          reports: searchRes.reports || [],
          resellers: searchRes.resellers || []
        });
        setLoading(false);
      });
    } else {
      setResults({ scammers: [], reports: [], resellers: [] });
    }
  }, [queryParam, typeParam, isUserAuthenticated]);

  // Deduplicate: remove reports that already have a scammer_entity_id matching an entity in results
  const entityIds = new Set(results.scammers.map(s => s.id));
  const uniqueReports = results.reports.filter(r => !r.scammer_entity_id || !entityIds.has(r.scammer_entity_id));

  const totalBlacklistCount = results.scammers.length + uniqueReports.length;
  
  const displayedScammers = filterType === 'all' || filterType === 'scammers' ? results.scammers : [];
  const displayedReports = filterType === 'all' || filterType === 'scammers' ? uniqueReports : [];
  const displayedResellers = filterType === 'all' || filterType === 'resellers' ? results.resellers : [];
  const hasDisplayedResults = displayedScammers.length > 0 || displayedReports.length > 0 || displayedResellers.length > 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'withdrawn': return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
      default: return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8 font-sans">
      <div className="space-y-3">
        <div className="badge badge-cyan">GLOBAL REGISTRY SEARCH</div>
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white" style={{ fontFamily: 'var(--font-h)' }}>
          Trust &amp; Blacklist <span className="g">Database</span>
        </h1>
        <p className="text-text-secondary text-sm font-sans max-w-xl leading-relaxed">
          Verify credentials against the centralized blacklist database and certified reseller catalog.
        </p>
      </div>

      {!isUserAuthenticated ? (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-5 max-w-xl mx-auto border border-accent-cyan/25">
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Lock className="w-7 h-7 text-accent-cyan animate-pulse" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>Authentication Required</h2>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            All users must be signed in to query the Global Blacklist Registry and access merchant reputation logs.
          </p>
          <div className="flex justify-center pt-2"><AuthButton /></div>
        </div>
      ) : (
        <SearchBar initialQuery={queryParam} initialType={typeParam} placeholder="Verify phone, telegram, UPI, UID..." />
      )}

      {queryParam && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-3 gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
              <Filter className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-h)' }}>Filter Results:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 -mb-2 sm:pb-0 sm:mb-0 snap-x hide-scrollbar">
              <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap snap-start shrink-0 ${filterType === 'all' ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/15' : 'border-white/5 text-text-secondary hover:text-white'}`} style={{ fontFamily: 'var(--font-h)' }}>
                All ({totalBlacklistCount + results.resellers.length})
              </button>
              <button onClick={() => setFilterType('scammers')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap snap-start shrink-0 ${filterType === 'scammers' ? 'border-accent-red text-accent-red bg-accent-red/15' : 'border-white/5 text-text-secondary hover:text-white'}`} style={{ fontFamily: 'var(--font-h)' }}>
                Blacklist ({totalBlacklistCount})
              </button>
              <button onClick={() => setFilterType('resellers')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap snap-start shrink-0 ${filterType === 'resellers' ? 'border-accent-green text-accent-green bg-accent-green/15' : 'border-white/5 text-text-secondary hover:text-white'}`} style={{ fontFamily: 'var(--font-h)' }}>
                Resellers ({results.resellers.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-text-muted">
              <span className="w-8 h-8 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block" />
              <p className="mt-2 text-xs uppercase font-bold tracking-widest text-accent-cyan" style={{ fontFamily: 'var(--font-h)' }}>Querying Registry...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {!hasDisplayedResults && (
                <div className="flex items-start gap-3 p-6 rounded-2xl glass-panel border border-emerald-500/25 text-emerald-400">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-h)' }}>No malicious records found matching: "{queryParam}"</p>
                    <p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">This marker currently has zero flagged dispute logs. Always exercise due diligence.</p>
                  </div>
                </div>
              )}

              {/* Matched scammer entities (approved, grouped) */}
              {displayedScammers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-accent-red uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
                    <span>⚠️ BLACKLISTED RECORDS ({displayedScammers.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {displayedScammers.map(scammer => (
                      <ScammerCard key={scammer.id} entity={scammer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Individual scam reports (pending + approved) */}
              {displayedReports.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
                    <ShieldAlert className="w-4 h-4" />
                    <span>SCAM REPORTS ({displayedReports.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {displayedReports.map((report: any) => (
                      <a key={report.id} href={`/report/${report.id}`} className="block p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-accent-red/40 transition-all group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white group-hover:text-accent-red transition-colors" style={{ fontFamily: 'var(--font-h)' }}>
                                {report.scammer_name}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold font-mono ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted uppercase font-mono">
                                {report.scam_type?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-text-muted font-mono flex-wrap">
                              {report.telegram_username && <span>TG: <strong className="text-text-secondary">@{report.telegram_username}</strong></span>}
                              {report.whatsapp_number && <span>WA: <strong className="text-text-secondary">{report.whatsapp_number}</strong></span>}
                              {report.instagram_username && <span>IG: <strong className="text-text-secondary">@{report.instagram_username}</strong></span>}
                              {report.upi_id && <span>UPI: <strong className="text-text-secondary">{report.upi_id}</strong></span>}
                              {report.bgmi_uid && <span>UID: <strong className="text-text-secondary">{report.bgmi_uid}</strong></span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-xs text-text-muted font-mono block">Loss</span>
                              <span className="text-lg font-bold text-accent-red font-mono">₹{(report.amount_lost || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-[10px] text-text-muted font-mono text-right">
                              <span className="block">{new Date(report.incident_date || report.created_at).toLocaleDateString()}</span>
                              <span className="text-accent-cyan group-hover:underline">View Report →</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched resellers */}
              {displayedResellers.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold text-accent-green uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'var(--font-h)' }}>
                    <span>✅ VERIFIED RESELLERS ({displayedResellers.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedResellers.map(reseller => (
                      <SellerCard key={reseller.id} reseller={reseller} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!queryParam && (
        <div className="glass-panel rounded-2xl p-12 text-center text-text-muted">
          <Info className="w-8 h-8 mx-auto text-accent-cyan opacity-60 mb-3" />
          <p className="text-sm font-sans">Enter a search query above to look up scammer records or verified trader store directories.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="max-w-6xl mx-auto py-20 text-center text-text-muted">
            <span className="w-8 h-8 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block" />
            <p className="mt-2 text-xs uppercase font-bold text-accent-cyan" style={{ fontFamily: 'var(--font-h)' }}>
              Initializing Search...
            </p>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </ProtectedRoute>
  );
}
