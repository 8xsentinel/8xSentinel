'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import TrustScoreRing from '../../../components/ui/TrustScoreRing';
import { db } from '../../../lib/db';
import { TrustedReseller, ResellerReview } from '../../../types';
import { toast } from 'sonner';
import { CheckCircle2, MessageSquare, Phone, Star, AlertTriangle, Calendar } from 'lucide-react';

const Instagram = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
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
    width="24"
    height="24"
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

export default function ResellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [reseller, setReseller] = useState<TrustedReseller | null>(null);
  const [reviews, setReviews] = useState<ResellerReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [dealType, setDealType] = useState('account_sale');

  const fetchResellerDetails = async () => {
    if (username) {
      const data = await db.getResellerByUsername(username);
      if (data) {
        setReseller(data.reseller);
        setReviews(data.reviews);
      } else {
        // If not found by username, try direct ID matching
        const resellersList = await db.getResellers();
        const directIdMatch = resellersList.find(r => r.id === username);
        if (directIdMatch && directIdMatch.profile) {
          const directData = await db.getResellerByUsername(directIdMatch.profile.username);
          if (directData) {
            setReseller(directData.reseller);
            setReviews(directData.reviews);
          }
        }
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellerDetails();
  }, [username]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reseller) return;

    const userSession = db.getCurrentUser();
    if (!userSession) {
      toast.error('Authentication required. Switch test role in the header to post reviews.');
      return;
    }

    if (!comment.trim()) {
      toast.error('Review comments cannot be empty.');
      return;
    }

    const review = await db.submitResellerReview(reseller.id, rating, comment, dealType);
    if (review) {
      toast.success('Feedback published successfully!');
      setComment('');
      await fetchResellerDetails(); // reload profile stats and reviews list
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-void flex flex-col font-mono text-xs text-text-muted justify-center items-center">
        <span className="w-8 h-8 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></span>
        <p className="mt-2 uppercase tracking-widest">Verifying Agent Credentials...</p>
      </div>
    );
  }

  if (!reseller) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto py-20 px-4 text-center font-mono text-sm space-y-4">
          <AlertTriangle className="w-12 h-12 text-accent-amber mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-text-primary">Profile Not Found</h2>
          <p className="text-text-secondary text-xs font-sans">
            The requested trader profile name is either suspended, rejected, or unregistered.
          </p>
          <button
            onClick={() => router.push('/resellers')}
            className="bg-transparent border border-border-subtle hover:border-accent-green/30 text-accent-green px-4 py-2 rounded text-xs"
          >
            &larr; Back to Directory
          </button>
        </main>
        <Footer />
      </>
    );
  }

  // Calculating positive review rating average
  const totalFeedback = reseller.positive_feedback + reseller.negative_feedback;
  const ratingPct = totalFeedback > 0 ? Math.round((reseller.positive_feedback / totalFeedback) * 100) : 100;
  const starsCount = Math.round((ratingPct / 100) * 5);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto py-12 px-4 space-y-8 font-mono">
        
        {/* Banner Area and header */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 relative overflow-hidden">
          {/* Neon corner overlay */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent-green/10 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded bg-bg-elevated border border-border-subtle flex items-center justify-center font-bold text-accent-green text-2xl font-display">
                {reseller.store_name.slice(0, 2).toUpperCase()}
                <div className="absolute -bottom-1 -right-1 bg-bg-void rounded-full p-0.5">
                  <CheckCircle2 className="w-5 h-5 text-accent-green fill-bg-void" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
                    {reseller.store_name}
                  </h1>
                  {reseller.badges.map((badge, bIdx) => (
                    <span key={bIdx} className="bg-accent-green/15 text-accent-green border border-accent-green/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                      {badge.type.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-text-secondary font-sans leading-normal">
                  {reseller.tagline || 'Verified Trading Reseller Store'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Reputation Score</span>
                <span className="text-2xl font-bold text-accent-green">{ratingPct}% Positive</span>
                <p className="text-[9px] text-text-muted">From {totalFeedback} community reviews</p>
              </div>
              <TrustScoreRing score={reseller.trust_score} size={64} type="reseller" />
            </div>
          </div>

          {/* Core metrics strip banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border-subtle/30 text-center font-mono text-xs">
            <div className="border-r border-border-subtle/30 last:border-0">
              <span className="text-text-muted block uppercase text-[10px] tracking-wider">Deals Completed</span>
              <span className="text-lg font-bold text-text-primary">{reseller.deals_completed}</span>
            </div>
            <div className="border-r border-border-subtle/30 last:border-0">
              <span className="text-text-muted block uppercase text-[10px] tracking-wider">Positive Reviews</span>
              <span className="text-lg font-bold text-accent-green">{reseller.positive_feedback}</span>
            </div>
            <div className="border-r border-border-subtle/30 last:border-0">
              <span className="text-text-muted block uppercase text-[10px] tracking-wider">Years Active</span>
              <span className="text-lg font-bold text-accent-cyan">{reseller.years_active}</span>
            </div>
            <div className="last:border-0">
              <span className="text-text-muted block uppercase text-[10px] tracking-wider">Claims Filed</span>
              <span className={`text-lg font-bold ${reseller.scam_report_count && reseller.scam_report_count > 0 ? 'text-accent-red font-bold' : 'text-text-secondary'}`}>
                {reseller.scam_report_count || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Bio & Contact grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            
            {/* Bio Card */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Merchant Description
              </h3>
              <p className="text-sm font-sans text-text-secondary leading-relaxed">
                {reseller.bio || 'This merchant has not updated their bio details yet.'}
              </p>

              {/* Specialties tags */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-text-muted uppercase tracking-widest block font-bold">Specialties:</span>
                <div className="flex flex-wrap gap-2">
                  {reseller.specializes_in.map(spec => (
                    <span key={spec} className="px-3 py-1 rounded bg-white/[0.03] border border-border-subtle/60 text-xs text-text-secondary">
                      {spec.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Review lists section */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-6 space-y-6">
              <h3 className="text-xs font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Community Feedback ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-text-muted italic text-center py-4">No reviews logged for this store directory yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-4 rounded border border-border-subtle/50 bg-white/[0.01] space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                            alt="reviewer avatar"
                            className="w-6 h-6 rounded border border-border-subtle bg-bg-surface"
                          />
                          <span className="font-bold text-text-primary">{rev.reviewer?.display_name || rev.reviewer?.username || 'Trader'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-accent-amber font-bold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-accent-amber' : 'text-text-muted'}`} />
                          ))}
                          <span className="text-text-secondary ml-1">({rev.rating}/5)</span>
                        </div>
                      </div>

                      <p className="font-sans text-text-secondary leading-relaxed pl-8">
                        {rev.comment}
                      </p>

                      <div className="pl-8 flex justify-between text-[10px] text-text-muted font-mono uppercase">
                        <span>Deal type: {rev.deal_type?.replace('_', ' ')}</span>
                        <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact details */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Merchant Contacts
              </h3>
              
              <div className="space-y-2">
                {reseller.telegram_username && (
                  <a
                    href={`https://t.me/${reseller.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between border border-border-subtle bg-white/[0.01] hover:bg-sky-500/5 hover:border-sky-500/20 text-xs px-3.5 py-2.5 rounded transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span className="font-bold text-text-secondary">Telegram</span>
                    </span>
                    <span className="font-mono text-text-muted group-hover:text-sky-400">@{reseller.telegram_username}</span>
                  </a>
                )}

                {reseller.whatsapp_number && (
                  <div className="w-full flex items-center justify-between border border-border-subtle bg-white/[0.01] text-xs px-3.5 py-2.5 rounded">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-text-secondary">WhatsApp</span>
                    </span>
                    <span className="font-mono text-text-muted">{reseller.whatsapp_number}</span>
                  </div>
                )}

                {reseller.instagram_username && (
                  <div className="w-full flex items-center justify-between border border-border-subtle bg-white/[0.01] text-xs px-3.5 py-2.5 rounded">
                    <span className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      <span className="font-bold text-text-secondary">Instagram</span>
                    </span>
                    <span className="font-mono text-text-muted">@{reseller.instagram_username}</span>
                  </div>
                )}

                {reseller.youtube_channel && (
                  <a
                    href={reseller.youtube_channel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between border border-border-subtle bg-white/[0.01] hover:bg-red-500/5 hover:border-red-500/20 text-xs px-3.5 py-2.5 rounded transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-text-secondary">YouTube</span>
                    </span>
                    <span className="font-mono text-text-muted group-hover:text-red-500">Visit Channel</span>
                  </a>
                )}
              </div>
            </div>

            {/* Submit Review Card */}
            <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-accent-green uppercase tracking-wider border-b border-border-subtle/30 pb-2">
                Submit Deal Review
              </h3>
              
              <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[9px] text-text-muted uppercase block mb-1">Deal Type</label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value)}
                    className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-2 py-1.5 text-text-primary"
                  >
                    <option value="account_sale">Account Sale</option>
                    <option value="uc_topup">UC Top-up</option>
                    <option value="item_trading">Item skins</option>
                    <option value="recovery">Account recovery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-text-muted uppercase block mb-1">Deal Rating ({rating} Stars)</label>
                  <div className="flex gap-2 text-accent-amber">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className="transition-transform active:scale-95"
                      >
                        <Star className={`w-5 h-5 ${i < rating ? 'fill-accent-amber' : 'text-text-muted'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-text-muted uppercase block mb-1">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide details about transaction speed, middleman compatibility, and seller responsiveness."
                    className="w-full h-20 bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded px-2 py-1.5 text-text-primary font-sans resize-none leading-normal"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-green text-bg-void font-bold font-mono py-2 rounded text-[10px] uppercase tracking-wider hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
                >
                  Publish Review
                </button>
              </form>
            </div>

            {/* Alert/disclaimers */}
            <div className="text-[9px] text-text-muted space-y-2 px-1 font-sans leading-relaxed">
              <p className="flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-accent-amber shrink-0 mt-0.5" />
                <span>Double-check Telegram handles carefully! Scammers often create clone usernames with minor character variations (e.g. substituting 'l' for '1' or 'i').</span>
              </p>
              <Link
                href={`/submit-report?name=${encodeURIComponent(reseller.store_name)}&telegram=${encodeURIComponent(reseller.telegram_username || '')}`}
                className="block text-accent-red font-mono font-bold hover:underline"
              >
                ⚠️ Report this merchant profile
              </Link>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
