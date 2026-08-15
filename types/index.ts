export type UserRole = 'user' | 'verified_reseller' | 'regional_admin' | 'admin' | 'super_admin' | 'moderator' | 'seller';
export type ScamReportStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ScamType =
  | 'fake_account_sale'
  | 'payment_fraud'
  | 'fake_buyer'
  | 'impersonation'
  | 'item_scam'
  | 'advance_payment'
  | 'other';

export type EvidenceType = 'telegram' | 'youtube' | 'drive' | 'image' | 'screenshot' | 'other';

export interface EvidenceLink {
  type: EvidenceType;
  url: string;
  label: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'confirmed' | 'critical';
export type ResellerVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  roles?: UserRole[];
  primary_email?: string | null;
  region?: string | null;
  state?: string | null;
  store_status?: 'not_registered' | 'pending' | 'approved' | 'rejected' | 'suspended';
  primary_platform?: 'whatsapp_primary' | 'telegram_primary' | 'whatsapp_only' | 'telegram_only' | 'both';
  country_code?: string | null;
  whatsapp_username?: string | null;
  whatsapp_group_link?: string | null;
  telegram_channel_link?: string | null;
  operating_since_year?: number | null;
  is_banned: boolean;
  ban_reason: string | null;
  reputation_points: number;
  reports_submitted: number;
  created_at: string;
  last_seen: string;
}

export interface ScammerEntity {
  id: string;
  canonical_name: string;
  risk_level: RiskLevel;
  trust_score: number; // 0 - 100
  report_count: number;
  total_amount_lost: number;
  first_reported_at: string | null;
  last_reported_at: string | null;
  known_identifiers: {
    telegram?: string[];
    whatsapp?: string[];
    whatsapp_username?: string[];
    phone?: string[];
    upi?: string[];
    instagram?: string[];
    bank_account?: string[];
    bgmi_uid?: string[];
  };
  is_verified_scammer: boolean;
  verified_by_count?: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScamReport {
  id: string;
  reporter_id: string | null;
  scammer_name: string | null;
  telegram_username: string | null;
  whatsapp_number: string | null;
  upi_id: string | null;
  instagram_username: string | null;
  bgmi_uid: string | null;
  additional_identifiers: Record<string, any>;
  description: string;
  amount_lost: number;
  victim_phone_number?: string | null;
  currency: string;
  incident_date: string;
  scam_type: ScamType;
  evidence_links: EvidenceLink[];
  status: ScamReportStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  rejection_reason: string | null;
  scammer_entity_id: string | null;
  upvotes: number;
  verified_by_count: number;
  created_at: string;
  updated_at: string;
  
  // Joins
  reporter?: Profile;
  scammer_entity?: ScammerEntity;
}

export interface TrustedReseller {
  id: string;
  profile_id: string;
  store_name: string;
  tagline: string | null;
  bio: string | null;
  telegram_username: string | null;
  telegram_channel_link?: string | null;
  whatsapp_number: string | null;
  whatsapp_username?: string | null;
  whatsapp_group_link?: string | null;
  instagram_username: string | null;
  youtube_channel: string | null;
  bgmi_uid?: string | null;
  country_code?: string | null;
  primary_platform?: 'whatsapp_primary' | 'telegram_primary' | 'whatsapp_only' | 'telegram_only' | 'both';
  operating_since_year?: number | null;
  verification_status: ResellerVerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  trust_score: number; // 0 - 100
  deals_completed: number;
  positive_feedback: number;
  negative_feedback: number;
  years_active: number;
  specializes_in: string[];
  badges: Array<{ type: 'top_seller' | 'verified' | 'trusted_og'; earned_at: string }>;
  price_range: string | null;
  region?: string | null;
  state?: string | null;
  verified_by_regional_admin_id?: string | null;
  verified_by_regional_admin_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Joins
  profile?: Profile;
  scam_report_count?: number;
}

export interface ResellerReview {
  id: string;
  reseller_id: string;
  reviewer_id: string | null;
  rating: number; // 1 - 5
  comment: string | null;
  deal_type: string | null;
  is_verified_deal: boolean;
  is_visible: boolean;
  created_at: string;
  
  // Joins
  reviewer?: Profile;
}

export interface ReportVote {
  id: string;
  report_id: string;
  voter_id: string;
  vote_type: 'upvote' | 'verify' | 'dispute';
  created_at: string;
}

export interface ResellerTrustVote {
  id: string;
  voter_id: string;
  target_reseller_id: string;
  vote_type: 'trust' | 'distrust';
  created_at: string;
}

export interface SearchLog {
  id: string;
  query: string;
  query_type: string | null;
  result_count: number | null;
  searcher_id: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string | null;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
