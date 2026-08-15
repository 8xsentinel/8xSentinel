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
  const [results, setResults] = useState<{ scammers: ScammerEntity[]; resellers: TrustedReseller[] }>({
    scammers: [],
    resellers: []
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const isUserAuthenticated = !!user || !!currentUser;

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam && isUserAuthenticated) {
      setLoading(true);
      db.search(queryParam, typeParam).then((searchRes) => {
        setResults(searchRes as any);
        setLoading(false);
      });
    } else {
      setResults({ scammers: [], resellers: [] });
    }
  }, [queryParam, typeParam, isUserAuthenticated]);

  const hasScammers = results.scammers.length > 0;
  const hasResellers = results.resellers.length > 0;
  
  const displayedScammers = filterType === 'all' || filterType === 'scammers' ? results.scammers : [];
  const displayedResellers = filterType === 'all' || filterType === 'resellers' ? results.resellers : [];
  const hasDisplayedResults = displayedScammers.length > 0 || displayedResellers.length > 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8 font-sans">
      {/* Search Header */}
      <div className="space-y-3">
        <div className="badge badge-cyan">
          GLOBAL REGISTRY SEARCH
        </div>
        <h1 
          className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-h)' }}
        >
          Trust &amp; Blacklist <span className="g">Database</span>
        </h1>
        <p className="text-text-secondary text-sm font-sans max-w-xl leading-relaxed">
          Verify credentials against the centralized blacklist database and certified reseller catalog.
        </p>
      </div>

      {/* Authentication Lock Screen for unauthenticated visitors */}
      {!isUserAuthenticated ? (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-5 max-w-xl mx-auto border border-accent-cyan/25">
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Lock className="w-7 h-7 text-accent-cyan animate-pulse" />
          </div>
          <h2 
            className="text-xl font-bold uppercase tracking-wider text-white"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            Authentication Required
          </h2>
          <p className="text-xs text-text-secondary font-sans leading-relaxed">
            All users must be signed in to query the Global Blacklist Registry and access merchant reputation logs.
          </p>
          <div className="flex justify-center pt-2">
            <AuthButton />
          </div>
        </div>
      ) : (
        <SearchBar initialQuery={queryParam} initialType={typeParam} placeholder="Verify phone, telegram, UPI, UID..." />
      )}

      {queryParam && (
        <div className="space-y-6">
          {/* Results Filter controls */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-3 gap-4">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Filter className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-h)' }}>Filter Results:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterType === 'all'
                    ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/15'
                    : 'border-white/5 text-text-secondary hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-h)' }}
              >
                All ({results.scammers.length + results.resellers.length})
              </button>
              <button
                onClick={() => setFilterType('scammers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterType === 'scammers'
                    ? 'border-accent-red text-accent-red bg-accent-red/15'
                    : 'border-white/5 text-text-secondary hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-h)' }}
              >
                Blacklist ({results.scammers.length})
              </button>
              <button
                onClick={() => setFilterType('resellers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  filterType === 'resellers'
                    ? 'border-accent-green text-accent-green bg-accent-green/15'
                    : 'border-white/5 text-text-secondary hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-h)' }}
              >
                Resellers ({results.resellers.length})
              </button>
            </div>
          </div>

          {/* Results presentation */}
          {loading ? (
            <div className="py-20 text-center text-text-muted">
              <span className="w-8 h-8 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block" />
              <p className="mt-2 text-xs uppercase font-bold tracking-widest text-accent-cyan" style={{ fontFamily: 'var(--font-h)' }}>
                Querying Registry...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {!hasDisplayedResults && (
                <div className="flex items-start gap-3 p-6 rounded-2xl glass-panel border border-emerald-500/25 text-emerald-400">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-h)' }}>
                      No malicious records found matching: "{queryParam}"
                    </p>
                    <p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
                      This marker currently has zero flagged dispute logs. Always exercise due diligence.
                    </p>
                  </div>
                </div>
              )}

              {/* Matched scammers */}
              {displayedScammers.length > 0 && (
                <div className="space-y-4">
                  <h3 
                    className="text-xs font-bold text-accent-red uppercase tracking-wider flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-h)' }}
                  >
                    <span>⚠️ BLACKLISTED RECORDS ({displayedScammers.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {displayedScammers.map(scammer => (
                      <ScammerCard key={scammer.id} entity={scammer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Matched resellers */}
              {displayedResellers.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 
                    className="text-xs font-bold text-accent-green uppercase tracking-wider flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-h)' }}
                  >
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
