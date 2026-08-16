'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LinkInput from '../../components/ui/LinkInput';
import { db } from '../../lib/db';
import { reportSchema } from '../../lib/validators/reportSchema';
import { EvidenceLink, ScamType } from '../../types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle, 
  Info,
  Award,
  Sparkles,
  Phone,
  Send,
  Lock,
  Gift,
  Handshake,
  DollarSign,
  UserCheck
} from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../lib/firebase/AuthContext';
import { COUNTRY_CODES } from '../../lib/constants/countryCodes';

export default function SubmitReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  // Form states - Step 1: Scammer
  const [scammerName, setScammerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [upi, setUpi] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bgmiUid, setBgmiUid] = useState('');

  // Step 2: Dynamic Incident Details
  const [scamType, setScamType] = useState<ScamType>('bank_account_freeze');
  const [amountLost, setAmountLost] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [accountUid, setAccountUid] = useState('');
  const [accountWorth, setAccountWorth] = useState('');
  const [accountHighlights, setAccountHighlights] = useState('');
  const [hasAdvancePayment, setHasAdvancePayment] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [itemPackDetails, setItemPackDetails] = useState('');
  const [targetUid, setTargetUid] = useState('');

  // Bank Freeze & Pullback specifics
  const [frozenBankName, setFrozenBankName] = useState('');
  const [cyberCellNoticeNo, setCyberCellNoticeNo] = useState('');
  const [pullbackMethod, setPullbackMethod] = useState('');

  // Step 3: Victim Details & Recovery Bounty
  const [victimCountryCode, setVictimCountryCode] = useState('+91');
  const [victimPhoneNumber, setVictimPhoneNumber] = useState('');
  const [victimTelegram, setVictimTelegram] = useState('');
  const [bountyPercent, setBountyPercent] = useState<number>(20);
  const [customBounty, setCustomBounty] = useState('');
  const [bountyAgreement, setBountyAgreement] = useState(true);
  
  // Step 4: Evidence
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([]);
  
  // Step 5: Review & Submit
  const [declaration, setDeclaration] = useState(false);

  // Captcha State
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    setUser(profile);
  }, []);

  // Generate new captcha when reaching step 5
  useEffect(() => {
    if (step === 5) {
      generateCaptcha();
    }
  }, [step]);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 20) + 3;
    const b = Math.floor(Math.random() * 15) + 2;
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaAnswer('');
    setCaptchaVerified(false);
    setCaptchaError(false);
  };

  const handleCaptchaCheck = (value: string) => {
    setCaptchaAnswer(value);
    setCaptchaError(false);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num === captchaA + captchaB) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
    }
  };

  const effectiveLossAmount = Number(amountLost) || Number(accountWorth) || 0;
  const effectiveBountyPercent = customBounty ? Number(customBounty) : bountyPercent;
  const calculatedBountyReward = Math.round((effectiveLossAmount * (effectiveBountyPercent || 0)) / 100);

  const handleNextStep = () => {
    if (step === 1) {
      if (!scammerName.trim()) {
        toast.error('Scammer Name or Alias is required.');
        return;
      }
      if (!(telegram.trim() || whatsapp.trim() || instagram.trim())) {
        toast.error('Please provide at least one contact channel (WhatsApp, Telegram, or Instagram) of the scammer.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (description.trim().length < 100) {
        toast.error(`Description must be at least 100 characters detailing the incident (Current: ${description.trim().length} chars).`);
        return;
      }
      if (effectiveLossAmount <= 0 || isNaN(effectiveLossAmount)) {
        toast.error('Please enter a valid amount lost or estimated account value.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!victimPhoneNumber.trim()) {
        toast.error('Please provide your WhatsApp / Phone number so recovery helpers can contact you.');
        return;
      }
      if (!bountyAgreement) {
        toast.error('Please confirm the recovery reward agreement.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      setCaptchaError(true);
      toast.error('Please solve the security verification to prove you are human.');
      return;
    }
    
    if (!declaration) {
      toast.error('You must confirm the truthfulness declaration before submitting.');
      return;
    }

    const formattedWhatsApp = whatsapp.trim()
      ? (whatsapp.startsWith('+') ? whatsapp.trim() : `${countryCode} ${whatsapp.trim()}`)
      : undefined;

    const formattedVictimPhone = victimPhoneNumber.trim()
      ? (victimPhoneNumber.startsWith('+') ? victimPhoneNumber.trim() : `${victimCountryCode} ${victimPhoneNumber.trim()}`)
      : undefined;

    const effectiveBgmiUid = accountUid.trim() || targetUid.trim() || bgmiUid.trim() || undefined;
    
    const additionalIdentifiers = {
      bank_account: bankAccount.trim() || undefined,
      frozen_bank_name: frozenBankName.trim() || undefined,
      cyber_cell_notice_no: cyberCellNoticeNo.trim() || undefined,
      pullback_method: pullbackMethod.trim() || undefined,
      account_worth: accountWorth.trim() || undefined,
      account_highlights: accountHighlights.trim() || undefined,
      item_pack_details: itemPackDetails.trim() || undefined,
      target_uid: targetUid.trim() || undefined,
      recovery_bounty_percentage: effectiveBountyPercent,
      recovery_bounty_amount: calculatedBountyReward,
      victim_telegram: victimTelegram.trim() || undefined,
      victim_whatsapp: formattedVictimPhone,
    };

    const payload = {
      reporter_id: profile?.id || undefined,
      scammer_name: scammerName,
      telegram_username: telegram || undefined,
      whatsapp_number: formattedWhatsApp,
      upi_id: upi || undefined,
      instagram_username: instagram || undefined,
      bgmi_uid: effectiveBgmiUid,
      additional_identifiers: additionalIdentifiers,
      scam_type: scamType,
      amount_lost: effectiveLossAmount,
      victim_phone_number: formattedVictimPhone,
      incident_date: incidentDate,
      description,
      evidence_links: evidenceLinks
    };

    // Validate using Zod schema
    const validation = reportSchema.safeParse(payload);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid form entry details.';
      toast.error(errorMsg);
      return;
    }

    try {
      const report = await db.submitReport(payload as any);
      setSubmittedReportId(report.id);
      toast.success('Scam report filed with Active Recovery Bounty!', {
        description: 'Sentinel administrators and peer resellers have been notified.'
      });
      setStep(6); // Success stage
    } catch (err: any) {
      console.error('Submit report error:', err);
      toast.error('Failed to submit report.', {
        description: err?.message || 'An unexpected error occurred. Please try again.'
      });
    }
  };

  const stepsHeader = [
    { label: 'Scammer' },
    { label: 'Incident' },
    { label: 'Recovery & Bounty' },
    { label: 'Evidence' },
    { label: 'Review' }
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 font-sans">
      {/* Header Title */}
      <div className="space-y-3">
        <div className="badge badge-red">
          FRAUD INCIDENT FILING & RECOVERY BOUNTY
        </div>
        <h1 
          className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3"
          style={{ fontFamily: 'var(--font-h)' }}
        >
          <ShieldAlert className="w-8 h-8 text-accent-red animate-pulse" />
          <span>File Scammer <span className="g-red">Report</span></span>
        </h1>
        <p className="text-text-secondary text-xs font-sans font-medium">
          Help protect the community and set an active recovery bounty for anyone who assists in freezing or retrieving your assets.
        </p>
      </div>

      {/* Steps Breadcrumb */}
      {step <= 5 && (
        <div className="flex justify-between items-center text-[10px] tracking-widest text-text-muted border-b border-white/10 pb-4 overflow-x-auto gap-2">
          {stepsHeader.map((sh, idx) => {
            const active = idx + 1 === step;
            const completed = idx + 1 < step;
            return (
              <div key={idx} className="flex items-center gap-1.5 shrink-0">
                <span className={`
                  w-5 h-5 rounded-full border flex items-center justify-center font-bold text-[10px] font-mono
                  ${active ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/10' : ''}
                  ${completed ? 'border-accent-green text-accent-green bg-accent-green/10' : 'border-border-subtle'}
                `}>
                  {idx + 1}
                </span>
                <span className={`hidden sm:inline ${active ? 'text-accent-cyan font-bold font-mono' : ''} ${completed ? 'text-accent-green font-mono' : ''}`}>
                  {sh.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-2xl p-4 sm:p-6 space-y-6 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        
        {/* STEP 1: Scammer Identity */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-2">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider font-mono">
                Step 1: Scammer Identifiers
              </h3>
              <span className="text-[10px] text-text-muted font-mono uppercase">WhatsApp OR Telegram Required</span>
            </div>
            
            <div>
              <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1 font-mono">Scammer Name / Alias *</label>
              <input
                value={scammerName}
                onChange={(e) => setScammerName(e.target.value)}
                type="text"
                placeholder="e.g. Sahil Trader / Fake ESCROW"
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-text-primary"
                required
              />
            </div>

            {/* Primary Fraud Channels Highlight */}
            <div className="p-4 rounded-xl bg-accent-cyan/[0.03] border border-accent-cyan/20 space-y-4">
              <div className="text-[11px] text-accent-cyan font-bold font-mono uppercase flex items-center gap-1.5">
                <span>📱 Contact Channels (Fill WhatsApp, Telegram, or Instagram)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1 font-mono">
                    WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-[100px] shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full bg-bg-surface border border-border-subtle focus:border-emerald-500/60 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-mono"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={`${c.code}-${c.dial_code}`} value={c.dial_code} className="bg-[#0d121f] text-white">
                            {c.flag} {c.dial_code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                      type="tel"
                      placeholder="9876217741"
                      className="flex-1 min-w-0 bg-bg-surface border border-border-subtle focus:border-emerald-500/50 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-text-primary font-mono"
                    />
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block">Leave empty if scammed on Telegram/IG</span>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1 font-mono">
                    Telegram Username
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-muted text-sm font-mono">@</span>
                    <input
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                      type="text"
                      placeholder="username"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-sky-500/50 focus:outline-none rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-text-primary font-mono"
                    />
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block">Leave empty if scammed on WhatsApp/IG</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1 font-mono">
                    Instagram Username / Handle
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-muted text-sm font-mono">@</span>
                    <input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                      type="text"
                      placeholder="insta_profile"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-pink-500/50 focus:outline-none rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-text-primary font-mono"
                    />
                  </div>
                  <span className="text-[9px] text-text-muted mt-1 block">Leave empty if not applicable</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/[0.01] border border-border-subtle rounded-xl text-xs text-text-muted font-sans leading-relaxed">
              Provide as many identifiers as possible. The system will cross-reference this information to group multiple reports against the same scammer automatically across India.
            </div>
          </div>
        )}

        {/* STEP 2: Incident & Loss Details */}
        {step === 2 && (
          <div className="space-y-6 font-mono">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-2">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider">
                Step 2: Incident & Scam Loss Details
              </h3>
              <span className="text-[10px] text-text-muted uppercase">Context Adaptive Fields</span>
            </div>

            {/* Scam Category Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-text-secondary uppercase tracking-widest block font-mono">
                Select Fraud / Scam Category *
              </label>
              <select
                value={scamType}
                onChange={(e) => setScamType(e.target.value as any)}
                className="w-full bg-[#0d121f] border border-white/15 focus:border-accent-cyan rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none transition-all cursor-pointer font-sans"
              >
                <option value="bank_account_freeze">🏦 Bank Account Freeze / Cyber Cell Lien (Tainted Money Scam)</option>
                <option value="account_pullback">🔄 BGMI Account Pullback (Retrieved via 7-Day Recovery After Sale)</option>
                <option value="fake_account_sale">🎮 BGMI Account Sale / Account Theft</option>
                <option value="fake_buyer">👤 Fake Buyer (Fake UTR / Spoofed Payment Screenshot)</option>
                <option value="advance_payment">🏃 Advance Payment Ghosting (Took Token & Blocked)</option>
                <option value="impersonation">🎭 Fake Middleman / Cloned Admin Group Impersonation</option>
                <option value="item_scam">⚡ Carding / Negative UC Ban / Fake Item Gift</option>
                <option value="payment_fraud">💸 Payment Fraud (Direct Money / UPI Scam)</option>
                <option value="qr_phishing">📲 QR Code Phishing ("Scan to Receive Money" Fraud)</option>
                <option value="other">⚠️ Other Cyber Fraud</option>
              </select>
            </div>

            {/* DYNAMIC SECTION: Bank Account Freeze / Cyber Cell Lien */}
            {scamType === 'bank_account_freeze' && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/30 to-transparent border border-red-500/40 space-y-4 animate-in fade-in duration-200 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <span>🏦 Frozen Bank Account & Cyber Lien Specifications</span>
                  </span>
                  <span className="text-[9px] text-red-300 font-bold bg-red-500/15 px-2.5 py-0.5 rounded border border-red-500/40 uppercase font-mono">
                    Bank Lien / Frozen
                  </span>
                </div>

                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  Occurs when a fraudster transfers tainted/stolen funds into your bank account or UPI, causing the Cyber Cell or Bank to place a total lien/debit freeze on your funds.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Total Amount Put on Lien / Frozen Balance (INR) *
                    </label>
                    <input
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      type="number"
                      placeholder="e.g. 50000"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-red-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Your Frozen Bank Name & Last 4 Digits *
                    </label>
                    <input
                      value={frozenBankName}
                      onChange={(e) => setFrozenBankName(e.target.value)}
                      type="text"
                      placeholder="e.g. HDFC Bank (A/c ending 4920)"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-red-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Scammer / Tainted Sender UPI ID or VPA *
                    </label>
                    <input
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      type="text"
                      placeholder="e.g. tainted_sender@okaxis"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-red-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Cyber Cell Notice / NCRP Ref No. (If provided by bank)
                    </label>
                    <input
                      value={cyberCellNoticeNo}
                      onChange={(e) => setCyberCellNoticeNo(e.target.value)}
                      type="text"
                      placeholder="e.g. Cyber Crime Ahmedabad - NCRP #318291..."
                      className="w-full bg-bg-surface border border-border-subtle focus:border-red-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC SECTION: Account Pullback */}
            {scamType === 'account_pullback' && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-transparent border border-amber-500/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <span>🔄 BGMI Account Pullback / Post-Sale Retrieval</span>
                  </span>
                  <span className="text-[9px] text-amber-300 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/40 uppercase font-mono">
                    Pullback Scam
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Retrieved / Pulled-back BGMI Character UID *
                    </label>
                    <input
                      value={accountUid}
                      onChange={(e) => setAccountUid(e.target.value.replace(/[^0-9]/g, ''))}
                      type="text"
                      placeholder="e.g. 5567891234"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-amber-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Account Value / Price Paid (INR) *
                    </label>
                    <input
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      type="number"
                      placeholder="e.g. 25000"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-amber-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Pullback / Retrieval Method (e.g. 7-day Krafton Claim, Google Recovery)
                    </label>
                    <input
                      value={pullbackMethod}
                      onChange={(e) => setPullbackMethod(e.target.value)}
                      type="text"
                      placeholder="e.g. Seller submitted 7-day recovery claim via original Google email after 5 days of trade"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-amber-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC SECTION: QR Code Phishing */}
            {scamType === 'qr_phishing' && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/20 to-transparent border border-rose-500/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <span>📲 QR Code "Scan to Receive" Scam</span>
                  </span>
                  <span className="text-[9px] text-rose-300 font-bold bg-rose-500/15 px-2.5 py-0.5 rounded border border-rose-500/40 uppercase font-mono">
                    Phishing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Amount Debited / Lost (INR) *
                    </label>
                    <input
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      type="number"
                      placeholder="e.g. 10000"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-rose-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Scammer Merchant Name / QR VPA (Paid To) *
                    </label>
                    <input
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      type="text"
                      placeholder="e.g. payment_gateway_fraud@paytm"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-rose-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC SECTION A: Lost Account Details */}
            {(scamType === 'fake_account_sale' || scamType === 'fake_buyer' || scamType === 'impersonation') && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-sky-950/20 to-transparent border border-sky-500/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎮 Lost BGMI Account Specifications</span>
                  </span>
                  <span className="text-[9px] text-sky-300 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 uppercase">
                    Account Loss
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Stolen / Target BGMI Character UID *
                    </label>
                    <input
                      value={accountUid}
                      onChange={(e) => setAccountUid(e.target.value.replace(/[^0-9]/g, ''))}
                      type="text"
                      placeholder="e.g. 5567891234"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-sky-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Estimated Account Value / Worth (INR) *
                    </label>
                    <input
                      value={accountWorth}
                      onChange={(e) => setAccountWorth(e.target.value)}
                      type="number"
                      placeholder="e.g. 15000"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-sky-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Account Highlights / Key Mythics & Gun Labs (Optional)
                    </label>
                    <input
                      value={accountHighlights}
                      onChange={(e) => setAccountHighlights(e.target.value)}
                      type="text"
                      placeholder="e.g. Level 74, Glacier M4 Lv.7, 3 X-Suits, Fool M4"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-sky-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                    />
                  </div>
                </div>

                {/* Toggle for Advance Money Sent */}
                <div className="pt-2 border-t border-sky-500/10">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      checked={hasAdvancePayment}
                      onChange={(e) => setHasAdvancePayment(e.target.checked)}
                      className="w-4 h-4 rounded border-border-subtle text-accent-cyan accent-accent-cyan cursor-pointer"
                    />
                    <span>Did you also send advance money / payment to the scammer?</span>
                  </label>

                  {hasAdvancePayment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-sky-500/10 animate-in fade-in duration-200">
                      <div>
                        <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Advance Amount Paid (INR)</label>
                        <input
                          value={amountLost}
                          onChange={(e) => setAmountLost(e.target.value)}
                          type="number"
                          placeholder="₹ Paid"
                          className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Scammer UPI ID</label>
                        <input
                          value={upi}
                          onChange={(e) => setUpi(e.target.value)}
                          type="text"
                          placeholder="e.g. scammer@ybl"
                          className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DYNAMIC SECTION B: Financial / UPI / Advance Payment Fraud */}
            {(scamType === 'payment_fraud' || scamType === 'advance_payment') && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/20 to-transparent border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💸 Financial & Transaction Details</span>
                  </span>
                  <span className="text-[9px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                    Money Paid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Total Amount Lost (INR) *
                    </label>
                    <input
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      type="number"
                      placeholder="e.g. 5000"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-emerald-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Scammer UPI ID / VPA (Paid To) *
                    </label>
                    <input
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      type="text"
                      placeholder="e.g. scammer@ybl / scammer@paytm"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-emerald-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Scammer Bank Account Number & IFSC (If Paid via Bank Transfer)
                    </label>
                    <input
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      type="text"
                      placeholder="e.g. SBI A/c 38491029384, IFSC: SBIN0001234, Name: Rajesh"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-emerald-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC SECTION C: UC Recharge & In-Game Gift Scam */}
            {scamType === 'item_scam' && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/20 to-transparent border border-purple-500/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ UC Recharge & Gift Transaction Details</span>
                  </span>
                  <span className="text-[9px] text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 uppercase">
                    Item Fraud
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Promised UC Pack / In-Game Item *
                    </label>
                    <input
                      value={itemPackDetails}
                      onChange={(e) => setItemPackDetails(e.target.value)}
                      type="text"
                      placeholder="e.g. 8,100 UC Pack / Lamborghini Skin"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-purple-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Amount Paid (INR) *
                    </label>
                    <input
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      type="number"
                      placeholder="e.g. 3200"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-purple-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Scammer UPI ID (Paid To)
                    </label>
                    <input
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      type="text"
                      placeholder="e.g. scammer@paytm"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-purple-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                      Your Receiver BGMI UID (where item was promised)
                    </label>
                    <input
                      value={targetUid}
                      onChange={(e) => setTargetUid(e.target.value.replace(/[^0-9]/g, ''))}
                      type="text"
                      placeholder="e.g. 5123456789"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-purple-500/60 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC SECTION D: Other Frauds */}
            {scamType === 'other' && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Amount Lost (INR) *</label>
                    <input
                      value={amountLost}
                      onChange={(e) => setAmountLost(e.target.value)}
                      type="number"
                      placeholder="₹ Lost"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Scammer UPI ID / VPA</label>
                    <input
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      type="text"
                      placeholder="e.g. scammer@ybl"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Scammer Bank Account / IFSC (If any)</label>
                    <input
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      type="text"
                      placeholder="Bank details"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common Field: Incident Date */}
            <div>
              <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1 font-mono">Incident Date *</label>
              <input
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                type="date"
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-text-secondary uppercase tracking-widest block font-mono">
                  Chronological Incident Description * (Min 100 characters)
                </label>
                <span className={`text-[10px] font-bold font-mono ${description.length >= 100 ? 'text-accent-green' : 'text-text-muted'}`}>
                  {description.length}/100 chars
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain exactly how the scam took place, where you contacted the scammer, what terms were agreed, and what happened after payment. Be specific."
                className="w-full h-32 bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl p-3.5 text-sm text-text-primary font-sans leading-normal resize-none"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 3: Victim Details & Community Recovery Bounty */}
        {step === 3 && (
          <div className="space-y-6 font-mono">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-2">
              <h3 className="text-sm font-bold text-accent-amber uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-amber" />
                <span>Step 3: Victim Recovery & Community Bounty</span>
              </h3>
              <span className="text-[10px] text-accent-amber font-mono uppercase bg-accent-amber/10 px-2 py-0.5 rounded border border-accent-amber/30">
                Reward Scheme
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-accent-amber/[0.04] border border-accent-amber/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-amber">
                <Sparkles className="w-4 h-4" />
                <span>How the Sentinel Recovery Network Works</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                If a verified reseller, regional administrator, or cyber investigator freezes this scammer's bank accounts, intercepts their trade, or recovers your stolen account, they will contact you directly to return your assets.
              </p>
            </div>

            {/* Victim Contact Channels */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Your Direct Contact Channels (For Helpers to Reach You)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                    Your WhatsApp Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="w-[100px] shrink-0">
                      <select
                        value={victimCountryCode}
                        onChange={(e) => setVictimCountryCode(e.target.value)}
                        className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan/60 rounded-xl px-2 py-2.5 text-xs text-white focus:outline-none transition-all cursor-pointer font-mono"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={`${c.code}-${c.dial_code}`} value={c.dial_code} className="bg-[#0d121f] text-white">
                            {c.flag} {c.dial_code}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      value={victimPhoneNumber}
                      onChange={(e) => setVictimPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      type="tel"
                      placeholder="9876543210"
                      className="flex-1 min-w-0 bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-text-primary font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">
                    Your Telegram Username (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-muted text-sm font-mono">@</span>
                    <input
                      value={victimTelegram}
                      onChange={(e) => setVictimTelegram(e.target.value.replace('@', ''))}
                      type="text"
                      placeholder="your_handle"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-sky-500/50 focus:outline-none rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-text-primary font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recovery Bounty Percentage Offer */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-amber flex items-center gap-2">
                    <Award className="w-4 h-4 text-accent-amber" />
                    <span>Set Recovery Bounty Reward (%)</span>
                  </span>
                  <p className="text-[11px] text-text-secondary font-sans mt-0.5">
                    Percentage of recovered amount you pledge to reward the helper/investigator.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-accent-amber font-mono">{effectiveBountyPercent}%</span>
                  <span className="text-[10px] text-text-muted block font-mono">Pledged Reward</span>
                </div>
              </div>

              {/* Quick Percent Buttons */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[10, 20, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => { setBountyPercent(pct); setCustomBounty(''); }}
                    className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                      effectiveBountyPercent === pct && !customBounty
                        ? 'bg-accent-amber/20 border-accent-amber text-accent-amber shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Live Bounty Calculation Banner */}
              <div className="p-4 rounded-xl bg-black/40 border border-accent-amber/30 flex items-center justify-between gap-4">
                <div className="space-y-0.5 font-mono">
                  <span className="text-[10px] text-text-muted uppercase">Loss Claim: ₹{effectiveLossAmount.toLocaleString('en-IN')}</span>
                  <p className="text-sm font-bold text-white">
                    🎯 Bounty Payout: <span className="text-accent-amber">₹{calculatedBountyReward.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <div className="text-[11px] text-accent-amber font-bold font-mono uppercase bg-accent-amber/10 px-3 py-1.5 rounded-lg border border-accent-amber/30 shrink-0">
                  {effectiveBountyPercent}% REWARD
                </div>
              </div>

              {/* Bounty Terms Agreement */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="bountyAgreement"
                  checked={bountyAgreement}
                  onChange={(e) => setBountyAgreement(e.target.checked)}
                  className="w-4 h-4 rounded border-border-subtle text-accent-amber accent-accent-amber mt-0.5 cursor-pointer"
                  required
                />
                <label htmlFor="bountyAgreement" className="text-xs text-text-secondary font-sans leading-relaxed cursor-pointer">
                  I agree that if an authorized agent or reseller recovers my lost ₹{effectiveLossAmount.toLocaleString('en-IN')} or retrieves my BGMI account, I will honor this {effectiveBountyPercent}% (₹{calculatedBountyReward.toLocaleString('en-IN')}) recovery reward upon verification.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Evidence Proof References */}
        {step === 4 && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-2">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider">
                Step 4: Evidence Proof Reference
              </h3>
              <span className="text-[10px] text-text-muted uppercase">Links & Screenshots</span>
            </div>

            <p className="text-xs text-text-secondary font-sans">
              Provide public links to screenshots, chat exports, payment receipts, or screen recordings (Imgur, Postimages, Google Drive, YouTube, Telegram message links).
            </p>

            <LinkInput links={evidenceLinks} onChange={setEvidenceLinks} />
          </div>
        )}

        {/* STEP 5: Review & Final Filing */}
        {step === 5 && (
          <div className="space-y-5 text-sm font-mono">
            <div className="flex items-center justify-between border-b border-border-subtle/30 pb-2">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider">
                Step 5: Review File Details & Bounty Seal
              </h3>
              <span className="text-[10px] text-accent-green uppercase font-bold">READY TO TRANSMIT</span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-border-subtle p-5 rounded-2xl text-xs space-y-1">
              <div>
                <p className="text-text-muted">Target Scammer:</p>
                <p className="font-bold text-white text-sm">{scammerName}</p>
              </div>
              <div>
                <p className="text-text-muted">Incident Type:</p>
                <p className="font-bold text-accent-cyan uppercase">{scamType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-text-muted">Total Loss Impacted:</p>
                <p className="font-bold text-accent-red font-mono text-sm">₹{effectiveLossAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted">Recovery Bounty Offer:</p>
                <p className="font-bold text-accent-amber font-mono text-sm">
                  {effectiveBountyPercent}% (₹{calculatedBountyReward.toLocaleString('en-IN')})
                </p>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/5">
                <p className="text-text-muted">Scammer Channels:</p>
                <p className="text-text-secondary mt-0.5 font-mono">
                  {[
                    whatsapp && `WA: ${whatsapp}`,
                    telegram && `TG: @${telegram}`,
                    instagram && `IG: @${instagram}`
                  ].filter(Boolean).join(' | ') || 'None'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted">Specific Loss Details:</p>
                <p className="text-text-secondary mt-0.5 font-mono">
                  {[
                    frozenBankName && `Frozen Bank: ${frozenBankName}`,
                    cyberCellNoticeNo && `Cyber Ref: ${cyberCellNoticeNo}`,
                    accountUid && `Stolen/Target UID: ${accountUid}`,
                    accountWorth && `Account Worth: ₹${accountWorth}`,
                    pullbackMethod && `Pullback Method: ${pullbackMethod}`,
                    itemPackDetails && `Item: ${itemPackDetails}`,
                    upi && `Scammer UPI: ${upi}`,
                    bankAccount && `Scammer Bank: ${bankAccount}`
                  ].filter(Boolean).join(' | ') || 'None'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted">Victim Contact for Recovery:</p>
                <p className="text-emerald-400 font-bold mt-0.5 font-mono">
                  WhatsApp: {victimPhoneNumber ? `${victimCountryCode} ${victimPhoneNumber}` : 'Not provided'}
                  {victimTelegram && ` | TG: @${victimTelegram}`}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-text-muted">Evidence References Attached:</p>
                <p className="text-text-secondary font-mono">
                  {evidenceLinks.length > 0 ? `${evidenceLinks.length} references provided` : 'No references attached (Recommended)'}
                </p>
              </div>
            </div>

            {/* Human Verification Captcha */}
            <div className={`p-4 rounded-xl border transition-all ${
              captchaVerified 
                ? 'bg-emerald-950/20 border-emerald-500/40' 
                : captchaError 
                  ? 'bg-red-950/20 border-red-500/40 animate-shake' 
                  : 'bg-white/[0.02] border-border-subtle'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${captchaVerified ? 'text-emerald-400' : 'text-accent-cyan'}`} />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Human Verification
                  </span>
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-mono font-bold ${
                  captchaVerified ? 'text-emerald-400' : 'text-text-muted'
                }`}>
                  {captchaVerified ? '✅ Verified' : 'Required'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Math Challenge Display */}
                <div className="flex items-center gap-2.5 bg-black/50 border border-white/15 rounded-xl px-4 py-3 select-none">
                  <span className="text-2xl font-bold text-accent-cyan font-mono tracking-wider" style={{ fontFamily: 'var(--font-h)', letterSpacing: '0.15em' }}>
                    {captchaA}
                  </span>
                  <span className="text-lg text-text-muted font-bold">+</span>
                  <span className="text-2xl font-bold text-accent-cyan font-mono tracking-wider" style={{ fontFamily: 'var(--font-h)', letterSpacing: '0.15em' }}>
                    {captchaB}
                  </span>
                  <span className="text-lg text-text-muted font-bold">=</span>
                  <span className="text-2xl font-bold text-text-muted">?</span>
                </div>

                {/* Answer Input */}
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => handleCaptchaCheck(e.target.value)}
                    placeholder="Enter answer"
                    className={`w-28 bg-bg-surface border rounded-xl px-3.5 py-3 text-sm text-center font-bold font-mono focus:outline-none transition-all ${
                      captchaVerified 
                        ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/20' 
                        : captchaError 
                          ? 'border-red-500/60 text-red-400 bg-red-950/10'
                          : 'border-border-subtle text-white focus:border-accent-cyan'
                    }`}
                  />
                  {captchaVerified && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                </div>

                {/* Refresh Captcha */}
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-text-muted hover:text-accent-cyan p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  title="Generate new challenge"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                    <path d="M16 16h5v5"/>
                  </svg>
                </button>
              </div>

              {captchaError && !captchaVerified && (
                <p className="text-[10px] text-red-400 font-mono mt-2">
                  ❌ Incorrect answer. Please solve {captchaA} + {captchaB} to verify.
                </p>
              )}
            </div>

            {/* Declaration checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="declaration"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-border-subtle text-accent-cyan accent-accent-cyan mt-0.5 cursor-pointer"
                required
              />
              <label htmlFor="declaration" className="text-xs text-text-secondary font-sans leading-normal cursor-pointer">
                I confirm that this report and bounty declaration are truthful and based on my real transaction experience. Misuse of the registry may lead to permanent ban.
              </label>
            </div>
          </div>
        )}

        {/* STEP 6: Successful Submission Thank You page */}
        {step === 6 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent-green/10 border border-accent-green text-accent-green flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-white" style={{ fontFamily: 'var(--font-h)' }}>
                Report & Recovery Bounty Logged
              </h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                Your report has been queued for moderator verification and the <strong className="text-accent-amber">{effectiveBountyPercent}% Recovery Bounty (₹{calculatedBountyReward.toLocaleString('en-IN')})</strong> has been attached to the case.
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-border-subtle rounded max-w-sm mx-auto font-mono text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Report ID:</span>
                <span className="text-accent-cyan font-bold">{submittedReportId || 'LOGGED-OK'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status:</span>
                <span className="text-accent-amber font-bold">Pending Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Helper Bounty:</span>
                <span className="text-accent-amber font-bold">₹{calculatedBountyReward.toLocaleString('en-IN')} ({effectiveBountyPercent}%)</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/search')}
                className="btn btn-outline py-2 px-4 text-xs uppercase"
              >
                Go to Registry Search
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="btn btn-primary py-2 px-4 text-xs uppercase"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        {step <= 5 && (
          <div className="flex justify-between items-center pt-6 border-t border-border-subtle">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={step === 1}
              className="btn btn-ghost py-2 px-4 text-xs uppercase flex items-center gap-1.5 disabled:opacity-30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary py-2 px-5 text-xs uppercase font-bold flex items-center gap-1.5"
            >
              <span>{step === 5 ? 'Transmit Final Report' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </form>
      </div>
    </ProtectedRoute>
  );
}
