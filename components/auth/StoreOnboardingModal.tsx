'use client';

import React, { useState } from 'react';
import { INDIAN_STATES } from '../../lib/constants/indiaStates';
import { COUNTRY_CODES, OPERATING_YEARS, PrimaryPlatform } from '../../lib/constants/countryCodes';
import { db } from '../../lib/db';
import { useAuth } from '../../lib/firebase/AuthContext';
import { toast } from 'sonner';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Check, 
  LogOut, 
  Calendar, 
  Link2, 
  User, 
  Users,
  Award,
  Crown,
  Zap,
  Tag,
  Flame,
  Gauge,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

const WhatsAppLogo = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TelegramLogo = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.562 8.161c-.18.847-.96 4.966-1.36 7.106-.17.904-.5 1.206-.82 1.236-.697.064-1.226-.46-1.9-.902-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.912.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 7.002-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.094.036.309.02.477Z"/>
  </svg>
);

const InstagramIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface StoreOnboardingModalProps {
  onComplete: () => void;
  initialData?: any;
}

export default function StoreOnboardingModal({ onComplete, initialData }: StoreOnboardingModalProps) {
  const { user, profile, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const rawWaNumber = initialData?.whatsappNumber || initialData?.whatsapp_number || '';
  const parsedCode = rawWaNumber.startsWith('+') ? rawWaNumber.split(' ')[0] : (initialData?.countryCode || initialData?.country_code || '+91');
  const parsedNumber = rawWaNumber.startsWith('+') ? rawWaNumber.split(' ').slice(1).join(' ') : rawWaNumber;

  // Form states
  const [storeName, setStoreName] = useState(initialData?.storeName || initialData?.store_name || '');
  const [selectedState, setSelectedState] = useState(initialData?.state || initialData?.region || profile?.state || profile?.region || 'Delhi (NCT)');
  const [primaryPlatform, setPrimaryPlatform] = useState<PrimaryPlatform>(initialData?.primaryPlatform || initialData?.primary_platform || 'whatsapp_primary');
  const [countryCode, setCountryCode] = useState(parsedCode || '+91');
  
  // WhatsApp specific states
  const [whatsappNumber, setWhatsappNumber] = useState(parsedNumber || '');
  const [whatsappUsername, setWhatsappUsername] = useState((initialData?.whatsappUsername || initialData?.whatsapp_username || '').replace('@', ''));
  const [whatsappGroupLink, setWhatsappGroupLink] = useState(initialData?.whatsappGroupLink || initialData?.whatsapp_group_link || '');

  // Telegram specific states
  const [telegramHandle, setTelegramHandle] = useState((initialData?.telegramUsername || initialData?.telegram_username || '').replace('@', ''));
  const [telegramChannelLink, setTelegramChannelLink] = useState(initialData?.telegramChannelLink || initialData?.telegram_channel_link || '');

  // General states
  const [operatingSince, setOperatingSince] = useState<number>(initialData?.operatingSinceYear || initialData?.operating_since_year || 2022);
  const [instagram, setInstagram] = useState((initialData?.instagramUsername || initialData?.instagram_username || '').replace('@', ''));
  const [specialties, setSpecialties] = useState<string[]>(initialData?.specializesIn || initialData?.specializes_in || ['budget_accounts', 'premium_accounts', 'uc_recharge']);

  const specialtyOptions = [
    { id: 'budget_accounts', label: 'Budget Accounts', icon: Tag, color: 'text-sky-400' },
    { id: 'premium_accounts', label: 'Premium Accounts', icon: Crown, color: 'text-amber-400' },
    { id: 'uc_recharge', label: 'UC Recharge', icon: Zap, color: 'text-emerald-400' },
    { id: 'xsuit_gifts', label: 'Xsuit Gifts', icon: Flame, color: 'text-purple-400' },
    { id: 'supercar_gifts', label: 'Supercar Gifts', icon: Gauge, color: 'text-rose-400' },
  ];

  const toggleSpecialty = (id: string) => {
    setSpecialties(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) 
        : [...prev, id]
    );
  };

  // Dynamic field visibility
  const isWhatsappActive = primaryPlatform !== 'telegram_only';
  const isTelegramActive = primaryPlatform !== 'whatsapp_only';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast.error('Store Name is required');
      return;
    }
    if (!selectedState) {
      toast.error('Please select your state of operation in India');
      return;
    }

    // Validation for WhatsApp
    if (isWhatsappActive) {
      if (!whatsappNumber.trim()) {
        toast.error('Official WhatsApp Number is required');
        return;
      }
      if (primaryPlatform === 'whatsapp_only' && !whatsappUsername.trim()) {
        toast.error('WhatsApp Username / Profile Name is required');
        return;
      }
    }

    // Validation for Telegram
    if (isTelegramActive) {
      if (!telegramHandle.trim()) {
        toast.error('Telegram Handle (@username) is required');
        return;
      }
      if (primaryPlatform === 'telegram_only' && !whatsappNumber.trim()) {
        toast.error('Contact Phone Number is required for merchant clearance');
        return;
      }
    }

    const formattedWhatsapp = whatsappNumber.trim() ? `${countryCode} ${whatsappNumber.trim()}` : undefined;
    const currentYear = new Date().getFullYear();
    const calculatedYearsActive = Math.max(1, currentYear - operatingSince);

    setSubmitting(true);
    try {
      const targetProfileId = profile?.id || (user?.email ? (await db.syncFirebaseUser(user.email, user.displayName || '', user.photoURL || ''))?.id : '');
      const res = await db.applyForReseller({
        profile_id: targetProfileId,
        store_name: storeName.trim(),
        state: selectedState,
        country_code: countryCode,
        primary_platform: primaryPlatform,
        whatsapp_number: formattedWhatsapp,
        whatsapp_username: whatsappUsername.trim().replace('@', '') || undefined,
        whatsapp_group_link: whatsappGroupLink.trim() || undefined,
        telegram_username: telegramHandle.trim().replace('@', '') || undefined,
        telegram_channel_link: telegramChannelLink.trim() || undefined,
        operating_since_year: Number(operatingSince),
        instagram_username: instagram.trim().replace('@', '') || undefined,
        years_active: calculatedYearsActive,
        bio: `Authorized BGMI merchant specializing in ${specialties.map(s => s.replace('_', ' ')).join(', ')}. Active since ${operatingSince}.`,
        specializes_in: specialties
      });

      if (res) {
        toast.success('Reseller Application Submitted', {
          description: `Routing to Root Admin and ${selectedState} Regional Admin for review.`
        });
        onComplete();
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (err) {
      toast.error('Error submitting reseller application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto font-sans">
      <div className="relative w-full max-w-2xl my-6 bg-[#090d16] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,184,255,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Subtle Top Gradient Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />

        {/* Modal Header */}
        <div className="p-6 md:p-7 border-b border-white/[0.08] relative bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  Verification Gateway
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Tier 1 / Clearance
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-h)' }}>
                Reseller Onboarding
              </h2>
              <p className="text-xs text-text-secondary">
                Configure your store parameters to obtain Sentinel Verified status.
              </p>
            </div>

            <button
              onClick={() => initialData ? onComplete() : signOut()}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-red font-mono px-3 py-1.5 rounded-lg border border-white/5 hover:border-accent-red/30 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{initialData ? 'Cancel Edit' : 'Sign Out'}</span>
            </button>
          </div>

          {/* Tier Protocol Banner */}
          <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3 text-xs text-text-secondary">
            <ShieldCheck className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-text-secondary leading-relaxed">
                Approval by your Regional Admin grants you the <span className="text-accent-cyan font-bold font-mono inline-flex items-center gap-1 align-text-bottom">Sentinel Verified <ShieldCheck className="w-3.5 h-3.5" /></span> credential. You may subsequently request the elite <span className="text-accent-amber font-bold font-mono inline-flex items-center gap-1 align-text-bottom">Sentinel Trusted <ShieldCheck className="w-3.5 h-3.5 fill-accent-amber/20" /></span> distinction via your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-6">
          
          {/* Section 1: Store Name & Indian State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Building2 className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Store / Trade Name *</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Apex BGMI Vault"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-accent-cyan/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>

            {/* Indian State Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Operating State (India) *</span>
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-[#0d121f] border border-white/10 focus:border-accent-cyan/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer appearance-none font-medium pr-10"
                >
                  <optgroup label="States (28)">
                    {INDIAN_STATES.filter(s => s.type === 'state').map((st) => (
                      <option key={st.code} value={st.name} className="bg-[#0d121f] text-white">
                        {st.name} ({st.region})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories (8)">
                    {INDIAN_STATES.filter(s => s.type === 'ut').map((st) => (
                      <option key={st.code} value={st.name} className="bg-[#0d121f] text-white">
                        {st.name} ({st.region})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section 2: In Business Since & Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* In Business Since */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-accent-green" />
                <span>In Business Since *</span>
              </label>
              <div className="relative">
                <select
                  value={operatingSince}
                  onChange={(e) => setOperatingSince(Number(e.target.value))}
                  className="w-full bg-[#0d121f] border border-white/10 focus:border-accent-cyan/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all cursor-pointer font-mono appearance-none pr-10"
                >
                  {OPERATING_YEARS.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#0d121f] text-white">
                      {yr} ({new Date().getFullYear() - yr > 0 ? `${new Date().getFullYear() - yr} yr(s) in trade` : 'Started this year'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Instagram (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram Handle (Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm font-mono">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                  placeholder="store_instagram"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-accent-cyan/60 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operating Network Channel Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between font-mono">
              <span>Operating Network *</span>
              <span className="text-[10px] text-text-muted">Direct Deal Protocol</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp Only */}
              <button
                type="button"
                onClick={() => setPrimaryPlatform('whatsapp_only')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  primaryPlatform === 'whatsapp_only'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400"><WhatsAppLogo /></span>
                    <span className="text-xs font-bold font-mono tracking-wide text-white">WhatsApp</span>
                  </div>
                  {primaryPlatform === 'whatsapp_only' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-2 leading-tight">
                  Exclusive operation via WhatsApp chats & groups
                </p>
              </button>

              {/* Telegram Only */}
              <button
                type="button"
                onClick={() => setPrimaryPlatform('telegram_only')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  primaryPlatform === 'telegram_only'
                    ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-[0_0_20px_rgba(14,165,233,0.15)]'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400"><TelegramLogo /></span>
                    <span className="text-xs font-bold font-mono tracking-wide text-white">Telegram</span>
                  </div>
                  {primaryPlatform === 'telegram_only' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-2 leading-tight">
                  Exclusive operation via Telegram channels & DMs
                </p>
              </button>

              {/* WhatsApp and Telegram */}
              <div
                onClick={() => {
                  if (primaryPlatform !== 'both' && primaryPlatform !== 'whatsapp_primary' && primaryPlatform !== 'telegram_primary') {
                    setPrimaryPlatform('both');
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  primaryPlatform === 'both' || primaryPlatform === 'whatsapp_primary' || primaryPlatform === 'telegram_primary'
                    ? 'bg-accent-amber/10 border-accent-amber/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400"><WhatsAppLogo /></span>
                    <span className="text-sky-400"><TelegramLogo /></span>
                    <span className="text-[10px] sm:text-xs font-bold font-mono tracking-wide text-white truncate">WhatsApp & Telegram</span>
                  </div>
                  {(primaryPlatform === 'both' || primaryPlatform === 'whatsapp_primary' || primaryPlatform === 'telegram_primary') && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-amber" />
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-2 leading-tight pointer-events-none">
                  Operating on both networks.
                </p>
              </div>
            </div>

            {(primaryPlatform === 'both' || primaryPlatform === 'whatsapp_primary' || primaryPlatform === 'telegram_primary') && (
              <div className="p-3.5 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.03] space-y-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] uppercase font-bold text-accent-amber mb-2 tracking-wider flex items-center justify-between">
                  <span>Select Primary Network (Most Active)</span>
                  <span className="text-[9px] text-accent-amber/60">Required</span>
                </p>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrimaryPlatform('whatsapp_primary'); }}
                    className={`flex-1 p-2 border rounded-lg text-[10px] uppercase font-mono font-bold text-center transition-all ${
                      primaryPlatform === 'whatsapp_primary' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-black/40 border-white/10 text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrimaryPlatform('telegram_primary'); }}
                    className={`flex-1 p-2 border rounded-lg text-[10px] uppercase font-mono font-bold text-center transition-all ${
                      primaryPlatform === 'telegram_primary' ? 'bg-sky-500/20 border-sky-500/40 text-sky-400' : 'bg-black/40 border-white/10 text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Telegram
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrimaryPlatform('both'); }}
                    className={`flex-1 p-2 border rounded-lg text-[10px] uppercase font-mono font-bold text-center transition-all ${
                      primaryPlatform === 'both' ? 'bg-accent-amber/20 border-accent-amber/40 text-accent-amber' : 'bg-black/40 border-white/10 text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Equal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Dynamic Contact Credentials */}

          {/* WhatsApp Credentials (if WhatsApp Active) */}
          {isWhatsappActive && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <WhatsAppLogo />
                  <span>WhatsApp Configuration</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80 uppercase">
                  {primaryPlatform === 'whatsapp_only' ? 'Primary Channel' : 'Network Synchronized'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* WhatsApp Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between font-mono">
                    <span>Official WhatsApp Number *</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-[105px] shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full bg-[#0d121f] border border-white/10 focus:border-emerald-500/60 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-mono"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={`${c.code}-${c.dial_code}`} value={c.dial_code} className="bg-[#0d121f] text-white">
                            {c.flag} {c.dial_code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9\s-]/g, ''))}
                      placeholder="9025391516"
                      className="flex-1 min-w-0 bg-white/[0.03] border border-white/10 focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* WhatsApp Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Username *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm font-mono">@</span>
                    <input
                      type="text"
                      required={primaryPlatform === 'whatsapp_only'}
                      value={whatsappUsername}
                      onChange={(e) => setWhatsappUsername(e.target.value.replace('@', ''))}
                      placeholder="maddy_bgmistore"
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-emerald-500/60 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Official Store Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Store on WhatsApp Group or Channel Link *</span>
                  </span>
                  <span className="text-[10px] text-text-muted">Public Group / Channel URL</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappGroupLink}
                  onChange={(e) => setWhatsappGroupLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/... or https://whatsapp.com/channel/..."
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Telegram Credentials (if Telegram Active) */}
          {isTelegramActive && (
            <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.02] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-sky-500/15 pb-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <TelegramLogo />
                  <span>Telegram Configuration</span>
                </span>
                <span className="text-[10px] font-mono text-sky-400/80 uppercase">
                  {primaryPlatform === 'telegram_only' ? 'Primary Channel' : 'Network Synchronized'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* If Telegram Only -> Require Contact Phone for KYC */}
                {primaryPlatform === 'telegram_only' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-sky-400" />
                      <span>Contact Mobile (Verification) *</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-[105px] shrink-0">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full bg-[#0d121f] border border-white/10 focus:border-sky-500/60 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-mono"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={`${c.code}-${c.dial_code}`} value={c.dial_code} className="bg-[#0d121f] text-white">
                              {c.flag} {c.dial_code}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        required
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9\s-]/g, ''))}
                        placeholder="9025391516"
                        className="flex-1 min-w-0 bg-white/[0.03] border border-white/10 focus:border-sky-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Telegram Handle */}
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Admin Telegram Handle *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value.replace('@', ''))}
                      placeholder="Admin_Telegram"
                      className="w-full bg-white/[0.03] border border-white/10 focus:border-sky-500/60 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Official Telegram Store Channel / Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Official Telegram Store Link *</span>
                  </span>
                  <span className="text-[10px] text-text-muted">Public Channel / Group</span>
                </label>
                <input
                  type="text"
                  required
                  value={telegramChannelLink}
                  onChange={(e) => setTelegramChannelLink(e.target.value)}
                  placeholder="https://t.me/store_official"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-sky-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Section 5: Trading Specializations */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between font-mono">
              <span>Trading Specialization *</span>
              <span className="text-[10px] text-text-muted">Select all active categories</span>
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {specialtyOptions.map((opt) => {
                const IconComponent = opt.icon;
                const checked = specialties.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSpecialty(opt.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
                      checked
                        ? 'bg-accent-cyan/10 border-accent-cyan/60 text-white shadow-[0_0_15px_rgba(0,184,255,0.12)]'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 mb-1.5 ${checked ? opt.color : 'text-gray-500'}`} />
                    <span className="text-xs font-medium tracking-tight font-mono">{opt.label}</span>
                    {checked && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono">
              <Clock className="w-3.5 h-3.5 text-accent-amber shrink-0" />
              <span>Regional clearance turnaround: 2 - 24 hours</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-cyan hover:shadow-[0_0_30px_rgba(0,184,255,0.35)] text-bg-void font-bold text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: 'var(--font-h)' }}
            >
              {submitting ? 'Submitting Credentials...' : 'Submit For Sentinel Verification →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
