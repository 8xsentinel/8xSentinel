'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../../lib/db';
import { ScamReport } from '../../types';
import RiskBadge from '../ui/RiskBadge';
import { AlertCircle, Calendar, IndianRupee, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../lib/firebase/AuthContext';
import AuthButton from '../auth/AuthButton';

export default function LatestAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ScamReport[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      db.getLatestApprovedReports(5).then((data) => {
        if (isMounted) {
          setAlerts(data);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto space-y-8 border-b border-white/5 font-sans">
      <div className="flex items-center gap-3">
        <div className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-red"></span>
        </div>
        <div>
          <h2 
            className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            Latest Scam <span className="g-red">Alerts</span>
          </h2>
          <p className="text-xs text-text-secondary font-sans mt-0.5">
            Active warnings compiled from recent approved report filings
          </p>
        </div>
      </div>

      {!user ? (
        <div className="glass-panel card-glow-red rounded-3xl p-8 sm:p-12 text-center space-y-5 border border-accent-red/25 shadow-[0_0_50px_rgba(239,68,68,0.08)]">
          <div className="w-16 h-16 rounded-2xl bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto text-accent-red shadow-[0_0_25px_rgba(239,68,68,0.2)]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-h)' }}>
              Threat Intelligence Gated
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Live scam alerts, target UPI/WhatsApp handles, and evidence proof files require verified Google authentication to prevent automated scammer evasion.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <AuthButton />
          </div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-text-muted text-xs uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-h)' }}>
          No threat alerts currently registered.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => {
            const riskLevel = alert.scammer_entity?.risk_level || 'medium';
            return (
              <div
                key={alert.id}
                className="glass-panel card-glow-red rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge risk={riskLevel} pulse={false} />
                    <span className="text-[11px] font-mono text-text-muted font-bold">{alert.id.toUpperCase()}</span>
                  </div>
                  <h3 
                    className="text-base font-bold text-white uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-h)' }}
                  >
                    Flagged Target: <span className="text-accent-red font-mono font-bold">{alert.scammer_name}</span>
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs text-text-secondary font-sans">
                    <div className="flex items-center gap-1 font-bold text-accent-red">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>₹{alert.amount_lost.toLocaleString('en-IN')} lost</span>
                    </div>
                    <div className="flex items-center gap-1 text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Incident: {new Date(alert.incident_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                  <Link
                    href={`/report/${alert.id}`}
                    className="btn btn-outline py-2 px-4 text-xs inline-flex items-center gap-1.5 w-full sm:w-auto justify-center"
                  >
                    <span>View File</span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent-red" />
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
