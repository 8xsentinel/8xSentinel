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
    totalReports: stats.totalReports ?? 0,
    totalScammers: stats.totalScammers ?? 0,
    totalProtected: stats.totalProtected ?? 0,
    verifiedSellers: stats.verifiedSellers ?? 0,
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 px-4 overflow-hidden cyber-grid border-b border-border-subtle/50 scanlines">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial-at-c from-accent-cyan/10 via-transparent to-transparent pointer-events-none z-0"></div>

      <div className="absolute top-1/4 left-10 w-72 h-72 bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent-blue/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Hero Content */}
      <div className="max-w-5xl mx-auto text-center space-y-10 z-10 relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2.5 bg-accent-cyan/5 border border-accent-cyan/30 text-accent-cyan px-5 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.25em] pulse-glow-cyan"
        >
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>BGMI CENTRAL REGISTRY & DEFI SHIELD</span>
        </motion.div>

        {/* Title */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-8xl font-extrabold tracking-tighter font-display uppercase leading-tight select-none"
          >
            Search Before <br />
            You{' '}
            <span className="text-transparent bg-clip-text bg-gradient-cyan text-glow-cyan">
              Deal.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-text-secondary font-sans max-w-2xl mx-auto leading-relaxed"
          >
            The ultimate gamer trust protocol for BGMI trading.
            Run instant verification searches on phone numbers,
            Telegram usernames, UPI IDs, and seller profiles
            before initiating transactions.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
        >
          <Link href="/search" className="w-full sm:w-auto">
            <CyberButton variant="cyan" size="lg" fullWidth>
              <Search className="w-4 h-4 text-glow-cyan" />
              <span>Verify Trader</span>
            </CyberButton>
          </Link>

          <Link href="/submit-report" className="w-full sm:w-auto">
            <CyberButton variant="red" size="lg" fullWidth>
              <FileSpreadsheet className="w-4 h-4" />
              <span>File Scam Log</span>
            </CyberButton>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-6xl mx-auto mt-20 z-10 relative px-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border-subtle/50 border border-border-subtle/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl clip-cyber">

          {/* Total Reports */}
          <div className="bg-[#050812]/90 p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Shield className="w-4 h-4 text-accent-cyan" />
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                Total Operations
              </span>
            </div>

            <span className="text-3xl md:text-4xl font-extrabold font-mono text-text-primary text-glow-cyan">
              <StatCounter value={safeStats.totalReports} />
            </span>

            <span className="text-[10px] text-text-secondary">
              Reports Moderated
            </span>
          </div>

          {/* Total Scammers */}
          <div className="bg-[#050812]/90 p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="flex items-center gap-1.5 text-text-muted">
              <ShieldAlert className="w-4 h-4 text-accent-red" />
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                Registry Target Blacklist
              </span>
            </div>

            <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-red text-glow-red">
              <StatCounter value={safeStats.totalScammers} />
            </span>

            <span className="text-[10px] text-text-secondary">
              Scammers Flagged
            </span>
          </div>

          {/* Total Protected */}
          <div className="bg-[#050812]/90 p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="flex items-center gap-1.5 text-text-muted">
              <TrendingUp className="w-4 h-4 text-accent-blue" />
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                Calculated Lost Sum
              </span>
            </div>

            <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-cyan text-glow-cyan">
              <StatCounter
                value={safeStats.totalProtected}
                prefix="₹"
              />
            </span>

            <span className="text-[10px] text-text-secondary">
              ₹ Damage Registered
            </span>
          </div>

          {/* Verified Sellers */}
          <div className="bg-[#050812]/90 p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Users className="w-4 h-4 text-accent-green" />
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                Trusted Agents
              </span>
            </div>

            <span className="text-3xl md:text-4xl font-extrabold font-mono text-accent-green text-glow-green flex items-center gap-1">
              <StatCounter value={safeStats.verifiedSellers} />
            </span>

            <span className="text-[10px] text-text-secondary">
              Verified Resellers
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}