'use client';

import React, { useState } from 'react';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/firebase/AuthContext';
import { toast } from 'sonner';
import { 
  Shield, 
  Building2, 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Crown, 
  MapPin, 
  Send
} from 'lucide-react';
import { COUNTRY_CODES } from '../../lib/constants/countryCodes';
import StoreOnboardingModal from './StoreOnboardingModal';

interface UnifiedOnboardingModalProps {
  onComplete: () => void;
}

export default function UnifiedOnboardingModal({ onComplete }: UnifiedOnboardingModalProps) {
  const { profile, user, refreshProfile } = useAuth();
  const [step, setStep] = useState<'select' | 'member' | 'reseller'>('select');
  const [submitting, setSubmitting] = useState(false);

  // --- Member form state ---
  const [memberName, setMemberName] = useState(profile?.display_name || profile?.displayName || user?.displayName || '');
  const [memberCountryCode, setMemberCountryCode] = useState('+91');
  const [memberPhone, setMemberPhone] = useState(profile?.whatsapp_username || '');

  // Handle Member Submit
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      toast.error('Please enter your full name or alias.');
      return;
    }
    if (!memberPhone.trim() || memberPhone.trim().length < 6) {
      toast.error('Please enter a valid WhatsApp / Phone contact number.');
      return;
    }

    setSubmitting(true);
    try {
      const formattedContact = `${memberCountryCode} ${memberPhone.trim().replace(/\D/g, '')}`;
      if (profile?.id) {
        await db.updateMemberContact(profile.id, memberName.trim(), formattedContact);
        if (refreshProfile) {
          await refreshProfile();
        }
      }
      toast.success('Sentinel Member registration completed!');
      onComplete();
    } catch (err: any) {
      console.error('Error saving member contact:', err);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If user selected Reseller, render the full, feature-rich StoreOnboardingModal!
  if (step === 'reseller') {
    return (
      <StoreOnboardingModal 
        onComplete={onComplete}
        onBack={() => setStep('select')}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 font-sans overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0e1322] via-[#090c14] to-[#07090f] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] space-y-6 my-8">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-amber to-accent-cyan opacity-80" />

        {/* ─── STEP 1: ROLE SELECTION ─── */}
        {step === 'select' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="badge badge-cyan mx-auto">
                ACCOUNT REGISTRATION
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>
                Select Your Role on <span className="g">8xSentinel</span>
              </h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                Choose how you will participate in the Central Scammer Registry and Trader Verification Network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Sentinel Member */}
              <button
                type="button"
                onClick={() => setStep('member')}
                className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/30 border border-white/10 hover:border-accent-cyan/60 transition-all duration-300 text-left space-y-4 group cursor-pointer hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan group-hover:scale-105 transition-transform">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide group-hover:text-accent-cyan transition-colors" style={{ fontFamily: 'var(--font-h)' }}>
                      Sentinel Member
                    </h3>
                    <p className="text-[11px] text-accent-cyan font-mono uppercase font-bold mt-0.5">
                      Buyer &bull; Victim &bull; Community
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Search suspected scammer identifiers, file fraud dispute reports with evidence, and track victim asset recovery claims.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-accent-cyan">
                  <span>Continue as Member</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Verified Reseller */}
              <button
                type="button"
                onClick={() => setStep('reseller')}
                className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-black/30 border border-white/10 hover:border-accent-amber/60 transition-all duration-300 text-left space-y-4 group cursor-pointer hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center text-accent-amber group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide group-hover:text-accent-amber transition-colors" style={{ fontFamily: 'var(--font-h)' }}>
                      Verified Reseller
                    </h3>
                    <p className="text-[11px] text-accent-amber font-mono uppercase font-bold mt-0.5">
                      Store Operator &bull; BGMI Merchant
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Apply for verified store listing in the B2B Resellers Network, state peer clearances, and escrow middleman partnerships.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-accent-amber">
                  <span>Apply as Reseller</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: MEMBER ONBOARDING FORM ─── */}
        {step === 'member' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs font-mono text-text-muted hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Account Type</span>
              </button>
              <span className="badge badge-cyan">MEMBER ONBOARDING</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>
                Sentinel Member Details
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Confirm your name and contact number to report scammers, track dispute statuses, and receive fraud recovery alerts.
              </p>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-text-secondary block mb-1.5 font-mono">
                  Your Full Name / Alias *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan rounded-xl pl-10 pr-4 py-3 text-sm text-white font-sans focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-text-secondary block mb-1.5 font-mono">
                  WhatsApp / Phone Contact *
                </label>
                <div className="flex gap-2">
                  <div className="w-[100px] shrink-0">
                    <select
                      value={memberCountryCode}
                      onChange={(e) => setMemberCountryCode(e.target.value)}
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan/60 rounded-xl px-2.5 py-3 text-xs text-white focus:outline-none transition-all cursor-pointer font-mono"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.code}-${c.dial_code}`} value={c.dial_code} className="bg-[#0d121f] text-white">
                          {c.flag} {c.dial_code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="tel"
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9876543210"
                      required
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-1 font-sans">
                  Used solely for incident filing verifications and dispute resolution notices.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-cyan w-full py-3.5 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.3)]"
                >
                  <span>{submitting ? 'SAVING PROFILE...' : 'COMPLETE ONBOARDING & ENTER'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
