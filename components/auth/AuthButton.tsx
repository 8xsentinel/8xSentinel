'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../lib/firebase/AuthContext';
import { getFirebaseAuth } from '../../lib/firebase/config';
import { X, User, LogOut, Shield, ChevronDown, Crown, Lock, Loader2, Sparkles } from 'lucide-react';

export default function AuthButton() {
  const { user, profile, isSuperAdmin, loading, isAuthenticating, signInWithGoogle, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleGoogle = async () => {
    if (isAuthenticating) return;
    setError('');
    try {
      await signInWithGoogle();
      setShowModal(false);

      if (typeof window !== 'undefined') {
        const auth = getFirebaseAuth();
        const currentEmail = auth?.currentUser?.email?.toLowerCase().trim();
        const isSuperAdminEmail = currentEmail === '8xsentinel@gmail.com';
        if (isSuperAdminEmail) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      console.error('Sign-in error details:', authError);

      if (
        authError?.code === 'auth/popup-closed-by-user' ||
        authError?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }

      if (authError?.code === 'auth/popup-blocked') {
        setError('The sign-in window was blocked by your browser. Please allow popups for localhost and try again.');
        return;
      }

      if (authError?.code === 'auth/unauthorized-domain') {
        setError('This domain (localhost) is not authorized in the Firebase Console.');
        return;
      }

      if (authError?.code === 'auth/network-request-failed') {
        setError('Unable to connect to Google Auth servers. Please check your internet connection.');
        return;
      }

      setError(authError?.message || 'Authentication could not be completed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-20 rounded-lg bg-white/5 animate-pulse" />
    );
  }

  // ─── Signed In: Avatar + Dropdown ───
  if (user) {
    const initials = (user.displayName || user.email || 'U')
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const isRegionalAdmin = profile?.role === 'regional_admin';
    const storeStatus = profile?.store_status || (profile as any)?.storeStatus;
    const userRole = profile?.role;

    const isApprovedReseller = userRole === 'verified_reseller' || storeStatus === 'approved';
    const isPending = storeStatus === 'pending';
    const isNotRegistered = storeStatus === 'not_registered' || !storeStatus;
    
    let statusText = 'Sentinel Verified';
    let statusColor = 'text-accent-green';
    
    if (isSuperAdmin) {
      statusText = 'Super Admin';
      statusColor = 'text-accent-red';
    } else if (isRegionalAdmin) {
      statusText = 'Reg. Admin';
      statusColor = 'text-accent-cyan';
    } else if (isApprovedReseller) {
      statusText = 'Sentinel Verified';
      statusColor = 'text-accent-cyan';
    } else if (isPending) {
      statusText = 'Pending Verification';
      statusColor = 'text-accent-amber';
    } else if (isNotRegistered) {
      statusText = 'Pending Setup';
      statusColor = 'text-accent-amber';
    }

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
        >
          {/* Avatar */}
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              referrerPolicy="no-referrer"
              className={`w-8 h-8 rounded-full border-2 object-cover ${
                isSuperAdmin ? 'border-accent-red/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-accent-cyan/40'
              }`}
            />
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 ${
              isSuperAdmin 
                ? 'bg-gradient-to-br from-accent-red to-accent-amber border-accent-red'
                : 'bg-gradient-to-br from-accent-cyan to-accent-blue border-accent-cyan/40'
            }`}>
              {initials}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-semibold text-white leading-tight truncate max-w-[120px]" style={{ fontFamily: 'var(--font-h)' }}>
              {user.displayName || user.email?.split('@')[0] || 'Operator'}
            </p>
            <p className={`text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>
              {statusText}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden sm:block" />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-60 glass-panel rounded-xl border border-white/10 shadow-2xl py-2 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-white truncate" style={{ fontFamily: 'var(--font-h)' }}>
                  {user.displayName || 'Agent'}
                </p>
                {isSuperAdmin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red border border-accent-red/40 font-mono font-bold">
                    ROOT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-secondary truncate">{user.email}</p>
            </div>
            
            <div className="py-1">
              {!(isSuperAdmin || isRegionalAdmin) && (
                <>
                  {isNotRegistered && (
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        window.location.href = '/dashboard';
                      }}
                      className="w-full text-left px-4 py-2 bg-accent-cyan/10 hover:bg-accent-cyan/20 flex items-center gap-2.5 transition-colors group"
                    >
                      <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
                      <span className="text-[13px] text-accent-cyan font-bold">Complete Onboarding</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      window.location.href = '/dashboard';
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-text-secondary" />
                    <span className="text-[13px] text-text-secondary hover:text-white font-medium">Dashboard</span>
                  </button>
                </>
              )}
              
              {(isSuperAdmin || isRegionalAdmin) && (
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    window.location.href = '/admin';
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                >
                  {isSuperAdmin ? (
                    <>
                      <Crown className="w-4 h-4 text-accent-red" />
                      <span className="text-[13px] text-accent-red font-bold">Super Admin Deck</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-accent-cyan" />
                      <span className="text-[13px] text-accent-cyan font-medium">Command Deck</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="border-t border-white/5 py-1 mt-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors group"
              >
                <LogOut className="w-4 h-4 text-accent-red group-hover:text-red-400" />
                <span className="text-[13px] text-accent-red group-hover:text-red-400 font-medium">Terminate Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Signed Out: Auth Buttons & Modal ───
  return (
    <>
      <div className="flex items-center">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-cyan px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] min-h-[34px] sm:min-h-[38px]"
          aria-label="Authenticate with Google"
        >
          <Lock className="w-3 h-3 text-white/90 shrink-0" />
          <span className="sm:hidden font-mono tracking-wider">LOGIN</span>
          <span className="hidden sm:inline font-mono tracking-wider">AUTHENTICATE</span>
        </button>
      </div>

      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
            onClick={() => !isAuthenticating && setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#0e1320] to-[#080a0f] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_0_80px_rgba(0,184,255,0.08)] animate-in fade-in zoom-in-95 duration-300">
            {/* Premium Top Glow Effect */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-60"></div>
            
            {/* Header */}
            <div className="p-8 pb-6 text-center relative z-10">
              {!isAuthenticating && (
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="relative w-20 h-20 mx-auto mb-6 mt-2">
                <div className="absolute inset-0 bg-accent-cyan/20 blur-[24px] rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-inner shadow-white/5">
                  <Shield className="w-10 h-10 text-accent-cyan drop-shadow-[0_0_12px_rgba(0,184,255,0.6)]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-h)' }}>
                System Access
              </h2>
              <p className="text-[13px] text-accent-cyan/80 mt-2 tracking-widest font-mono uppercase">
                Secure Terminal
              </p>
            </div>

            <div className="px-8 pb-10 space-y-7 relative z-10">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center font-medium shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  {error}
                </div>
              )}

              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-cyan rounded-xl blur ${isAuthenticating ? 'opacity-75 animate-pulse' : 'opacity-25 group-hover:opacity-50'} transition duration-500`}></div>
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={handleGoogle}
                  className={`relative w-full flex items-center justify-center gap-3 bg-[#0a0c12] ${isAuthenticating ? 'cursor-not-allowed opacity-80' : 'hover:bg-[#121622]'} text-white border border-white/10 py-4 rounded-xl font-bold text-[13px] tracking-wide transition-all duration-300`}
                  style={{ fontFamily: 'var(--font-h)' }}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-accent-cyan" />
                      <span className="tracking-widest text-accent-cyan">AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="tracking-widest">CONTINUE WITH GOOGLE</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-center gap-2">
                   <Lock className="w-3 h-3 text-text-muted" />
                   <p className="text-[10px] text-text-muted tracking-widest uppercase">
                     256-Bit Encrypted Connection
                   </p>
                </div>
                <p className="text-[9px] text-text-secondary/40 text-center leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide">
                  By authenticating, you agree to the Sentinel Network Security Protocol.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
