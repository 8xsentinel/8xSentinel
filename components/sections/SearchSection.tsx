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
    
    setTimeout(async () => {
      const searchRes = await db.search(query, type as any);
      setResults(searchRes as any);
      setLoading(false);
    }, 400);
  };

  const hasScammers = results.scammers.length > 0;
  const hasResellers = results.resellers.length > 0;
  const hasAnyResults = hasScammers || hasResellers;

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto space-y-10 border-b border-white/5 font-sans">
      <div className="text-center space-y-3">
        <div className="badge badge-cyan mx-auto">
          INSTANT RADAR
        </div>
        <h2 
          className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-h)' }}
        >
          Verify <span className="g">Identifiers</span>
        </h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto leading-relaxed">
          Scan WhatsApp numbers, UPI IDs, Telegram usernames, or BGMI UIDs before confirming payments.
        </p>
      </div>

      {/* Main search bar */}
      <SearchBar onSearch={handleSearchSubmit} isLoading={loading} />

      {/* Results presentation */}
      {searched && !loading && (
        <div className="space-y-6 max-w-4xl mx-auto pt-4">
          {!hasAnyResults && (
            <div className="flex items-start gap-3 p-6 rounded-2xl glass-panel border border-emerald-500/25 text-emerald-400">
              <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-h)' }}>
                  ✅ No malicious records found in our database.
                </p>
                <p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
                  This identifier currently has zero confirmed reports. Always exercise caution and verify authentic contact handles.
                </p>
              </div>
            </div>
          )}

          {hasAnyResults && (
            <div className="space-y-6">
              <div 
                className="flex items-center gap-2 text-xs uppercase font-bold text-text-muted tracking-wider border-b border-white/5 pb-2"
                style={{ fontFamily: 'var(--font-h)' }}
              >
                <Info className="w-4 h-4 text-accent-cyan" />
                <span>Search matches ({results.scammers.length + results.resellers.length} records found)</span>
              </div>

              {/* Scammers results */}
              {hasScammers && (
                <div className="space-y-4">
                  <h4 
                    className="text-xs uppercase text-accent-red font-bold tracking-wider"
                    style={{ fontFamily: 'var(--font-h)' }}
                  >
                    ⚠️ Blacklisted Records ({results.scammers.length}):
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
                  <h4 
                    className="text-xs uppercase text-accent-green font-bold tracking-wider"
                    style={{ fontFamily: 'var(--font-h)' }}
                  >
                    ✅ Verified Resellers ({results.resellers.length}):
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
