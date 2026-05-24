import React from 'react';
import { AlertCircle, Search, ShieldCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Report Incidents',
      desc: 'Submit scam details with Telegram IDs, UPIs, and shareable proof links. No files are stored.',
      icon: AlertCircle,
      color: 'text-accent-red border-accent-red/20 bg-accent-red/5'
    },
    {
      step: '02',
      title: 'Verify Identifiers',
      desc: 'Search our community registry before trading. Check trust scores and risk indexes immediately.',
      icon: Search,
      color: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5'
    },
    {
      step: '03',
      title: 'Trade Securely',
      desc: 'Connect with verified resellers who have approved trust scores and clean escrow history.',
      icon: ShieldCheck,
      color: 'text-accent-green border-accent-green/20 bg-accent-green/5'
    }
  ];

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto space-y-16 border-b border-border-subtle/30">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-wider text-text-primary">
          Platform Architecture
        </h2>
        <p className="text-text-secondary text-sm max-w-lg mx-auto">
          Protecting the gaming guild with military-grade precision and community-driven verification.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Animated connecting line in background */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-accent-red/20 via-accent-cyan/20 to-accent-green/20 hidden md:block z-0"></div>
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={index} 
              className="relative z-10 backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 flex flex-col items-center text-center space-y-4 hover:border-accent-cyan/20 transition-all duration-300"
            >
              {/* Icon Bubble */}
              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center ${step.color}`}>
                <Icon className="w-6 h-6 animate-pulse" />
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest block">
                  Stage {step.step}
                </span>
                <h3 className="text-lg font-bold font-display tracking-wider text-text-primary">
                  {step.title}
                </h3>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
