import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';

export default function MissionSection() {
  return (
    <section className="relative py-24 px-4 bg-bg-surface border-b border-border-subtle/30 overflow-hidden">
      {/* Background grid texture */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <h2 className="text-sm font-mono text-accent-cyan uppercase tracking-widest font-bold">
            Guarding the BGMI Trading Frontier
          </h2>
          <p className="text-2xl md:text-4xl font-bold font-display tracking-wide text-text-primary leading-snug">
            "Scammers exploit anonymity. We eliminate it by indexing threat markers, establishing accountability, and spotlighting verified traders."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto pt-6 text-left font-mono">
          <div className="flex gap-4 p-4 rounded bg-white/[0.02] border border-border-subtle/50">
            <ShieldCheck className="w-8 h-8 text-accent-cyan shrink-0" />
            <div>
              <p className="text-xl font-bold text-text-primary">100% Verified</p>
              <p className="text-xs text-text-secondary mt-1 font-sans">
                Reports undergo extensive moderation verification using link-referenced proof. No spam logs.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded bg-white/[0.02] border border-border-subtle/50">
            <Users className="w-8 h-8 text-accent-green shrink-0" />
            <div>
              <p className="text-xl font-bold text-text-primary">Community First</p>
              <p className="text-xs text-text-secondary mt-1 font-sans">
                A system built for gamers, by gamers. We keep trade channels safe and reputation intelligence visible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
