'use client';

import React, { useEffect, useState } from 'react';
import { db, getMockDb } from '../../lib/db';
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

      // Find highest loss
      const allApproved = getMockDb().scam_reports.filter((r: ScamReport) => r.status === 'approved');
      let maxReport: ScamReport | null = null;
      if (allApproved.length > 0) {
        maxReport = allApproved.reduce((max: ScamReport | null, r: ScamReport) => r.amount_lost > (max?.amount_lost || 0) ? r : max, allApproved[0] as ScamReport | null);
      }

      // Find most common scam type
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

      // Format type name
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
    <section className="py-16 px-4 max-w-6xl mx-auto border-b border-border-subtle/30">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-sm">
        
        {/* Card 1: Most Reported Scam Type */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle border-l-4 border-l-accent-amber rounded-r-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-accent-amber">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Intelligence Feed</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-text-muted text-xs uppercase tracking-wide">Most Active Threat Type</h4>
            <p className="text-xl font-bold tracking-wide font-display text-text-primary mt-1">
              {highlights.mostCommonType}
            </p>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Accounts for the majority of recent community dispute logs.
            </p>
          </div>
        </div>

        {/* Card 2: Highest Amount Lost Case */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle border-l-4 border-l-accent-red rounded-r-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-accent-red">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">High-Risk Record</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-text-muted text-xs uppercase tracking-wide">Peak Incident Loss</h4>
            <p className="text-xl font-bold tracking-wide font-display text-text-primary mt-1">
              ₹{highlights.highestLossReport ? highlights.highestLossReport.amount_lost.toLocaleString('en-IN') : '0'} Lost
            </p>
            {highlights.highestLossReport ? (
              <Link 
                href={`/report/${highlights.highestLossReport.id}`}
                className="inline-block text-[11px] text-accent-red hover:underline mt-2 font-mono uppercase"
              >
                Review File details &rarr;
              </Link>
            ) : (
              <span className="text-xs text-text-secondary font-sans">No reports registered yet.</span>
            )}
          </div>
        </div>

        {/* Card 3: Newest Report */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle border-l-4 border-l-accent-cyan rounded-r-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-accent-cyan">
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Real-Time Sync</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-text-muted text-xs uppercase tracking-wide">Latest Scam Incident</h4>
            <p className="text-xl font-bold tracking-wide font-display text-text-primary mt-1 truncate">
              {highlights.newestReport ? highlights.newestReport.scammer_name : 'No active alerts'}
            </p>
            {highlights.newestReport ? (
              <Link 
                href={`/report/${highlights.newestReport.id}`}
                className="inline-block text-[11px] text-accent-cyan hover:underline mt-2 font-mono uppercase"
              >
                Inspect new report &rarr;
              </Link>
            ) : (
              <span className="text-xs text-text-secondary font-sans font-medium">Monitoring active channels.</span>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
