'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import AuthButton from './AuthButton';
import StoreOnboardingModal from './StoreOnboardingModal';
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  Edit3,
  Lock,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'reseller';
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, profile, isSuperAdmin, loading, signOut, refreshProfile } = useAuth();
  const [storeApp, setStoreApp] = useState<TrustedReseller | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStoreApp = async () => {
    if (user && profile?.id) {
      const app = await db.getUserStoreApplication(profile.id);
      setStoreApp(app);
      return app;
    }
  };

  useEffect(() => {
    fetchStoreApp();
  }, [user, profile?.id]);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    if (user) {
      const updatedProfile = refreshProfile ? refreshProfile() : null;
      const profileId = updatedProfile?.id || profile?.id || '';
      const app = await db.getUserStoreApplication(profileId);
      setStoreApp(app);
      if (app?.verification_status === 'approved' || updatedProfile?.store_status === 'approved') {
        toast.success('Your store has been verified and approved!');
        window.location.reload();
      } else {
        toast.info('Status: Under Review', {
          description: `Still awaiting regional clearance for ${app?.state || 'your state'}.`
        });
      }
    }
    setTimeout(() => setRefreshing(false), 600);
  };

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
      <div className="container py-32 max-w-lg mx-auto text-center space-y-6 font-sans px-4">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#0e1320] to-[#07090f] border border-white/10 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(0,184,255,0.1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-cyan/10 blur-xl" />
          <ShieldAlert className="w-10 h-10 text-accent-cyan drop-shadow-[0_0_12px_rgba(0,184,255,0.5)] relative z-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-h)' }}>
            Access Denied
          </h2>
          <p className="text-text-secondary text-[13px] max-w-sm mx-auto leading-relaxed">
            Authentication is strictly required to view the global scammer registry, verify state merchants, or file fraud reports.
          </p>
        </div>
        <div className="pt-6 flex justify-center border-t border-white/5">
          <AuthButton />
        </div>
      </div>
    );
  }

  // 3. Super Admin & Regional Admin immediate clearance bypass
  const isRegionalAdmin = profile?.role === 'regional_admin' || profile?.roles?.includes('regional_admin');
  if (isSuperAdmin || isRegionalAdmin) {
    return <>{children}</>;
  }

  // 4. Determine Effective Merchant Clearance Status
  const effectiveStatus = storeApp?.verification_status || profile?.store_status;
  const isApproved = effectiveStatus === 'approved';
  const isPending = effectiveStatus === 'pending';
  const isRejected = effectiveStatus === 'rejected';
  const isNotRegistered = !isApproved && !isPending && !isRejected;

  // 5. Approved -> Pass Through
  if (isApproved && !showEditModal) {
    return <>{children}</>;
  }

  // 6. Store Not Registered -> Force Onboarding Modal
  if (isNotRegistered || showEditModal) {
    return (
      <div className="relative min-h-[60vh]">
        <StoreOnboardingModal
          onComplete={async () => {
            setShowEditModal(false);
            if (refreshProfile) refreshProfile();
            await fetchStoreApp();
          }}
        />
        <div className="filter blur-md pointer-events-none opacity-30">
          {children}
        </div>
      </div>
    );
  }

  // 7. Store Status is Pending or Rejected -> Show Dedicated Security Review Gate
  if (isPending || isRejected) {
    const currentState = storeApp?.state || profile?.state || 'Selected State';
    const currentRegion = storeApp?.region || profile?.region || 'India';

    return (
      <div className="container py-20 max-w-2xl mx-auto px-4 font-sans">
        <div className="bg-gradient-to-b from-[#0e1322] via-[#090c14] to-[#07090f] border border-accent-amber/30 rounded-2xl p-6 md:p-10 shadow-[0_0_60px_rgba(245,158,11,0.08)] space-y-6 text-center relative overflow-hidden">
          {/* Top Amber Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-amber to-transparent opacity-80" />

          <div className="w-20 h-20 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center mx-auto text-accent-amber shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            {isRejected ? <ShieldAlert className="w-10 h-10 text-accent-red" /> : <Clock className="w-10 h-10 animate-pulse" />}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-amber uppercase px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20 inline-block">
              {isRejected ? 'Application Declined' : 'Merchant Approval Pending'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase text-white tracking-wide" style={{ fontFamily: 'var(--font-h)' }}>
              {isRejected ? 'Store Verification Declined' : 'Store Application Under Review'}
            </h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
              {isRejected
                ? storeApp?.rejection_reason || 'Your store application was not approved by regional moderators. You may update and resubmit your application.'
                : `Your store profile has been submitted and is currently awaiting cryptographic clearance from the Root Super Admin or the Regional Admin of ${currentState}.`}
            </p>
          </div>

          {/* Registered Details Summary Card */}
          <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl text-left font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-text-muted flex items-center gap-1.5 font-sans">
                <Building2 className="w-3.5 h-3.5 text-accent-cyan" />
                Store Name:
              </span>
              <span className="text-white font-bold">{storeApp?.store_name}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-text-muted flex items-center gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-accent-amber" />
                Operating State:
              </span>
              <span className="text-accent-amber font-bold">{currentState} ({currentRegion})</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-text-muted flex items-center gap-1.5 font-sans">
                <UserCheck className="w-3.5 h-3.5 text-accent-green" />
                Primary Network:
              </span>
              <span className="text-accent-cyan font-bold capitalize">
                {storeApp?.primary_platform?.replace('_', ' ') || 'WhatsApp & Telegram'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-text-muted flex items-center gap-1.5 font-sans">
                Contact Channels:
              </span>
              <span className="text-text-secondary">
                {storeApp?.whatsapp_number && `WA: ${storeApp.whatsapp_number}`}
                {storeApp?.whatsapp_number && storeApp?.telegram_username && ' | '}
                {storeApp?.telegram_username && `TG: @${storeApp.telegram_username}`}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-text-muted font-sans">Submission Date:</span>
              <span className="text-text-muted">
                {storeApp?.created_at ? new Date(storeApp.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRefreshStatus}
              disabled={refreshing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent-cyan/15 hover:bg-accent-cyan/25 border border-accent-cyan/40 text-accent-cyan font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Check Verification Status</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Store Details</span>
            </button>

            <button
              onClick={() => signOut()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent-red/10 hover:bg-accent-red/20 border border-accent-red/30 text-accent-red font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Approved Store -> Full Access
  return <>{children}</>;
}
