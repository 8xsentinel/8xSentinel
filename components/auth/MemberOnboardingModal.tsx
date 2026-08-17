'use client';

import React, { useState } from 'react';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/firebase/AuthContext';
import { toast } from 'sonner';
import { User, Phone, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { COUNTRY_CODES } from '../../lib/constants/countryCodes';

interface MemberOnboardingModalProps {
  onComplete: () => void;
}

export default function MemberOnboardingModal({ onComplete }: MemberOnboardingModalProps) {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.display_name || profile?.displayName || '');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState(profile?.whatsapp_username || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name or alias.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 6) {
      toast.error('Please enter a valid WhatsApp / Phone contact number.');
      return;
    }

    setSaving(true);
    try {
      const formattedContact = `${countryCode} ${phone.trim().replace(/\D/g, '')}`;
      if (profile?.id) {
        await db.updateMemberContact(profile.id, name.trim(), formattedContact);
        if (refreshProfile) {
          await refreshProfile();
        }
      }
      toast.success('Sentinel Member profile saved successfully!');
      onComplete();
    } catch (err: any) {
      console.error('Error saving member contact:', err);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0e1322] via-[#090c14] to-[#07090f] border border-accent-cyan/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.15)] space-y-6 overflow-hidden">
        {/* Glow Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-cyan opacity-80" />

        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center mx-auto text-accent-cyan shadow-[0_0_30px_rgba(6,182,212,0.25)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>
              Sentinel Member Onboarding
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Confirm your contact details to report scammers, track case resolutions, and receive community fraud recovery alerts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-text-secondary block mb-1.5 font-mono">
              Your Name / Alias *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan rounded-xl pl-10 pr-4 py-3 text-sm text-white font-sans focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-text-secondary block mb-1.5 font-mono">
              WhatsApp / Contact Number *
            </label>
            <div className="flex gap-2">
              <div className="w-[100px] shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="9876543210"
                  required
                  className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-1 font-sans">
              Used solely for incident filing verifications and recovery communications.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-cyan w-full py-3.5 text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.3)]"
            >
              <span>{saving ? 'SAVING PROFILE...' : 'COMPLETE ONBOARDING & ENTER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
