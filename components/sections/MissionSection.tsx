import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';

export default function MissionSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 bg-[#080a0f] border-b border-white/5 overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
        <div className="space-y-4">
          <div className="badge badge-cyan mx-auto">
            OUR MISSION
          </div>
          <p 
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-snug"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            "Scammers exploit anonymity. We eliminate it by indexing threat markers, establishing accountability, and spotlighting verified traders."
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto pt-4 text-left">
          <div className="glass-panel card-glow-cyan rounded-2xl p-6 flex gap-4 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-accent-cyan" />
            </div>
            <div>
              <p className="text-lg font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-h)' }}>
                100% Moderated
              </p>
              <p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
                Reports undergo extensive moderation verification using link-referenced evidence. No spam or fabricated claims.
              </p>
            </div>
          </div>

          <div className="glass-panel card-glow-green rounded-2xl p-6 flex gap-4 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/25 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <p className="text-lg font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-h)' }}>
                Community First
              </p>
              <p className="text-xs text-text-secondary mt-1 font-sans leading-relaxed">
                Built by gamers for gamers. We safeguard marketplace channels and keep trader reputation intelligence transparent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
