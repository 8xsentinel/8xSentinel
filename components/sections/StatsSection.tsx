'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../../lib/db';
import { ScamReport } from '../../types';
import { ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function StatsSection() {
  const [highlights, setHighlights] = useState<{
    mostCommonType: string;
    mostCommonCount: number;
    highestLossReport: ScamReport | null;
    newestReport: ScamReport | null;
  }>({
    mostCommonType: 'Fake Account Sale',
    mostCommonCount: 0,
    highestLossReport: null,
    newestReport: null
  });

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      const stats = await db.getPlatformStats();
      const approved = await db.getLatestApprovedReports(10);
      
      if (!isMounted) return;

      let maxReport: ScamReport | null = null;
      if (approved.length > 0) {
        maxReport = approved.reduce((max: ScamReport | null, r: ScamReport) => (r.amount_lost || 0) > (max?.amount_lost || 0) ? r : max, approved[0] as ScamReport | null);
      }

      let mostCommon = 'Fake Account Sale';
      let maxCount = 0;
      if (stats.scamTypesCount) {
        Object.entries(stats.scamTypesCount).forEach(([type, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommon = type;
          }
        });
      }

      const formatType = (type: string) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      };

      setHighlights({
        mostCommonType: formatType(mostCommon),
        mostCommonCount: maxCount,
        highestLossReport: maxReport,
        newestReport: approved.length > 0 ? approved[0] : null
      });
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto border-b border-white/5 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Most Reported Scam Type */}
        <div className="glass-panel card-glow-orange rounded-2xl p-6 space-y-3 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between text-accent-amber">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted" style={{ fontFamily: 'var(--font-h)' }}>
              Intelligence Feed
            </span>
            <AlertTriangle className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <h4 className="text-text-secondary text-xs uppercase tracking-wide font-bold" style={{ fontFamily: 'var(--font-h)' }}>
              Most Active Threat Type
            </h4>
            <p className="text-xl font-bold tracking-wide text-white mt-1" style={{ fontFamily: 'var(--font-h)' }}>
              {highlights.mostCommonType}
            </p>
            <p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
              Represents the majority of recently validated community fraud logs.
            </p>
          </div>
        </div>

        {/* Card 2: Highest Amount Lost Case */}
        <div className="glass-panel card-glow-red rounded-2xl p-6 space-y-3 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between text-accent-red">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted" style={{ fontFamily: 'var(--font-h)' }}>
              High-Risk Record
            </span>
            <TrendingUp className="w-5 h-5 text-accent-red" />
          </div>
          <div>
            <h4 className="text-text-secondary text-xs uppercase tracking-wide font-bold" style={{ fontFamily: 'var(--font-h)' }}>
              Peak Incident Loss
            </h4>
            <p className="text-xl font-bold tracking-wide text-accent-red mt-1 font-mono">
              ₹{highlights.highestLossReport ? highlights.highestLossReport.amount_lost?.toLocaleString('en-IN') : '25,000'}
            </p>
            {highlights.highestLossReport ? (
              <Link 
                href={`/report/${highlights.highestLossReport.id}`}
                className="inline-block text-[12px] text-accent-red hover:underline mt-2 font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-h)' }}
              >
                Review File Details &rarr;
              </Link>
            ) : (
              <span className="text-xs text-text-secondary font-sans">No reports registered yet.</span>
            )}
          </div>
        </div>

        {/* Card 3: Newest Report */}
        <div className="glass-panel card-glow-cyan rounded-2xl p-6 space-y-3 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between text-accent-cyan">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted" style={{ fontFamily: 'var(--font-h)' }}>
              Real-Time Sync
            </span>
            <ShieldAlert className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <h4 className="text-text-secondary text-xs uppercase tracking-wide font-bold" style={{ fontFamily: 'var(--font-h)' }}>
              Latest Scam Incident
            </h4>
            <p className="text-xl font-bold tracking-wide text-white mt-1 truncate" style={{ fontFamily: 'var(--font-h)' }}>
              {highlights.newestReport ? highlights.newestReport.scammer_name : 'Monitoring Feed'}
            </p>
            {highlights.newestReport ? (
              <Link 
                href={`/report/${highlights.newestReport.id}`}
                className="inline-block text-[12px] text-accent-cyan hover:underline mt-2 font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-h)' }}
              >
                Inspect New Report &rarr;
              </Link>
            ) : (
              <span className="text-xs text-text-secondary font-sans">Monitoring active channels.</span>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
