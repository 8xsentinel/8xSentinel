import { ScammerEntity, TrustedReseller, RiskLevel } from '../../types';

function daysBetween(date1: string | Date | null, date2: Date): number {
  if (!date1) return 999;
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const diffTime = Math.abs(date2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function computeScammerRiskScore(entity: {
  report_count: number;
  total_amount_lost: number;
  verified_by_count: number;
  is_verified_scammer: boolean;
  last_reported_at: string | null;
}): number {
  let score = 100; // Start clean

  // Report count penalty
  score -= Math.min(entity.report_count * 12, 60);

  // Amount lost severity
  if (entity.total_amount_lost > 50000) score -= 20;
  else if (entity.total_amount_lost > 10000) score -= 10;
  else if (entity.total_amount_lost > 1000) score -= 5;

  // Community verification bonus (scam confirmed)
  score -= entity.verified_by_count * 3;

  // Admin confirmation
  if (entity.is_verified_scammer) {
    score = Math.min(score, 15);
  }

  // Recent activity (reported in last 30 days = worse)
  const daysSinceLastReport = daysBetween(entity.last_reported_at, new Date());
  if (daysSinceLastReport < 30) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 15) return 'confirmed';
  if (score <= 35) return 'high';
  if (score <= 60) return 'medium';
  return 'low';
}

export function computeResellerTrustScore(reseller: {
  verification_status: string;
  deals_completed: number;
  positive_feedback: number;
  negative_feedback: number;
  years_active: number;
  scam_report_count: number;
}): number {
  let score = 0;

  // Verification base
  if (reseller.verification_status === 'approved') {
    score += 30;
  }

  // Deal history (diminishing returns)
  score += Math.min(reseller.deals_completed * 0.5, 25);

  // Feedback ratio
  const totalFeedback = reseller.positive_feedback + reseller.negative_feedback;
  if (totalFeedback > 0) {
    const ratio = reseller.positive_feedback / totalFeedback;
    score += ratio * 25;
  }

  // Longevity bonus
  score += Math.min(reseller.years_active * 3, 15);

  // Scam reports penalty (cross-check scam_reports table)
  score -= reseller.scam_report_count * 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}
