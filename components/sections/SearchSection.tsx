'use client';

import React, { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import ScammerCard from '../ui/ScammerCard';
import SellerCard from '../ui/SellerCard';
import { db } from '../../lib/db';
import { ScammerEntity, TrustedReseller } from '../../types';
import { ShieldCheck, Info } from 'lucide-react';

export default function SearchSection() {
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ scammers: ScammerEntity[]; resellers: TrustedReseller[] }>({
    scammers: [],
    resellers: []
  });

  const handleSearchSubmit = (query: string, type: string) => {
    setLoading(true);
    setSearched(true);
    
    // Simulate real-time API latency
    setTimeout(async () => {
      const searchRes = await db.search(query, type as any);
      setResults(searchRes as any);
      setLoading(false);
    }, 450);
  };

  const hasScammers = results.scammers.length > 0;
  const hasResellers = results.resellers.length > 0;
  const hasAnyResults = hasScammers || hasResellers;

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto space-y-10 border-b border-border-subtle/30">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-wider text-text-primary">
          Verify Identifiers
        </h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto">
          Scan Phone numbers, UPI IDs, Telegram tags, Instagram pages, or BGMI UIDs before completing any transaction.
        </p>
      </div>

      {/* Main tab search bar */}
      <SearchBar onSearch={handleSearchSubmit} isLoading={loading} />

      {/* Results presentation */}
      {searched && !loading && (
        <div className="space-y-6 max-w-4xl mx-auto pt-6">
          {!hasAnyResults && (
            <div className="flex items-start gap-3 p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">✅ No reports found in our registry.</p>
                <p className="text-xs text-text-secondary mt-1 font-sans">
                  This identifier looks clean — but always proceed with caution. Ensure you use official middlemen for high-tier accounts.
                </p>
              </div>
            </div>
          )}

          {hasAnyResults && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase font-mono text-text-muted tracking-widest border-b border-border-subtle/30 pb-2">
                <Info className="w-4 h-4" />
                <span>Search results ({results.scammers.length + results.resellers.length} matches found)</span>
              </div>

              {/* Scammers results */}
              {hasScammers && (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-mono text-accent-red font-bold tracking-wider">
                    ⚠️ Confirmed Threat Records:
                  </h4>
                  <div className="space-y-4">
                    {results.scammers.map(scammer => (
                      <ScammerCard key={scammer.id} entity={scammer} />
                    ))}
                  </div>
                </div>
              )}

              {/* Resellers results */}
              {hasResellers && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs uppercase font-mono text-accent-green font-bold tracking-wider">
                    ✅ Verified Trusted Sellers matched:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.resellers.map(reseller => (
                      <SellerCard key={reseller.id} reseller={reseller} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
