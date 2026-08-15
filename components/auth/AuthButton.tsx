'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../lib/firebase/AuthContext';
import { X, Mail, Lock, User, LogOut, Shield, ChevronDown } from 'lucide-react';

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      setShowModal(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      setShowModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
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
              className="w-8 h-8 rounded-full border-2 border-accent-cyan/40 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-[11px] font-bold text-white border-2 border-accent-cyan/40">
              {initials}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-semibold text-white leading-tight truncate max-w-[120px]" style={{ fontFamily: 'var(--font-h)' }}>
              {user.displayName || user.email?.split('@')[0] || 'Operator'}
            </p>
            <p className="text-[9px] text-accent-cyan font-bold uppercase tracking-widest">Active</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden sm:block" />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl border border-white/10 shadow-2xl py-2 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-[13px] font-bold text-white truncate" style={{ fontFamily: 'var(--font-h)' }}>
                {user.displayName || 'Operator'}
              </p>
              <p className="text-[11px] text-text-secondary truncate">{user.email}</p>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-semibold" style={{ fontFamily: 'var(--font-h)' }}>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Signed Out: Login / Sign Up Buttons ───
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setIsSignUp(false); setShowModal(true); setError(''); }}
          className="btn btn-outline py-2 px-4 text-[11px]"
        >
          Login
        </button>
        <button
          onClick={() => { setIsSignUp(true); setShowModal(true); setError(''); }}
          className="btn btn-cyan py-2 px-4 text-[11px]"
        >
          Sign Up
        </button>
      </div>

      {/* Auth Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md mx-4 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-6 h-6 text-accent-cyan" />
                <span className="font-bold text-lg tracking-wider uppercase text-white" style={{ fontFamily: 'var(--font-h)' }}>
                  8x<span className="text-accent-cyan">Sentinel</span>
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 pb-2">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-h)' }}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-[13px] text-text-secondary mt-1">
                {isSignUp ? 'Join the trust network' : 'Sign in to continue'}
              </p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Google Button */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-[13px] hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                style={{ fontFamily: 'var(--font-h)' }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-text-secondary uppercase tracking-widest font-bold" style={{ fontFamily: 'var(--font-h)' }}>or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input-field pl-11"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pl-11"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-field pl-11"
                  />
                </div>

                {error && (
                  <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-cyan w-full justify-center py-3 text-[12px] disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              {/* Toggle Sign In / Sign Up */}
              <p className="text-center text-[12px] text-text-secondary">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-accent-cyan font-bold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
