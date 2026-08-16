'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EvidenceLink } from '../../types';
import { 
  Link2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Video, 
  FolderOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Maximize2,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LinkInputProps {
  links: EvidenceLink[];
  onChange: (links: EvidenceLink[]) => void;
  maxLinks?: number;
}

type VerifyStatus = 'idle' | 'checking' | 'valid' | 'restricted' | 'not_found' | 'invalid_format' | 'unsupported';

const DRIVE_STEPS = [
  {
    step: 1,
    title: '1. Click Folder "More actions"',
    desc: 'Create an evidence folder in Google Drive (e.g. "Sahib Scam 45K"). Click the three-dots (⋮) menu.',
    img: '/images/drive-guide/step1-folder-actions.png',
    alt: 'Click folder three-dots menu'
  },
  {
    step: 2,
    title: '2. Select "Share" ➔ "Share"',
    desc: 'In the options menu, hover over "Share" and click on the "Share" option.',
    img: '/images/drive-guide/step2-share-menu.png',
    alt: 'Click Share in the menu'
  },
  {
    step: 3,
    title: '3. Set "Anyone with the link"',
    desc: 'Under "General access", change from "Restricted" to "Anyone with the link" (Viewer).',
    img: '/images/drive-guide/step3-change-permission.png',
    alt: 'Change access to Anyone with the link'
  },
  {
    step: 4,
    title: '4. Click "Copy link" & Paste',
    desc: 'Click the blue "Copy link" button at the bottom left, then paste it in the box below.',
    img: '/images/drive-guide/step4-copy-link.png',
    alt: 'Click Copy link button'
  }
];

export default function LinkInput({ links, onChange, maxLinks = 8 }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [guideTab, setGuideTab] = useState<'drive' | 'telegram'>('drive');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-verification state
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState('');

  // Debounced auto-check on URL change
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || trimmed.length < 10) {
      setVerifyStatus('idle');
      setVerifyMessage('');
      setDetectedFormat('');
      setVideoTitle('');
      return;
    }

    // Quick client-side pre-check: must be one of the 3 domains
    const lower = trimmed.toLowerCase();
    const isDrive = lower.includes('drive.google.com');
    const isTelegram = lower.includes('t.me') || lower.includes('telegram.me');
    const isYouTube = lower.includes('youtube.com') || lower.includes('youtu.be');

    if (!isDrive && !isTelegram && !isYouTube) {
      setVerifyStatus('unsupported');
      setVerifyMessage('Only 3 evidence formats accepted: Google Drive, Telegram Public Channel, or YouTube Public Video.');
      setDetectedFormat('unknown');
      return;
    }

    setDetectedFormat(isDrive ? 'drive' : isTelegram ? 'telegram' : 'youtube');

    const timer = setTimeout(async () => {
      setVerifyStatus('checking');
      setVerifyMessage('Auto-verifying link accessibility...');

      try {
        const res = await fetch('/api/verify-evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed })
        });
        const data = await res.json();

        if (data.isValid) {
          setVerifyStatus('valid');
          setVerifyMessage(data.message);
          setDetectedFormat(data.format);
          if (data.videoTitle) setVideoTitle(data.videoTitle);
        } else {
          const status = data.status === 'restricted' ? 'restricted'
            : data.status === 'not_found' ? 'not_found'
            : data.status === 'invalid_format' ? 'invalid_format'
            : data.status === 'unsupported_domain' ? 'unsupported'
            : 'restricted';
          setVerifyStatus(status);
          setVerifyMessage(data.message);
          setDetectedFormat(data.format || '');
        }
      } catch (err) {
        // Network error: allow with warning
        setVerifyStatus('valid');
        setVerifyMessage('Verification server unavailable. Link accepted.');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [url]);

  const canAdd = verifyStatus === 'valid' && url.trim().length > 0 && links.length < maxLinks;

  const handleAdd = () => {
    if (!canAdd) {
      if (verifyStatus === 'restricted') {
        toast.error('Restricted link — cannot add as evidence.', {
          description: 'Please make the link publicly accessible first.'
        });
      } else if (verifyStatus === 'unsupported') {
        toast.error('Unsupported link format.', {
          description: 'Only Google Drive, Telegram Public Channel, or YouTube Video links are accepted.'
        });
      }
      return;
    }

    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const defaultLabels: Record<string, string> = {
      drive: 'Google Drive Evidence',
      telegram: 'Telegram Public Proof Channel',
      youtube: videoTitle || 'YouTube Screen Recording'
    };

    const newLink: EvidenceLink = {
      url: validUrl,
      type: detectedFormat as any,
      label: label.trim() || defaultLabels[detectedFormat] || 'Evidence Proof',
    };

    onChange([...links, newLink]);
    setUrl('');
    setLabel('');
    setVerifyStatus('idle');
    setVerifyMessage('');
    setDetectedFormat('');
    setVideoTitle('');
    toast.success('Evidence proof link verified & attached!');
  };

  const handleRemove = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    onChange(newLinks);
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'drive':
        return <FolderOpen className="w-3.5 h-3.5 text-accent-cyan" />;
      case 'telegram':
        return <Send className="w-3.5 h-3.5 text-sky-400" />;
      case 'youtube':
      case 'video':
        return <Video className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Link2 className="w-3.5 h-3.5 text-accent-green" />;
    }
  };

  const getFormatLabel = (t: string) => {
    switch (t) {
      case 'drive': return '📁 Google Drive';
      case 'telegram': return '📢 Telegram Channel';
      case 'youtube': return '🎥 YouTube Video';
      default: return '🔗 Link';
    }
  };

  const inputBorderClass = 
    verifyStatus === 'restricted' || verifyStatus === 'not_found' || verifyStatus === 'invalid_format' || verifyStatus === 'unsupported'
      ? 'border-red-500/70 focus:border-red-500 bg-red-950/10'
      : verifyStatus === 'valid'
        ? 'border-emerald-500/70 focus:border-emerald-500 bg-emerald-950/10'
        : verifyStatus === 'checking'
          ? 'border-sky-500/50 focus:border-sky-500 bg-sky-950/10'
          : 'border-border-subtle focus:border-accent-cyan';

  return (
    <div className="space-y-5 font-mono">
      {/* Visual Step-by-Step Evidence Guide */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-sky-950/30 via-black/40 to-transparent border border-sky-500/40 space-y-4 shadow-[0_0_30px_rgba(14,165,233,0.1)]">
        
        {/* Tab Header Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-500/20 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Evidence Method:
            </span>
            <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setGuideTab('drive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  guideTab === 'drive'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Google Drive</span>
              </button>

              <button
                type="button"
                onClick={() => setGuideTab('telegram')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  guideTab === 'telegram'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram / YouTube</span>
              </button>
            </div>
          </div>

          <div>
            {guideTab === 'drive' ? (
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1.5 rounded-lg border border-sky-500/30 flex items-center gap-1 transition-all"
              >
                <span>Open Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <a
                href="https://web.telegram.org"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1.5 rounded-lg border border-sky-500/30 flex items-center gap-1 transition-all"
              >
                <span>Open Telegram Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* GUIDE TAB 1: GOOGLE DRIVE WITH EXACT VISUAL SCREENSHOTS */}
        {guideTab === 'drive' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary font-sans leading-relaxed">
                Follow these 4 visual steps in Google Drive to ensure your evidence can be inspected and approved:
              </p>
              <span className="text-[10px] text-text-muted uppercase hidden sm:block">Click image to enlarge</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DRIVE_STEPS.map((s) => (
                <div 
                  key={s.step} 
                  className="bg-black/50 border border-white/10 hover:border-sky-500/50 rounded-xl p-3 flex flex-col justify-between space-y-2.5 transition-all group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-sky-400 block font-mono">
                      {s.title}
                    </span>
                    <p className="text-[11px] text-text-muted font-sans leading-snug">
                      {s.desc}
                    </p>
                  </div>

                  <div 
                    onClick={() => setPreviewImage(s.img)}
                    className="relative w-full h-32 rounded-lg overflow-hidden border border-white/15 bg-white/[0.02] cursor-pointer group-hover:border-sky-500/60 transition-all"
                  >
                    <img 
                      src={s.img} 
                      alt={s.alt} 
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-all duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <div className="p-1.5 rounded-lg bg-sky-500/80 text-white flex items-center gap-1 text-[10px] font-bold">
                        <Maximize2 className="w-3 h-3" />
                        <span>Enlarge</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-accent-amber font-mono bg-accent-amber/10 p-2.5 rounded-xl border border-accent-amber/25">
              <AlertTriangle className="w-4 h-4 shrink-0 text-accent-amber" />
              <span>
                <strong>Auto-Verification Active:</strong> Restricted Google Drive links are automatically blocked until set to <strong>"Anyone with the link" (Viewer)</strong>.
              </span>
            </div>
          </div>
        )}

        {/* GUIDE TAB 2: TELEGRAM + YOUTUBE */}
        {guideTab === 'telegram' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Telegram Guide */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Telegram Public Channel / Group</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500 text-sky-400 font-bold text-[10px] flex items-center justify-center">1</span>
                    <span className="text-[11px] font-bold text-white font-mono">Create Public Channel</span>
                  </div>
                  <p className="text-[11px] text-text-muted font-sans leading-snug">
                    In Telegram ➔ <strong>New Channel</strong> ➔ Set as <strong className="text-white">Public</strong> with a username.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-sky-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500 text-sky-400 font-bold text-[10px] flex items-center justify-center">2</span>
                    <span className="text-[11px] font-bold text-sky-400 font-mono">Post All Proofs</span>
                  </div>
                  <p className="text-[11px] text-text-muted font-sans leading-snug">
                    Post screenshots, voice notes, screen recordings, and payment slips in sequence.
                  </p>
                </div>

                <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold text-[10px] flex items-center justify-center">3</span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">Copy & Paste Link</span>
                  </div>
                  <p className="text-[11px] text-text-muted font-sans leading-snug">
                    Paste <code className="text-emerald-400">https://t.me/your_channel</code> below. Private invite links are blocked.
                  </p>
                </div>
              </div>
            </div>

            {/* YouTube Guide */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">YouTube Video Evidence</span>
              </div>
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
                <p className="text-[11px] text-text-muted font-sans leading-relaxed">
                  Upload a screen recording of the scam interaction to YouTube, set visibility to <strong className="text-white">Public</strong> or <strong className="text-white">Unlisted</strong>, and paste the video link below. Private videos will be automatically blocked.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-sky-400 font-mono bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/25">
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
              <span>
                <strong>All links are auto-verified.</strong> Private Telegram invites and Private YouTube videos are automatically blocked.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Existing Attached Links */}
      {links.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] text-text-secondary uppercase tracking-widest block font-mono">
            Verified Evidence Documents ({links.length}/{maxLinks})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {links.map((link, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between gap-2.5 bg-white/[0.03] border border-emerald-500/20 p-2.5 rounded-xl text-xs hover:border-accent-cyan/40 transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                    {getTypeIcon(link.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <p className="font-bold text-white truncate text-xs">{link.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-emerald-400 font-mono">{getFormatLabel(link.type)}</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] text-text-muted hover:text-accent-cyan hover:underline truncate block"
                      >
                        {link.url.substring(0, 50)}...
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-accent-red/20 text-text-muted hover:text-accent-red transition-all shrink-0 cursor-pointer"
                  title="Remove Link"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form for Adding Links */}
      {links.length < maxLinks && (
        <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent-cyan" />
              <span>Attach New Evidence Link</span>
            </span>
            <span className="text-[10px] text-text-muted">{maxLinks - links.length} slots remaining</span>
          </div>

          {/* Accepted Formats Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] text-text-muted uppercase tracking-widest">Accepted:</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">📁 Google Drive</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">📢 Telegram Public</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">🎥 YouTube Video</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-widest block font-mono">
                Evidence Link (auto-detected & auto-verified) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/...  or  https://t.me/...  or  https://youtube.com/..."
                  className={`w-full bg-bg-surface border focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-mono transition-all pr-10 ${inputBorderClass}`}
                />
                {/* Status icon inside input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {verifyStatus === 'checking' && <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />}
                  {verifyStatus === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {(verifyStatus === 'restricted' || verifyStatus === 'not_found' || verifyStatus === 'invalid_format' || verifyStatus === 'unsupported') && <XCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>

              {/* Auto-detected format badge */}
              {detectedFormat && verifyStatus !== 'idle' && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-text-muted uppercase">Detected:</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    detectedFormat === 'drive' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                    detectedFormat === 'telegram' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                    detectedFormat === 'youtube' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {detectedFormat === 'drive' ? '📁 Google Drive' :
                     detectedFormat === 'telegram' ? '📢 Telegram' :
                     detectedFormat === 'youtube' ? '🎥 YouTube' :
                     '❌ Unsupported'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-end gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-widest block font-mono">
                Label (Optional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Chat proof"
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-cyan focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-sans"
              />
            </div>
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer font-mono ${
              canAdd 
                ? 'bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/40 text-emerald-400 hover:text-bg-void shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-white/[0.03] border border-white/10 text-text-muted opacity-50 cursor-not-allowed'
            }`}
          >
            {verifyStatus === 'checking' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Link...</span>
              </>
            ) : canAdd ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Add Verified Evidence</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add Evidence</span>
              </>
            )}
          </button>

          {/* REAL-TIME VERIFICATION STATUS BANNERS */}
          {verifyStatus === 'checking' && (
            <div className="flex items-center gap-2 text-[10px] text-sky-400 font-mono bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Verifying link accessibility in real-time...</span>
            </div>
          )}

          {verifyStatus === 'restricted' && (
            <div className="flex items-start gap-2.5 text-[11px] text-red-400 font-mono bg-red-950/30 p-3 rounded-xl border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-red-300 uppercase tracking-wide">
                  ❌ Link is RESTRICTED — Access Blocked
                </strong>
                <p className="text-text-secondary font-sans leading-relaxed text-xs">
                  {verifyMessage}
                </p>
              </div>
            </div>
          )}

          {verifyStatus === 'not_found' && (
            <div className="flex items-start gap-2.5 text-[11px] text-amber-400 font-mono bg-amber-950/30 p-3 rounded-xl border border-amber-500/50 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block text-amber-300 uppercase tracking-wide">⚠️ Resource Not Found</strong>
                <p className="text-text-secondary font-sans text-xs">{verifyMessage}</p>
              </div>
            </div>
          )}

          {verifyStatus === 'invalid_format' && (
            <div className="flex items-start gap-2.5 text-[11px] text-amber-400 font-mono bg-amber-950/30 p-3 rounded-xl border border-amber-500/50 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block text-amber-300 uppercase tracking-wide">⚠️ Invalid Link Format</strong>
                <p className="text-text-secondary font-sans text-xs">{verifyMessage}</p>
              </div>
            </div>
          )}

          {verifyStatus === 'unsupported' && (
            <div className="flex items-start gap-2.5 text-[11px] text-red-400 font-mono bg-red-950/30 p-3 rounded-xl border border-red-500/50 animate-in fade-in">
              <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <strong className="block text-red-300 uppercase tracking-wide">❌ Unsupported Evidence Format</strong>
                <p className="text-text-secondary font-sans text-xs">{verifyMessage}</p>
              </div>
            </div>
          )}

          {verifyStatus === 'valid' && (
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>✅ Verified:</strong> {verifyMessage}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#0d121f] border border-sky-500/40 rounded-2xl p-4 space-y-3 shadow-[0_0_80px_rgba(14,165,233,0.3)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                Google Drive Sharing Tutorial Preview
              </span>
              <button 
                type="button" 
                onClick={() => setPreviewImage(null)}
                className="text-text-muted hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black/60 p-2">
              <img 
                src={previewImage} 
                alt="Guide Preview" 
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
