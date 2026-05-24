'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../../lib/db';
import { ScamReport } from '../../types';
import RiskBadge from '../ui/RiskBadge';
import { AlertCircle, Calendar, IndianRupee } from 'lucide-react';

export default function LatestAlerts() {
  const [alerts, setAlerts] = useState<ScamReport[]>([]);

  useEffect(() => {
    let isMounted = true;
    db.getLatestApprovedReports(5).then((data) => {
      if (isMounted) {
        setAlerts(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto space-y-8 border-b border-border-subtle/30">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-red"></span>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
            Latest Scam Alerts
          </h2>
          <p className="text-xs text-text-secondary font-mono">
            Active warnings compiled from recent approved report filings
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-8 text-center text-text-muted font-mono text-xs uppercase tracking-widest">
          No threat alerts currently registered.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => {
            const riskLevel = alert.scammer_entity?.risk_level || 'medium';
            return (
              <div
                key={alert.id}
                className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-red/20 transition-all duration-300"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge risk={riskLevel} pulse={false} />
                    <span className="text-xs font-mono text-text-muted">{alert.id.toUpperCase()}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">
                    Report filed against: <span className="text-accent-red font-mono">{alert.scammer_name}</span>
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-mono text-text-secondary">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-accent-red" />
                      <span>₹{alert.amount_lost.toLocaleString('en-IN')} lost</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      <span>Inc: {new Date(alert.incident_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border-subtle/30 sm:border-0 pt-3 sm:pt-0">
                  <Link
                    href={`/report/${alert.id}`}
                    className="w-full sm:w-auto text-center border border-border-subtle hover:border-accent-red/30 text-text-secondary hover:text-accent-red px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-200"
                  >
                    View File
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
