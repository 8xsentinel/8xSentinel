'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import AuthButton from './AuthButton';
import UnifiedOnboardingModal from './UnifiedOnboardingModal';
import { isSentinel, isRegionalAdmin, isVerifiedReseller, isMember } from '../../lib/permissions';
import { 
  ShieldAlert, 
  Clock, 
  Lock, 
  UserCheck, 
  FileText,
  Search,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'sentinel' | 'admin' | 'verified_reseller' | 'member';
  title?: string;
  description?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireRole = 'member',
  title = 'Sentinel Clearance Required',
  description = 'Authentication is strictly required to access this section of 8xSentinel.'
}: ProtectedRouteProps) {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [showOnboard, setShowOnboard] = useState(false);

  const sentinel = isSentinel(profile, user?.email);
  const regionalAdmin = isRegionalAdmin(profile);
  const verifiedReseller = isVerifiedReseller(profile);
  const member = !sentinel && !regionalAdmin && !verifiedReseller;

  // Check if new user needs to choose role and complete onboarding
  useEffect(() => {
    if (user && profile && !sentinel && !regionalAdmin && !verifiedReseller && requireRole === 'member') {
      const isPlaceholderName = !profile.display_name || profile.display_name === 'Candidate' || profile.display_name === 'Sentinel Member';
      const hasNoContact = !profile.whatsapp_username;
      const isNotRegisteredStore = !profile.store_status || profile.store_status === 'not_registered';
      
      if ((isPlaceholderName || hasNoContact) && isNotRegisteredStore) {
        setShowOnboard(true);
      }
    }
  }, [user, profile, sentinel, regionalAdmin, verifiedReseller, requireRole]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="container py-32 text-center font-mono">
        <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(0,184,255,0.3)]" />
        <p className="text-sm text-text-muted animate-pulse">Verifying Cryptographic Clearance...</p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!user) {
    return (
      <div className="container py-24 max-w-lg mx-auto text-center space-y-6 font-sans px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-[#0e1320] to-[#07090f] border border-white/10 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(0,184,255,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-cyan/10 blur-xl" />
          <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-accent-cyan drop-shadow-[0_0_12px_rgba(0,184,255,0.5)] relative z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-h)' }}>
            {title}
          </h2>
          <p className="text-text-secondary text-xs sm:text-[13px] max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        </div>
        <div className="pt-4 flex justify-center border-t border-white/5">
          <AuthButton />
        </div>
      </div>
    );
  }

  // 3. Sentinel Root Admin immediate clearance bypass
  if (sentinel) {
    return <>{children}</>;
  }

  // 4. Admin Role Requirement Check
  if (requireRole === 'admin' || requireRole === 'sentinel') {
    if (!regionalAdmin && !sentinel) {
      return (
        <div className="container py-24 max-w-lg mx-auto text-center space-y-6 font-sans px-4">
          <div className="w-20 h-20 rounded-2xl bg-accent-red/10 border border-accent-red/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-10 h-10 text-accent-red" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-h)' }}>
            Administrator Access Only
          </h2>
          <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
            You must be an authenticated 8xSentinel Super Administrator or Regional Administrator to access the moderation deck.
          </p>
          <div className="pt-4">
            <Link href="/" className="btn btn-outline py-2.5 px-5 text-xs inline-flex items-center gap-2">
              <span>Return to Sentinel Hub</span>
            </Link>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // 5. Verified Reseller Role Requirement Check
  if (requireRole === 'verified_reseller') {
    if (!verifiedReseller && !regionalAdmin && !sentinel) {
      return (
        <div className="container py-24 max-w-xl mx-auto text-center space-y-6 font-sans px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#18120b] to-[#0a0704] border border-accent-amber/40 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-accent-amber/10 blur-xl" />
            <Lock className="w-9 h-9 text-accent-amber relative z-10" />
          </div>

          <div className="space-y-2">
            <div className="badge badge-amber mx-auto">
              B2B RESELLER NETWORK RESTRICTED
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-h)' }}>
              Verified Resellers Only
            </h2>
            <p className="text-text-secondary text-xs sm:text-[13px] max-w-md mx-auto leading-relaxed font-sans">
              The Verified Resellers Network and merchant profiles are exclusively accessible to Sentinel Verified Resellers and Administrators.
            </p>
            <p className="text-text-muted text-[11px] max-w-md mx-auto leading-relaxed font-sans pt-1">
              As a Sentinel Member, you have full access to search scammers, file fraud dispute reports, and track victim asset recoveries.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/submit-report" className="btn btn-red py-2.5 px-5 text-xs inline-flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4" />
              <span>Report a Scammer</span>
            </Link>
            <Link href="/search" className="btn btn-outline py-2.5 px-5 text-xs inline-flex items-center gap-2 font-mono">
              <Search className="w-4 h-4 text-accent-cyan" />
              <span>Search Database</span>
            </Link>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // 6. Member / Default Role (General authenticated user)
  return (
    <>
      {showOnboard && (
        <UnifiedOnboardingModal
          onComplete={() => {
            setShowOnboard(false);
          }}
        />
      )}
      {children}
    </>
  );
}
