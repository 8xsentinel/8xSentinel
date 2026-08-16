import React from 'react';
import { AlertCircle, Search, ShieldCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Report Incidents',
      desc: 'Submit fraud evidence including Telegram handles, Phone numbers, and UPI transaction markers to immediately flag repeat offenders.',
      icon: AlertCircle,
      wrapClass: 'border-accent-red/30 bg-accent-red/10 text-accent-red shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      cardClass: 'card-glow-red',
    },
    {
      step: '02',
      title: 'Verify Identifiers',
      desc: 'Query our centralized registry before initiating account trades or sending UPI deposits. Real-time trust score calculations protect your capital.',
      icon: Search,
      wrapClass: 'border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      cardClass: 'card-glow-cyan highlighted',
    },
    {
      step: '03',
      title: 'Deal with Trusted Resellers',
      desc: 'Transact with authenticated BGMI store resellers operating verified WhatsApp and Telegram channels with zero blacklist flags.',
      icon: ShieldCheck,
      wrapClass: 'border-accent-green/30 bg-accent-green/10 text-accent-green shadow-[0_0_15px_rgba(34,197,94,0.2)]',
      cardClass: 'card-glow-green',
    },
  ];

  return (
    <section className="py-12 md:py-20 px-4 max-w-6xl mx-auto space-y-12 border-b border-white/5">
      <div className="text-center space-y-3">
        <div className="badge badge-cyan mx-auto">
          SECURITY PROTOCOL
        </div>
        <h2 
          className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-h)' }}
        >
          How 8xSentinel <span className="g">Protects You</span>
        </h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto font-sans leading-relaxed">
          Community-powered intelligence engineered to eliminate fraudulent trading in the BGMI marketplace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className={`why-us-card ${step.cardClass}`}
            >
              {/* Icon Container */}
              <div className={`why-us-icon-wrap ${step.wrapClass}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Step indicator */}
              <span 
                className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-1"
                style={{ fontFamily: 'var(--font-h)' }}
              >
                PHASE {step.step}
              </span>

              {/* Title & Desc */}
              <h3 style={{ fontFamily: 'var(--font-h)' }}>
                {step.title}
              </h3>
              <p>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
