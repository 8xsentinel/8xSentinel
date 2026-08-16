import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, serial } from "drizzle-orm/pg-core";

// Base users table requested by template
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

// Profiles Table
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  username: varchar('username', { length: 256 }).notNull().unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  primaryEmail: varchar('primary_email', { length: 256 }),
  region: varchar('region', { length: 100 }),
  state: varchar('state', { length: 100 }),
  storeStatus: varchar('store_status', { length: 50 }).default('not_registered'),
  primaryPlatform: varchar('primary_platform', { length: 50 }),
  countryCode: varchar('country_code', { length: 10 }),
  whatsappUsername: varchar('whatsapp_username', { length: 256 }),
  whatsappGroupLink: text('whatsapp_group_link'),
  telegramChannelLink: text('telegram_channel_link'),
  operatingSinceYear: integer('operating_since_year'),
  isBanned: boolean('is_banned').notNull().default(false),
  banReason: text('ban_reason'),
  reputationPoints: integer('reputation_points').notNull().default(10),
  reportsSubmitted: integer('reports_submitted').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
});

// Scammer Entities Table
export const scammerEntities = pgTable('scammer_entities', {
  id: text('id').primaryKey(),
  canonicalName: varchar('canonical_name', { length: 256 }).notNull(),
  riskLevel: varchar('risk_level', { length: 50 }).notNull().default('medium'),
  trustScore: integer('trust_score').notNull().default(50),
  reportCount: integer('report_count').notNull().default(0),
  totalAmountLost: integer('total_amount_lost').notNull().default(0),
  firstReportedAt: timestamp('first_reported_at'),
  lastReportedAt: timestamp('last_reported_at'),
  knownIdentifiers: jsonb('known_identifiers').default({}),
  isVerifiedScammer: boolean('is_verified_scammer').notNull().default(false),
  verifiedByCount: integer('verified_by_count').notNull().default(0),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Scam Reports Table
export const scamReports = pgTable('scam_reports', {
  id: text('id').primaryKey(),
  reporterId: text('reporter_id').references(() => profiles.id),
  scammerName: varchar('scammer_name', { length: 256 }),
  telegramUsername: varchar('telegram_username', { length: 256 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  upiId: varchar('upi_id', { length: 256 }),
  instagramUsername: varchar('instagram_username', { length: 256 }),
  bgmiUid: varchar('bgmi_uid', { length: 100 }),
  additionalIdentifiers: jsonb('additional_identifiers').default({}),
  description: text('description').notNull(),
  amountLost: integer('amount_lost').notNull().default(0),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  incidentDate: timestamp('incident_date').notNull(),
  scamType: varchar('scam_type', { length: 100 }).notNull(),
  evidenceLinks: jsonb('evidence_links').default([]),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  moderatedBy: text('moderated_by').references(() => profiles.id),
  moderatedAt: timestamp('moderated_at'),
  rejectionReason: text('rejection_reason'),
  scammerEntityId: text('scammer_entity_id').references(() => scammerEntities.id),
  upvotes: integer('upvotes').notNull().default(0),
  verifiedByCount: integer('verified_by_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Trusted Resellers Table
export const trustedResellers = pgTable('trusted_resellers', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').references(() => profiles.id).notNull(),
  storeName: varchar('store_name', { length: 256 }).notNull(),
  tagline: text('tagline'),
  bio: text('bio'),
  telegramUsername: varchar('telegram_username', { length: 256 }),
  telegramChannelLink: text('telegram_channel_link'),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  whatsappUsername: varchar('whatsapp_username', { length: 256 }),
  whatsappGroupLink: text('whatsapp_group_link'),
  instagramUsername: varchar('instagram_username', { length: 256 }),
  youtubeChannel: text('youtube_channel'),
  bgmiUid: varchar('bgmi_uid', { length: 100 }),
  countryCode: varchar('country_code', { length: 10 }).default('+91'),
  primaryPlatform: varchar('primary_platform', { length: 50 }).default('whatsapp_primary'),
  operatingSinceYear: integer('operating_since_year').default(2022),
  verificationStatus: varchar('verification_status', { length: 50 }).notNull().default('pending'),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: text('verified_by').references(() => profiles.id),
  rejectionReason: text('rejection_reason'),
  trustScore: integer('trust_score').notNull().default(30),
  dealsCompleted: integer('deals_completed').notNull().default(0),
  positiveFeedback: integer('positive_feedback').notNull().default(0),
  negativeFeedback: integer('negative_feedback').notNull().default(0),
  yearsActive: integer('years_active').notNull().default(1),
  specializesIn: jsonb('specializes_in').default([]),
  badges: jsonb('badges').default([]),
  priceRange: varchar('price_range', { length: 100 }),
  region: varchar('region', { length: 100 }),
  state: varchar('state', { length: 100 }),
  verifiedByRegionalAdminId: text('verified_by_regional_admin_id'),
  verifiedByRegionalAdminName: text('verified_by_regional_admin_name'),
  isActive: boolean('is_active').notNull().default(true),
  
  // Tier 2 Sentinel Trusted Fields
  govIdUrl: text('gov_id_url'),
  selfieUrl: text('selfie_url'),
  locationLat: varchar('location_lat', { length: 50 }),
  locationLng: varchar('location_lng', { length: 50 }),
  tier: integer('tier').notNull().default(1),
  tier2Status: varchar('tier2_status', { length: 50 }).notNull().default('not_applied'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reseller Reviews Table
export const resellerReviews = pgTable('reseller_reviews', {
  id: text('id').primaryKey(),
  resellerId: text('reseller_id').references(() => trustedResellers.id).notNull(),
  reviewerId: text('reviewer_id').references(() => profiles.id),
  rating: integer('rating').notNull().default(5),
  comment: text('comment'),
  dealType: varchar('deal_type', { length: 100 }),
  evidenceUrl: text('evidence_url'),
  isVisible: boolean('is_visible').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reseller Peer Trust Votes Table
export const resellerVotes = pgTable('reseller_votes', {
  id: text('id').primaryKey(),
  resellerId: text('reseller_id').references(() => trustedResellers.id).notNull(),
  voterId: text('voter_id').references(() => profiles.id).notNull(),
  voteType: varchar('vote_type', { length: 50 }).notNull().default('trust'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Escrow Partnerships Table
export const escrowPartnerships = pgTable('escrow_partnerships', {
  id: text('id').primaryKey(),
  resellerId: text('reseller_id').references(() => trustedResellers.id).notNull(),
  partnerResellerId: text('partner_reseller_id').references(() => trustedResellers.id).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  terms: text('terms'),
  dealsBrokered: integer('deals_brokered').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

