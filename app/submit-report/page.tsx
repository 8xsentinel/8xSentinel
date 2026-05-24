'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LinkInput from '../../components/ui/LinkInput';
import { db } from '../../lib/db';
import { reportSchema } from '../../lib/validators/reportSchema';
import { EvidenceLink, ScamType } from '../../types';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export default function SubmitReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [scammerName, setScammerName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [upi, setUpi] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bgmiUid, setBgmiUid] = useState('');
  
  const [scamType, setScamType] = useState<ScamType>('fake_account_sale');
  const [amountLost, setAmountLost] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([]);
  
  const [declaration, setDeclaration] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  useEffect(() => {
    setUser(db.getCurrentUser());
  }, []);

  const handleNextStep = () => {
    // Basic validation per step
    if (step === 1) {
      if (!scammerName.trim()) {
        toast.error('Scammer Name is required.');
        return;
      }
      if (!(telegram.trim() || whatsapp.trim() || upi.trim() || instagram.trim() || bgmiUid.trim())) {
        toast.error('Please fill in at least one identifier (Telegram, WhatsApp, UPI, Instagram, or BGMI UID) to help catalog this scammer.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (description.trim().length < 100) {
        toast.error(`Description must be at least 100 characters detailing the incident (Current: ${description.trim().length} chars).`);
        return;
      }
      if (Number(amountLost) < 0 || isNaN(Number(amountLost))) {
        toast.error('Amount lost must be a valid positive number.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!declaration) {
      toast.error('You must confirm the truthfulness declaration before submitting.');
      return;
    }

    const payload = {
      scammer_name: scammerName,
      telegram_username: telegram || undefined,
      whatsapp_number: whatsapp || undefined,
      upi_id: upi || undefined,
      instagram_username: instagram || undefined,
      bgmi_uid: bgmiUid || undefined,
      scam_type: scamType,
      amount_lost: Number(amountLost) || 0,
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
      toast.success('Scam report filed successfully!', {
        description: 'Moderators will review the details and evidence references within 24 hours.'
      });
      setStep(5); // Thank you stage
    } catch (err) {
      toast.error('Failed to submit report. Rate limit hit.');
    }
  };

  const stepsHeader = [
    { label: 'Identifiers' },
    { label: 'Incident details' },
    { label: 'Proof links' },
    { label: 'Review & Submit' }
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto py-12 px-4 space-y-8 font-mono">
        
        {/* Header Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-accent-red animate-pulse" />
            <span>File Scammer Report</span>
          </h1>
          <p className="text-text-secondary text-xs font-sans font-medium">
            Help protect the community. Fill details accurately. Refer to evidence links; files are never stored.
          </p>
        </div>

        {/* Step Indicator Bar */}
        {step <= 4 && (
          <div className="flex justify-between items-center text-[10px] tracking-widest text-text-muted border-b border-border-subtle/50 pb-4">
            {stepsHeader.map((sh, idx) => {
              const active = idx + 1 === step;
              const completed = idx + 1 < step;
              return (
                <div key={idx} className="flex items-center gap-1">
                  <span className={`
                    w-5 h-5 rounded-full border flex items-center justify-center font-bold
                    ${active ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5' : ''}
                    ${completed ? 'border-accent-green text-accent-green bg-accent-green/5' : 'border-border-subtle'}
                  `}>
                    {idx + 1}
                  </span>
                  <span className={`hidden sm:inline ${active ? 'text-accent-cyan font-bold' : ''} ${completed ? 'text-accent-green' : ''}`}>
                    {sh.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-6">
          
          {/* STEP 1: Scammer Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Step 1: Scammer Identifiers
              </h3>
              
              <div>
                <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Scammer Name / Alias *</label>
                <input
                  value={scammerName}
                  onChange={(e) => setScammerName(e.target.value)}
                  type="text"
                  placeholder="e.g. Rohan Sharma"
                  className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Telegram Username</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-text-muted text-sm">@</span>
                    <input
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                      type="text"
                      placeholder="username"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded pl-7 pr-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">WhatsApp Number</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    type="tel"
                    placeholder="e.g. +91 99999-88888"
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">UPI ID</label>
                  <input
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    type="text"
                    placeholder="e.g. name@ybl"
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Instagram Username</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-text-muted text-sm">@</span>
                    <input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                      type="text"
                      placeholder="insta_profile"
                      className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded pl-7 pr-3 py-2 text-sm text-text-primary"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">BGMI Character UID (Optional)</label>
                  <input
                    value={bgmiUid}
                    onChange={(e) => setBgmiUid(e.target.value)}
                    type="text"
                    placeholder="e.g. 5567891234"
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                  />
                </div>
              </div>

              <div className="p-3 bg-white/[0.01] border border-border-subtle rounded text-xs text-text-muted font-sans leading-relaxed">
                Provide as many identifiers as possible. The system will use this information to group multiple reports against the same scammer automatically.
              </div>
            </div>
          )}

          {/* STEP 2: Incident Details */}
          {step === 2 && (
            <div className="space-y-4 font-mono">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Step 2: Incident Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Scam Type *</label>
                  <select
                    value={scamType}
                    onChange={(e) => setScamType(e.target.value as any)}
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                  >
                    <option value="fake_account_sale">Fake Account Sale</option>
                    <option value="payment_fraud">Payment Fraud</option>
                    <option value="fake_buyer">Fake Buyer</option>
                    <option value="impersonation">Admin / Middleman Impersonation</option>
                    <option value="item_scam">UC / Item Scam</option>
                    <option value="advance_payment">Advance Payment Escaping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Amount Lost (INR) *</label>
                  <input
                    value={amountLost}
                    onChange={(e) => setAmountLost(e.target.value)}
                    type="number"
                    placeholder="₹ Lost"
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-text-secondary uppercase tracking-widest block mb-1">Incident Date *</label>
                <input
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  type="date"
                  className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest block">Detailed Description * (Min 100 characters)</label>
                  <span className={`text-[10px] font-bold ${description.length >= 100 ? 'text-accent-green' : 'text-text-muted'}`}>
                    {description.length}/100 chars
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly how the scam took place, where you contacted the scammer, what terms were agreed, and what happened after payment. Be specific."
                  className="w-full h-32 bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded px-3 py-2 text-sm text-text-primary font-sans leading-normal resize-none"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: Evidence Links */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Step 3: Evidence Proof Reference
              </h3>

              <LinkInput links={evidenceLinks} onChange={setEvidenceLinks} />
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-5 text-sm">
              <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Step 4: Review File details
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-white/[0.01] border border-border-subtle p-4 rounded text-xs">
                <div>
                  <p className="text-text-muted">Target Scammer:</p>
                  <p className="font-bold text-text-primary">{scammerName}</p>
                </div>
                <div>
                  <p className="text-text-muted">Incident Type:</p>
                  <p className="font-bold text-accent-cyan uppercase">{scamType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-text-muted">Amount Impacted:</p>
                  <p className="font-bold text-accent-red font-mono">₹{Number(amountLost).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-text-muted">Incident Date:</p>
                  <p className="font-bold text-text-primary">{incidentDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-muted">Identifications Provided:</p>
                  <p className="text-text-secondary mt-1 font-mono">
                    {[
                      telegram && `TG: @${telegram}`,
                      whatsapp && `WA: ${whatsapp}`,
                      upi && `UPI: ${upi}`,
                      instagram && `IG: @${instagram}`,
                      bgmiUid && `UID: ${bgmiUid}`
                    ].filter(Boolean).join(' | ') || 'None'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-text-muted">Evidence references Attached:</p>
                  <p className="text-text-secondary font-mono">
                    {evidenceLinks.length > 0 ? `${evidenceLinks.length} references provided` : 'No references attached (Recommended)'}
                  </p>
                </div>
              </div>

              {/* Captcha mock validation */}
              <div className="p-4 bg-white/[0.02] border border-border-subtle rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="captcha"
                    className="w-4 h-4 rounded border-border-subtle text-accent-cyan accent-accent-cyan cursor-pointer"
                    required
                  />
                  <label htmlFor="captcha" className="text-xs text-text-secondary font-mono cursor-pointer">
                    Verify you are human (Security Captcha Cloudflare Turnstile)
                  </label>
                </div>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">Turnstile Free Tier</span>
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
                  I confirm that this report is truthful, based on my real trading experience, and I have provided accurate links to support the claim. Misuse of the registry may lead to account ban.
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Successful Submission Thank You page */}
          {step === 5 && (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display uppercase tracking-widest text-text-primary">
                  Report Logged in Queue
                </h3>
                <p className="text-text-secondary text-xs font-sans max-w-sm mx-auto">
                  Your dispute report has been registered under serial ID <span className="font-mono text-accent-cyan font-bold">{submittedReportId?.slice(-6).toUpperCase()}</span>.
                </p>
              </div>

              <div className="p-4 bg-white/[0.01] border border-border-subtle rounded-lg text-xs max-w-md mx-auto flex items-start gap-3 text-left font-sans">
                <Info className="w-4.5 h-4.5 text-accent-cyan shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold font-mono text-[10px] text-accent-cyan uppercase tracking-widest">Verification Status:</p>
                  <p className="text-text-muted leading-relaxed">
                    Moderators will verify the evidence reference URL links you provided. If approved, the report status will update to <strong className="text-text-primary font-mono">Approved</strong>, the scammer's threat index will update, and you will receive <strong className="text-accent-cyan">+10 Reputation Points</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="bg-gradient-cyan text-bg-void font-bold font-mono text-xs uppercase tracking-wider px-6 py-2.5 rounded transition-all hover:shadow-glow-cyan"
                >
                  Return Home
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/search')}
                  className="bg-transparent border border-border-subtle hover:border-accent-cyan/30 text-text-secondary px-6 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  Search Database
                </button>
              </div>
            </div>
          )}

          {/* Form Actions Footer Navigation Buttons */}
          {step <= 4 && (
            <div className="flex justify-between items-center pt-4 border-t border-border-subtle/30">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step === 1}
                className="flex items-center gap-1.5 border border-border-subtle hover:border-accent-cyan/20 text-text-secondary hover:text-text-primary px-4 py-2 rounded text-xs uppercase font-mono transition-colors disabled:opacity-30 disabled:hover:border-border-subtle disabled:hover:text-text-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 bg-accent-cyan/15 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan hover:text-bg-void px-4.5 py-2.5 rounded text-xs font-bold uppercase transition-all duration-200"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-gradient-cyan hover:shadow-glow-cyan text-bg-void px-6 py-2.5 rounded text-xs font-bold uppercase transition-all"
                >
                  <span>Submit File</span>
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </form>

      </main>
      <Footer />
    </>
  );
}
