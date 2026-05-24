'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { db } from '../../lib/db';
import { resellerSchema } from '../../lib/validators/resellerSchema';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle, 
  Info, 
  Briefcase, 
  Calendar,
  MessageSquare,
  Phone,
  Link as LinkIcon,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const Instagram = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
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

const Youtube = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
    <polygon points="9.75 15.02 15.5 11.54 9.75 8.06 9.75 15.02" />
  </svg>
);

export default function ApplyVerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [yearsActive, setYearsActive] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Specialties
  const [specialties, setSpecialties] = useState<string[]>([]);

  // Contact details
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');

  // Legal
  const [declaration, setDeclaration] = useState(false);
  const [appliedStoreId, setAppliedStoreId] = useState<string | null>(null);

  useEffect(() => {
    setUser(db.getCurrentUser());
  }, []);

  const handleSpecialtyToggle = (specId: string) => {
    setSpecialties(prev => 
      prev.includes(specId) 
        ? prev.filter(s => s !== specId) 
        : [...prev, specId]
    );
  };

  const handleNextStep = () => {
    // Validation per step
    if (step === 1) {
      if (storeName.trim().length < 3) {
        toast.error('Store name must be at least 3 characters.');
        return;
      }
      if (bio.trim().length < 20) {
        toast.error('Bio/Services description must be at least 20 characters describing your service.');
        return;
      }
      if (Number(yearsActive) < 0 || isNaN(Number(yearsActive)) || yearsActive.trim() === '') {
        toast.error('Years active must be 0 or more.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (specialties.length === 0) {
        toast.error('Please select at least one specialty focus area.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (telegram.trim().length < 3) {
        toast.error('Valid Telegram username is required (min 3 characters).');
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Session required. switch your role to an active user.');
      return;
    }

    if (!declaration) {
      toast.error('You must declare truthfulness compliance to complete application.');
      return;
    }

    const payload = {
      store_name: storeName,
      tagline: tagline || undefined,
      bio,
      years_active: Number(yearsActive),
      specializes_in: specialties,
      telegram_username: telegram,
      whatsapp_number: whatsapp || undefined,
      instagram_username: instagram || undefined,
      youtube_channel: youtube || undefined,
      price_range: priceRange || undefined
    };

    // Zod validation
    const validation = resellerSchema.safeParse(payload);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid application details.';
      toast.error(errorMsg);
      return;
    }

    try {
      const app = await db.applyForReseller(payload as any);
      if (app) {
        setAppliedStoreId(app.id);
        toast.success('Reseller Badge Application Submitted!', {
          description: 'Platform administrators will review your store credentials within 48 hours.'
        });
        setStep(5);
      } else {
        toast.error('Application submission failed. User session not active.');
      }
    } catch (err) {
      toast.error('Failed to submit application. Try again later.');
    }
  };

  const stepsHeader = [
    { label: 'Merchant Profile' },
    { label: 'Focus Areas' },
    { label: 'Contacts' },
    { label: 'Certification' }
  ];

  const availableSpecialties = [
    { id: 'account_sale', label: 'BGMI Account Sales', desc: 'Secure high-end OG account transfers' },
    { id: 'uc_topup', label: 'UC Top-up Packs', desc: 'Reliable direct character account credits' },
    { id: 'item_trading', label: 'Item / Skin Trades', desc: 'Skins, weapon materials, and custom cases' },
    { id: 'recovery', label: 'Account Recovery', desc: 'Help players reclaim compromised handles' }
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto py-12 px-4 space-y-8 font-mono text-xs">
        
        {/* Title Deck */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-accent-green animate-pulse" />
            <span>Apply Reseller Verification</span>
          </h1>
          <p className="text-text-secondary text-xs font-sans font-medium">
            Join the elite network. Build community trust, publish reviews, and showcase your certified escrow store status.
          </p>
        </div>

        {/* Dynamic step bar */}
        {step <= 4 && (
          <div className="flex justify-between items-center text-[10px] tracking-widest text-text-muted border-b border-border-subtle/50 pb-4">
            {stepsHeader.map((sh, idx) => {
              const active = idx + 1 === step;
              const completed = idx + 1 < step;
              return (
                <div key={idx} className="flex items-center gap-1">
                  <span className={`
                    w-5 h-5 rounded-full border flex items-center justify-center font-bold
                    ${active ? 'border-accent-green text-accent-green bg-accent-green/5' : ''}
                    ${completed ? 'border-accent-green text-accent-green bg-accent-green/5' : 'border-border-subtle'}
                  `}>
                    {idx + 1}
                  </span>
                  <span className={`hidden sm:inline ${active ? 'text-accent-green font-bold' : ''} ${completed ? 'text-accent-green' : ''}`}>
                    {sh.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* If no user session is present */}
        {!user && step <= 4 && (
          <div className="backdrop-blur-md bg-accent-amber/5 border border-accent-amber/20 rounded-xl p-6 text-center space-y-4">
            <Info className="w-12 h-12 text-accent-amber mx-auto animate-bounce" />
            <h2 className="text-base font-bold uppercase tracking-wider text-text-primary">Clearance Profile Required</h2>
            <p className="text-text-secondary font-sans leading-relaxed">
              Standard User Session required to file reseller verification badges. Switch your profile clearance in the top navigation bar header to begin.
            </p>
          </div>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-6">
            
            {/* STEP 1: Merchant details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-accent-green" />
                  <span>Step 1: Merchant Basics</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Store / Business Name *</label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      type="text"
                      placeholder="e.g. Apex BGMI Deals"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Tagline (Max 80 chars)</label>
                    <input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      type="text"
                      placeholder="e.g. Instant deliveries, fully verified middleman support"
                      maxLength={80}
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Years Active *</label>
                    <div className="relative flex items-center">
                      <input
                        value={yearsActive}
                        onChange={(e) => setYearsActive(e.target.value)}
                        type="number"
                        step="0.1"
                        placeholder="e.g. 1.5"
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-3 py-2 text-sm text-text-primary font-mono"
                        required
                      />
                      <Calendar className="absolute right-3 w-4 h-4 text-text-muted" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Price Range / Estimate</label>
                    <div className="relative flex items-center">
                      <input
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        type="text"
                        placeholder="e.g. ₹2,000 - ₹150,000"
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                      />
                      <DollarSign className="absolute right-3 w-4 h-4 text-text-muted" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Bio / Store Description * (Min 20 characters)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a detailed description of your store network, escrow/middleman compatibility, transaction speed guarantees, and refund policy."
                    className="w-full h-28 bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-3 py-2 text-sm text-text-primary font-sans resize-none leading-normal"
                    required
                  />
                  <span className="text-[9px] text-text-muted mt-1 block">Min 20 chars · Markdown not supported.</span>
                </div>
              </div>
            )}

            {/* STEP 2: Specialties */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                  Step 2: Specialties & Business Focus
                </h3>

                <div className="space-y-3">
                  <p className="text-text-secondary font-sans leading-normal text-xs mb-4">
                    Select the specific categories of trades that your store covers. Users will filter verified resellers based on these specialties.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableSpecialties.map((spec) => {
                      const selected = specialties.includes(spec.id);
                      return (
                        <div
                          key={spec.id}
                          onClick={() => handleSpecialtyToggle(spec.id)}
                          className={`
                            p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-start gap-3
                            ${selected 
                              ? 'border-accent-green bg-accent-green/5 shadow-glow-green/10' 
                              : 'border-border-subtle bg-white/[0.01] hover:border-border-subtle/80'}
                          `}
                        >
                          <div className={`
                            w-5 h-5 rounded border flex items-center justify-center font-bold text-[10px] mt-0.5
                            ${selected ? 'border-accent-green text-accent-green bg-bg-surface' : 'border-border-subtle text-transparent'}
                          `}>
                            ✓
                          </div>
                          <div>
                            <span className="font-bold text-text-primary uppercase text-xs font-mono">{spec.label}</span>
                            <p className="text-[10px] text-text-muted font-sans mt-0.5">{spec.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Contact */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                  Step 3: Contact Channels
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Telegram Handle * (For Customer Support)</label>
                    <div className="relative flex items-center">
                      <MessageSquare className="absolute left-3 w-4 h-4 text-sky-400" />
                      <span className="absolute left-9 text-text-muted text-sm font-bold">@</span>
                      <input
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                        type="text"
                        placeholder="telegram_handle"
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded pl-14 pr-3 py-2 text-sm text-text-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">WhatsApp Number (Optional)</label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3 w-4 h-4 text-emerald-400" />
                      <input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        type="tel"
                        placeholder="e.g. +91 99999-88888"
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded pl-10 pr-3 py-2 text-sm text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Instagram Page Name (Optional)</label>
                    <div className="relative flex items-center">
                      <Instagram className="absolute left-3 text-pink-400" />
                      <span className="absolute left-9 text-text-muted text-sm font-bold">@</span>
                      <input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                        type="text"
                        placeholder="insta_username"
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded pl-14 pr-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">YouTube Channel URL (Optional)</label>
                    <div className="relative flex items-center">
                      <Youtube className="absolute left-3 text-red-500" />
                      <input
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        type="url"
                        placeholder="https://youtube.com/c/yourchannel"
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded pl-10 pr-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review and Declaration */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                  Step 4: Review & Certification
                </h3>

                <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-border-subtle p-4 rounded text-xs">
                  <div>
                    <span className="text-text-muted block">Store Name:</span>
                    <span className="font-bold text-text-primary">{storeName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Price Range:</span>
                    <span className="font-bold text-accent-green">{priceRange || 'Open Range'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Years Active:</span>
                    <span className="font-bold text-text-primary">{yearsActive} years</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Primary Support:</span>
                    <span className="font-bold text-sky-400">@{telegram}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-muted block">Specialties:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {specialties.map(spec => (
                        <span key={spec} className="px-2 py-0.5 rounded border border-border-subtle bg-white/[0.02] uppercase text-[9px]">
                          {spec.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-muted block">Bio Outline:</span>
                    <p className="text-text-secondary font-sans leading-relaxed mt-1 line-clamp-3">{bio}</p>
                  </div>
                </div>

                {/* Captcha mock validation */}
                <div className="p-4 bg-white/[0.02] border border-border-subtle rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="captcha"
                      className="w-4 h-4 rounded border-border-subtle text-accent-green accent-accent-green cursor-pointer"
                      required
                    />
                    <label htmlFor="captcha" className="text-xs text-text-secondary font-mono cursor-pointer">
                      Verify you are human (Security Captcha Cloudflare Turnstile)
                    </label>
                  </div>
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">Turnstile Free Tier</span>
                </div>

                {/* Declaration compliance */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={declaration}
                    onChange={(e) => setDeclaration(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-border-subtle text-accent-green accent-accent-green mt-0.5 cursor-pointer"
                    required
                  />
                  <label htmlFor="declaration" className="text-xs text-text-secondary font-sans leading-normal cursor-pointer">
                    I declare that my BGMI trading catalog contains only legitimate account assets. I agree to operate in full escrow compliance and understand that verified middleman mediation will be used if demanded by a buyer. Fraudulent reports filed against me will be thoroughly reviewed.
                  </label>
                </div>
              </div>
            )}

            {/* Step buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-border-subtle/30">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step === 1}
                className="flex items-center gap-1.5 border border-border-subtle hover:border-accent-green/20 text-text-secondary hover:text-text-primary px-4 py-2 rounded text-xs uppercase font-mono transition-colors disabled:opacity-30 disabled:hover:border-border-subtle disabled:hover:text-text-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 bg-accent-green/15 border border-accent-green/30 text-accent-green hover:bg-accent-green hover:text-bg-void px-4.5 py-2.5 rounded text-xs font-bold uppercase transition-all duration-200"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-gradient-cyan hover:shadow-glow-cyan text-bg-void px-6 py-2.5 rounded text-xs font-bold uppercase transition-all"
                >
                  <span>Submit Application</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>
        )}

        {/* STEP 5: Success thank you view */}
        {step === 5 && (
          <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display uppercase tracking-widest text-text-primary">
                Application Received
              </h3>
              <p className="text-text-secondary text-xs font-sans max-w-sm mx-auto">
                Your merchant application has been successfully filed in the Command Deck clearance queue under serial code:
              </p>
              <p className="font-mono text-accent-green font-bold text-sm select-all">
                {appliedStoreId?.toUpperCase() || 'RESELLER-STORE'}
              </p>
            </div>

            <div className="p-4 bg-white/[0.01] border border-border-subtle rounded-lg text-xs max-w-md mx-auto flex items-start gap-3 text-left font-sans leading-relaxed">
              <Info className="w-4.5 h-4.5 text-accent-green shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold font-mono text-[10px] text-accent-green uppercase tracking-widest">Clearance Protocol:</p>
                <p className="text-text-muted text-xs">
                  Moderators will review your specialties, trading channels, and community reputation stats. Upon approval, your store will immediately receive its <strong className="text-text-primary font-mono">OG Verified Reseller Badge</strong>, appear in the public directory, and users will be cleared to submit reviews.
                </p>
              </div>
            </div>

            <div className="pt-4 flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => router.push('/resellers')}
                className="bg-accent-green text-bg-void hover:shadow-glow-green font-bold font-mono text-xs uppercase tracking-wider px-6 py-2.5 rounded transition-all"
              >
                Return Directory
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="bg-transparent border border-border-subtle hover:border-accent-green/30 text-text-secondary px-6 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
