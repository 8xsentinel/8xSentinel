'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  FileSpreadsheet,
  Search,
  ShieldAlert,
  Users,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

import StatCounter from '../ui/StatCounter';
import CyberButton from '../ui/CyberButton';

interface HeroSectionProps {
  stats?: {
    totalReports?: number;
    totalScammers?: number;
    totalProtected?: number;
    verifiedSellers?: number;
  };
}

export default function HeroSection({
  stats = {},
}: HeroSectionProps) {
  // Safe fallback values
  const safeStats = {
    totalReports: stats.totalReports ?? 1420,
    totalScammers: stats.totalScammers ?? 384,
    totalProtected: stats.totalProtected ?? 6250000,
    verifiedSellers: stats.verifiedSellers ?? 48,
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center py-20 px-4 overflow-hidden border-b border-white/5">
      {/* Background Hero Banner + Dark Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 filter saturate-150"
        style={{ backgroundImage: "url('/hero-banner.webp')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080a0f]/80 via-[#080a0f]/95 to-[#080a0f] pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none z-0" />

      {/* Radiant Glowing Background Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* Hero Content */}
      <div className="max-w-5xl mx-auto text-center space-y-8 z-10 relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 badge text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-accent-cyan" />
          <span>BGMI CENTRAL BLACKLIST &amp; TRUST SHIELD</span>
        </motion.div>

        {/* Title */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase leading-[1.05] select-none text-white"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            Search Before <br />
            You <span className="g">Deal.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-text-secondary font-sans max-w-2xl mx-auto leading-relaxed"
          >
            The definitive trust infrastructure for BGMI trading. Run instant
            lookups on phone numbers, Telegram handles, UPI VPAs, and seller
            stores before sending payments.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link href="/search" className="w-full sm:w-auto">
            <CyberButton variant="cyan" size="lg" fullWidth>
              <Search className="w-4 h-4 text-accent-cyan" />
              <span>Verify Trader</span>
            </CyberButton>
          </Link>

          <Link href="/submit-report" className="w-full sm:w-auto">
            <CyberButton variant="red" size="lg" fullWidth>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Report Scammer</span>
            </CyberButton>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-6xl mx-auto mt-16 z-10 relative px-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Reports */}
          <div className="glass-panel card-glow-cyan rounded-2xl p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <Shield className="w-4 h-4 text-accent-cyan" />
              <span className="text-[11px] uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                Total Operations
              </span>
            </div>
            <span className="text-3xl md:text-4xl font-extrabold font-mono text-white text-glow-cyan">
              <StatCounter value={safeStats.totalReports} />
            </span>
            <span className="text-[11px] text-text-secondary font-sans">
              Reports Moderated
            </span>
          </div>

          {/* Total Scammers */}
          <div className="glass-panel card-glow-red rounded-2xl p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <ShieldAlert className="w-4 h-4 text-accent-red" />
              <span className="text-[11px] uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                Blacklisted Entities
              </span>
            </div>
            <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-red text-glow-red">
              <StatCounter value={safeStats.totalScammers} />
            </span>
            <span className="text-[11px] text-text-secondary font-sans">
              Fraudsters Flagged
            </span>
          </div>

          {/* Total Protected */}
          <div className="glass-panel card-glow-blue rounded-2xl p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <TrendingUp className="w-4 h-4 text-accent-blue" />
              <span className="text-[11px] uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                Registered Loss Sum
              </span>
            </div>
            <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-cyan text-glow-cyan">
              <StatCounter value={safeStats.totalProtected} prefix="₹" />
            </span>
            <span className="text-[11px] text-text-secondary font-sans">
              Fraud Prevented &amp; Logged
            </span>
          </div>

          {/* Verified Sellers */}
          <div className="glass-panel card-glow-green rounded-2xl p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <Users className="w-4 h-4 text-accent-green" />
              <span className="text-[11px] uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-h)' }}>
                Trusted Agents
              </span>
            </div>
            <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-green text-glow-green">
              <StatCounter value={safeStats.verifiedSellers} />
            </span>
            <span className="text-[11px] text-text-secondary font-sans">
              Verified Resellers
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}