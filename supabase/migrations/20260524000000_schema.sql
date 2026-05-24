-- 8xSentinel Central Registry SQL Database Schema Migration
-- Target Database: PostgreSQL / Supabase DB

-- Create custom enum types if not exists
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE scam_report_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE scam_type AS ENUM (
  'fake_account_sale',
  'payment_fraud',
  'fake_buyer',
  'impersonation',
  'item_scam',
  'advance_payment',
  'other'
);
CREATE TYPE evidence_type AS ENUM ('telegram', 'youtube', 'drive', 'image', 'other');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'confirmed');
CREATE TYPE reseller_verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- 1. Profiles Table (Linked to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason TEXT,
  reputation_points INTEGER NOT NULL DEFAULT 0,
  reports_submitted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Scammer Entities Table
CREATE TABLE IF NOT EXISTS public.scammer_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name VARCHAR(255) NOT NULL,
  risk_level risk_level NOT NULL DEFAULT 'medium',
  trust_score INTEGER NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  report_count INTEGER NOT NULL DEFAULT 0,
  total_amount_lost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  first_reported_at TIMESTAMPTZ,
  last_reported_at TIMESTAMPTZ,
  known_identifiers JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {telegram: [], whatsapp: [], upi: []}
  is_verified_scammer BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Scam Reports Table
CREATE TABLE IF NOT EXISTS public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scammer_name VARCHAR(255),
  telegram_username VARCHAR(100),
  whatsapp_number VARCHAR(50),
  upi_id VARCHAR(100),
  instagram_username VARCHAR(100),
  bgmi_uid VARCHAR(50),
  additional_identifiers JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT NOT NULL CHECK (length(description) >= 100),
  amount_lost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_lost >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  incident_date DATE NOT NULL,
  scam_type scam_type NOT NULL,
  evidence_links JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {type, url, label}
  status scam_report_status NOT NULL DEFAULT 'pending',
  moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  scammer_entity_id UUID REFERENCES public.scammer_entities(id) ON DELETE SET NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  verified_by_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Trusted Resellers Table
CREATE TABLE IF NOT EXISTS public.trusted_resellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  store_name VARCHAR(150) NOT NULL,
  tagline VARCHAR(255),
  bio TEXT,
  telegram_username VARCHAR(100),
  whatsapp_number VARCHAR(50),
  instagram_username VARCHAR(100),
  youtube_channel TEXT,
  verification_status reseller_verification_status NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  trust_score INTEGER NOT NULL DEFAULT 30 CHECK (trust_score >= 0 AND trust_score <= 100),
  deals_completed INTEGER NOT NULL DEFAULT 0,
  positive_feedback INTEGER NOT NULL DEFAULT 0,
  negative_feedback INTEGER NOT NULL DEFAULT 0,
  years_active NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
  specializes_in TEXT[] NOT NULL DEFAULT '{}'::text[],
  badges JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., [{type: 'verified', earned_at: '...'}]
  price_range VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Reseller Reviews Table
CREATE TABLE IF NOT EXISTS public.reseller_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES public.trusted_resellers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  deal_type VARCHAR(50),
  is_verified_deal BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Report Votes Table
CREATE TABLE IF NOT EXISTS public.report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('upvote', 'verify', 'dispute')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, voter_id, vote_type)
);

-- 7. Search Logs Table
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query VARCHAR(255) NOT NULL,
  query_type VARCHAR(50),
  result_count INTEGER,
  searcher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_hash VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Admin Actions Table (Audit Logs)
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL, -- e.g., 'approve_report', 'reject_reseller', 'ban_user'
  target_type VARCHAR(50), -- e.g., 'scam_reports', 'trusted_resellers'
  target_id VARCHAR(100),
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for optimized querying
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON public.scam_reports(status);
CREATE INDEX IF NOT EXISTS idx_scam_reports_scammer_entity ON public.scam_reports(scammer_entity_id);
CREATE INDEX IF NOT EXISTS idx_resellers_verification ON public.trusted_resellers(verification_status);
CREATE INDEX IF NOT EXISTS idx_reviews_reseller ON public.reseller_reviews(reseller_id);
CREATE INDEX IF NOT EXISTS idx_votes_report ON public.report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON public.search_logs(query);

-- Row Level Security (RLS) policies placeholders (highly recommended for production Supabase setups)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scammer_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Sample Policies
-- Profiles: Anyone can read profiles, but users can only update their own.
CREATE POLICY "Allow public read-only profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profiles" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Scam Reports: Anyone can select approved reports; users can insert new ones; moderators/admins can perform all actions.
CREATE POLICY "Allow select approved reports" ON public.scam_reports FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow users to submit reports" ON public.scam_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow mods/admins full access to reports" ON public.scam_reports FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND (profiles.role = 'moderator' OR profiles.role = 'admin')
  )
);
