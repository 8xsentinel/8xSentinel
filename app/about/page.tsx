import { ShieldCheck, Users, ShieldAlert } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 md:py-20 px-4 space-y-16 font-sans">
      <div className="text-center space-y-4">
        <div className="badge badge-cyan mx-auto">
          ABOUT 8xSENTINEL
        </div>
        <h1 
          className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-h)' }}
        >
          Securing the <span className="g">Gaming Guild</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          The definitive trust infrastructure for the BGMI account and digital skins trading ecosystem.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-8 space-y-6 leading-relaxed text-text-secondary text-base">
        <p>
          The BGMI account and skins trading community has historically been plagued by bad actors, impersonators, and fraudulent scammers. 
          <strong className="text-white font-bold"> 8xSentinel</strong> was built by Resellers for all Resellers across the community. We provide transparent, real-time threat intelligence on active scammers and spotlight authenticated BGMI reseller stores operating on WhatsApp and Telegram.
        </p>
        <p>
          Our platform combines automated identifier clustering, community dispute filings, and peer reseller trust clearances to protect buyer capital, eliminate fraud, and help every reseller know their trusted peers across all Indian states.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-4">
        <div className="glass-panel card-glow-cyan rounded-2xl p-6 space-y-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-accent-cyan" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-h)' }}>
            Reseller Verification
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Multi-point store audits ensure BGMI resellers are genuine, binding official WhatsApp and Telegram handles with state peer endorsements.
          </p>
        </div>

        <div className="glass-panel card-glow-red rounded-2xl p-6 space-y-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/25 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-accent-red" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-h)' }}>
            Scam Blacklist
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            A centralized database of verified fraud filings allows players to cross-check identifiers before making payments.
          </p>
        </div>

        <div className="glass-panel card-glow-green rounded-2xl p-6 space-y-3 transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/25 flex items-center justify-center">
            <Users className="w-6 h-6 text-accent-green" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-h)' }}>
            Community Moderation
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Disputes and applications are reviewed by regional moderators to maintain accurate, impartial trust records.
          </p>
        </div>
      </div>
    </div>
  );
}
