'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SearchBar from '../../components/ui/SearchBar';
import ScammerCard from '../../components/ui/ScammerCard';
import SellerCard from '../../components/ui/SellerCard';
import { db } from '../../lib/db';
import { ScammerEntity, TrustedReseller } from '../../types';
import { Filter, Info, ShieldCheck } from 'lucide-react';

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

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam) {
      setLoading(true);
      db.search(queryParam, typeParam).then((searchRes) => {
        setResults(searchRes as any);
        setLoading(false);
      });
    } else {
      setResults({ scammers: [], resellers: [] });
    }
  }, [queryParam, typeParam]);

  const hasScammers = results.scammers.length > 0;
  const hasResellers = results.resellers.length > 0;
  
  const displayedScammers = filterType === 'all' || filterType === 'scammers' ? results.scammers : [];
  const displayedResellers = filterType === 'all' || filterType === 'resellers' ? results.resellers : [];
  const hasDisplayedResults = displayedScammers.length > 0 || displayedResellers.length > 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-8 font-mono">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
          Global Trust Registry
        </h1>
        <p className="text-text-secondary text-xs font-sans">
          Verify credentials against the centralized blacklist database and reseller catalog.
        </p>
      </div>

      {/* Persistent search box */}
      <SearchBar initialQuery={queryParam} initialType={typeParam} placeholder="Verify phone, telegram, UPI, UID..." />

      {queryParam && (
        <div className="space-y-6">
          {/* Results Filter controls */}
          <div className="flex flex-wrap items-center justify-between border-b border-border-subtle/50 pb-3 gap-4">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Results:</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded text-xs border ${filterType === 'all' ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5' : 'border-border-subtle text-text-secondary hover:text-text-primary'}`}
              >
                All ({results.scammers.length + results.resellers.length})
              </button>
              <button
                onClick={() => setFilterType('scammers')}
                className={`px-3 py-1 rounded text-xs border ${filterType === 'scammers' ? 'border-accent-red text-accent-red bg-accent-red/5' : 'border-border-subtle text-text-secondary hover:text-text-primary'}`}
              >
                Blacklist ({results.scammers.length})
              </button>
              <button
                onClick={() => setFilterType('resellers')}
                className={`px-3 py-1 rounded text-xs border ${filterType === 'resellers' ? 'border-accent-green text-accent-green bg-accent-green/5' : 'border-border-subtle text-text-secondary hover:text-text-primary'}`}
              >
                Resellers ({results.resellers.length})
              </button>
            </div>
          </div>

          {/* Results presentation */}
          {loading ? (
            <div className="py-20 text-center text-text-muted">
              <span className="w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="mt-2 text-xs uppercase">Querying datastore...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {!hasDisplayedResults && (
                <div className="flex items-start gap-3 p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">No threats found matching: "{queryParam}"</p>
                    <p className="text-xs text-text-secondary mt-1 font-sans">
                      This marker is not blacklisted in our database. Remain cautious of mock middlemen.
                    </p>
                  </div>
                </div>
              )}

              {/* Display matched scammers */}
              {displayedScammers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-accent-red uppercase tracking-widest flex items-center gap-2">
                    <span>⚠️ BLACKLISTED RECORDS ({displayedScammers.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {displayedScammers.map(scammer => (
                      <ScammerCard key={scammer.id} entity={scammer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Display matched resellers */}
              {displayedResellers.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-bold text-accent-green uppercase tracking-widest flex items-center gap-2">
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
        <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-12 text-center text-text-muted">
          <Info className="w-8 h-8 mx-auto text-text-muted/60 mb-3" />
          <p className="text-sm font-sans">Enter a search query above to look up scammer records or verified trader store directories.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="max-w-6xl mx-auto py-20 text-center text-text-muted font-mono">
            <span className="w-8 h-8 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="mt-2 text-xs uppercase">Initializing Registry...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
