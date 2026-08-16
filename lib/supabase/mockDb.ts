import { 
  Profile, ScamReport, ScammerEntity, TrustedReseller, ResellerReview, 
  ScamType, EvidenceLink, RiskLevel, ResellerVerificationStatus, UserRole
} from '../../types';
import { computeScammerRiskScore, getRiskLevel, computeResellerTrustScore } from '../algorithms/trustScore';
import { findMatchingEntity } from '../algorithms/entityMatcher';
import { getStateRegion } from '../constants/indiaStates';

interface MockDatabase {
  profiles: Profile[];
  scam_reports: ScamReport[];
  scammer_entities: ScammerEntity[];
  trusted_resellers: TrustedReseller[];
  reseller_reviews: ResellerReview[];
  currentUser: Profile | null;
}

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-super-admin',
    username: '8xSentinel_ChiefAdmin',
    display_name: '8xSentinel Root Super Admin',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=chiefadmin',
    role: 'admin',
    roles: ['admin', 'super_admin'],
    primary_email: '8xSentinel@gmail.com',
    region: 'Global',
    state: 'National (Root)',
    store_status: 'approved',
    is_banned: false,
    ban_reason: null,
    reputation_points: 9999,
    reports_submitted: 50,
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    id: 'user-1',
    username: 'agent_sentinel',
    display_name: 'Sentinel Operator',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=sentinel',
    role: 'verified_reseller',
    roles: ['verified_reseller'],
    state: 'Delhi (NCT)',
    region: 'North India',
    store_status: 'approved',
    is_banned: false,
    ban_reason: null,
    reputation_points: 250,
    reports_submitted: 12,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    id: 'user-dual-role',
    username: 'apex_regional_vouch',
    display_name: 'Apex Trades (Regional Admin & Seller)',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=apexreg',
    role: 'regional_admin',
    roles: ['verified_reseller', 'regional_admin'],
    primary_email: 'apex_regional@sentinel.org',
    state: 'Punjab',
    region: 'North India',
    store_status: 'approved',
    is_banned: false,
    ban_reason: null,
    reputation_points: 480,
    reports_submitted: 18,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    id: 'user-2',
    username: 'bgmi_trader_pro',
    display_name: 'BGMI Trader Pro',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=trader',
    role: 'verified_reseller',
    roles: ['verified_reseller'],
    state: 'Maharashtra',
    region: 'West India',
    store_status: 'approved',
    is_banned: false,
    ban_reason: null,
    reputation_points: 40,
    reports_submitted: 2,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  },
  {
    id: 'user-3',
    username: 'mod_esports',
    display_name: 'Esports Arbiter',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=mod',
    role: 'regional_admin',
    roles: ['regional_admin'],
    state: 'Karnataka',
    region: 'South India',
    store_status: 'approved',
    is_banned: false,
    ban_reason: null,
    reputation_points: 110,
    reports_submitted: 4,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    last_seen: new Date().toISOString()
  }
];

const INITIAL_SCAMMER_ENTITIES: ScammerEntity[] = [
  {
    id: 'scammer-entity-1',
    canonical_name: 'Rohan Sharma (Fake Middleman)',
    risk_level: 'confirmed',
    trust_score: 8,
    report_count: 3,
    total_amount_lost: 18500,
    first_reported_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    last_reported_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    known_identifiers: {
      telegram: ['rohan_deals_bgmi', 'rohan_legit_middleman'],
      whatsapp: ['+919876543210', '+919988776655'],
      upi: ['rohansharma@ybl', 'dealsbyrohan@okhdfcbank'],
      instagram: ['rohan_bgmi_store'],
      bgmi_uid: ['5567891234']
    },
    is_verified_scammer: true,
    admin_notes: 'Highly active imposter impersonating trusted Telegram reseller channel admin.',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'scammer-entity-2',
    canonical_name: 'Aniket Gupta',
    risk_level: 'high',
    trust_score: 28,
    report_count: 1,
    total_amount_lost: 45000,
    first_reported_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_reported_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    known_identifiers: {
      telegram: ['aniket_bgmi_uc'],
      whatsapp: ['+918765432109'],
      upi: ['aniketgupta99@paytm'],
      instagram: ['aniket_trader_og']
    },
    is_verified_scammer: false,
    admin_notes: 'Ran off after receiving advance payment for high-tier glacier account.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_SCAM_REPORTS: ScamReport[] = [
  {
    id: 'rep-001',
    reporter_id: 'user-2',
    scammer_name: 'Rohan Sharma',
    telegram_username: '@rohan_deals_bgmi',
    whatsapp_number: '+91 98765-43210',
    upi_id: 'rohansharma@ybl',
    instagram_username: null,
    bgmi_uid: '5567891234',
    additional_identifiers: {},
    description: 'Offered an M416 Glacier Max account for ₹8,500. Insisted we use his trusted middleman, who turned out to be his second Telegram account. Took the payment and blocked me immediately.',
    amount_lost: 8500,
    currency: 'INR',
    incident_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scam_type: 'fake_account_sale',
    evidence_links: [
      { type: 'telegram', url: 'https://t.me/bgmiscamprecautions/1', label: 'Chat Logs' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa', label: 'Payment Receipt screenshot' }
    ],
    status: 'approved',
    moderated_by: 'user-1',
    moderated_at: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString(),
    rejection_reason: null,
    scammer_entity_id: 'scammer-entity-1',
    upvotes: 8,
    verified_by_count: 2,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rep-002',
    reporter_id: 'user-3',
    scammer_name: 'Rohan Deals Imposter',
    telegram_username: '@rohan_legit_middleman',
    whatsapp_number: null,
    upi_id: 'dealsbyrohan@okhdfcbank',
    instagram_username: '@rohan_bgmi_store',
    bgmi_uid: null,
    additional_identifiers: {},
    description: 'Impersonated Rohan Sharma. Offered middleman services for an account trade worth ₹10,000. Stole the account credentials from the seller and never released the payment to the buyer. Classic scam.',
    amount_lost: 10000,
    currency: 'INR',
    incident_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scam_type: 'impersonation',
    evidence_links: [
      { type: 'youtube', url: 'https://youtube.com', label: 'Expose Video Link' }
    ],
    status: 'approved',
    moderated_by: 'user-1',
    moderated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    rejection_reason: null,
    scammer_entity_id: 'scammer-entity-1',
    upvotes: 12,
    verified_by_count: 4,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rep-003',
    reporter_id: 'user-2',
    scammer_name: 'Aniket Gupta',
    telegram_username: '@aniket_bgmi_uc',
    whatsapp_number: '+91 87654-32109',
    upi_id: 'aniketgupta99@paytm',
    instagram_username: '@aniket_trader_og',
    bgmi_uid: null,
    additional_identifiers: {},
    description: 'Promised cheap UC top-ups (8100 UC for ₹4,500). Sent half the money as advance as requested. He deleted the chat history, changed his telegram handle from @aniket_deals to @aniket_bgmi_uc and blocked me.',
    amount_lost: 45000,
    currency: 'INR',
    incident_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    scam_type: 'advance_payment',
    evidence_links: [
      { type: 'drive', url: 'https://drive.google.com', label: 'Drive Folder Chat Recording' }
    ],
    status: 'approved',
    moderated_by: 'user-1',
    moderated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    rejection_reason: null,
    scammer_entity_id: 'scammer-entity-2',
    upvotes: 5,
    verified_by_count: 1,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_RESELLERS: TrustedReseller[] = [
  {
    id: 'reseller-1',
    profile_id: 'user-1',
    store_name: 'Sentinel OG Store',
    tagline: 'Definitive accounts & top-ups since 2021',
    bio: 'Official security partner of 8x Sentinel. We sell hand-verified BGMI OG accounts and official UC top-ups. Completely secure and risk-free.',
    telegram_username: 'sentinel_og_store',
    whatsapp_number: '+91 99999-88888',
    instagram_username: 'sentinel_og_deals',
    youtube_channel: 'https://youtube.com/@sentinel_deals',
    verification_status: 'approved',
    verified_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: 'user-super-admin',
    rejection_reason: null,
    trust_score: 98,
    deals_completed: 184,
    positive_feedback: 68,
    negative_feedback: 0,
    years_active: 3.2,
    specializes_in: ['account_sale', 'uc_topup', 'recovery'],
    badges: [
      { type: 'top_seller', earned_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'verified', earned_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    price_range: '₹5,000 - ₹1,500,000',
    state: 'Delhi (NCT)',
    region: 'North India',
    is_active: true,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reseller-2',
    profile_id: 'user-2',
    store_name: 'Arbiter BGMI Store',
    tagline: 'Secure trading, premium skins',
    bio: 'Professional esports skins trader and verified agent. Quick deals, transparent pricing, zero compromise on safety.',
    telegram_username: 'arbiter_deals',
    whatsapp_number: '+91 88888-77777',
    instagram_username: 'arbiter_bgmi',
    youtube_channel: null,
    verification_status: 'approved',
    verified_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: 'user-super-admin',
    rejection_reason: null,
    trust_score: 88,
    deals_completed: 45,
    positive_feedback: 18,
    negative_feedback: 1,
    years_active: 1.5,
    specializes_in: ['account_sale', 'item_trading'],
    badges: [
      { type: 'verified', earned_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    price_range: '₹2,000 - ₹100,000',
    state: 'Maharashtra',
    region: 'West India',
    is_active: true,
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reseller-3',
    profile_id: 'user-dual-role',
    store_name: 'Apex Regional Trades',
    tagline: 'Punjab & North India regional powerhouse',
    bio: 'Certified Regional Admin & OG account supplier. Specializing in verified tier-1 squad transfers and custom loadouts.',
    telegram_username: 'apex_punjab_deals',
    whatsapp_number: '+91 97777-66666',
    instagram_username: 'apex_punjab_bgmi',
    youtube_channel: null,
    verification_status: 'approved',
    verified_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: 'user-super-admin',
    rejection_reason: null,
    trust_score: 95,
    deals_completed: 120,
    positive_feedback: 54,
    negative_feedback: 0,
    years_active: 2.8,
    specializes_in: ['account_sale', 'uc_topup'],
    badges: [
      { type: 'top_seller', earned_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'verified', earned_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    price_range: '₹10,000 - ₹500,000',
    state: 'Punjab',
    region: 'North India',
    is_active: true,
    created_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reseller-4',
    profile_id: 'user-3',
    store_name: 'Bangalore BGMI Vault',
    tagline: 'Karnataka official trade desk',
    bio: 'South India verified regional distribution point. High safety escrow transfers, instant UC recharge.',
    telegram_username: 'bengaluru_vault',
    whatsapp_number: '+91 96666-55555',
    instagram_username: 'bengaluru_vault_bgmi',
    youtube_channel: null,
    verification_status: 'approved',
    verified_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: 'user-super-admin',
    rejection_reason: null,
    trust_score: 92,
    deals_completed: 82,
    positive_feedback: 39,
    negative_feedback: 0,
    years_active: 2.1,
    specializes_in: ['account_sale', 'uc_topup', 'recovery'],
    badges: [
      { type: 'verified', earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    price_range: '₹3,000 - ₹250,000',
    state: 'Karnataka',
    region: 'South India',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_REVIEWS: ResellerReview[] = [
  {
    id: 'rev-001',
    reseller_id: 'reseller-1',
    reviewer_id: 'user-2',
    rating: 5,
    comment: 'Smooth transfer of a high-value account with level 7 glacier. Highly recommended middleman and reseller services!',
    deal_type: 'account_sale',
    is_verified_deal: true,
    is_visible: true,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-002',
    reseller_id: 'reseller-1',
    reviewer_id: 'user-3',
    rating: 5,
    comment: 'Got 8100 UC top-up. Processed within 5 minutes. Clean and safe.',
    deal_type: 'uc_topup',
    is_verified_deal: true,
    is_visible: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-003',
    reseller_id: 'reseller-2',
    reviewer_id: 'user-2',
    rating: 4,
    comment: 'Good response time. Safely completed the account trade. Took a bit longer than expected but clean.',
    deal_type: 'account_sale',
    is_verified_deal: false,
    is_visible: true,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DB_KEY = '8x_sentinel_mock_db_v1';

export function getMockDb(): MockDatabase {
  if (typeof window === 'undefined') {
    return {
      profiles: INITIAL_PROFILES,
      scam_reports: INITIAL_SCAM_REPORTS,
      scammer_entities: INITIAL_SCAMMER_ENTITIES,
      trusted_resellers: INITIAL_RESELLERS,
      reseller_reviews: INITIAL_REVIEWS,
      currentUser: INITIAL_PROFILES[0]
    };
  }

  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    const db: MockDatabase = {
      profiles: INITIAL_PROFILES,
      scam_reports: INITIAL_SCAM_REPORTS,
      scammer_entities: INITIAL_SCAMMER_ENTITIES,
      trusted_resellers: INITIAL_RESELLERS,
      reseller_reviews: INITIAL_REVIEWS,
      currentUser: INITIAL_PROFILES[0] // Set admin as default login for review convenience
    };
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  return JSON.parse(stored);
}

export function saveMockDb(db: MockDatabase) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
}

// Check if Supabase keys exist
export function isSupabaseConfigured(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''
  );
}

// Unified db helper methods that auto-fallback
export const db = {
  // Profiles
  getCurrentUser: (): Profile | null => {
    const db = getMockDb();
    return db.currentUser;
  },

  setCurrentUser: (role: UserRole | null, authEmail?: string): Profile | null => {
    const db = getMockDb();
    if (!role) {
      db.currentUser = null;
    } else if (role === 'admin' || role === 'super_admin') {
      const currentEmail = authEmail?.toLowerCase().trim() || db.currentUser?.primary_email?.toLowerCase().trim();
      if (currentEmail === '8xsentinel@gmail.com') {
        const superAdmin = db.profiles.find(p => p.primary_email?.toLowerCase() === '8xsentinel@gmail.com');
        if (superAdmin) db.currentUser = superAdmin;
      } else {
        console.warn('[SECURITY] Admin role elevation blocked: Only 8xSentinel@gmail.com is authorized.');
        return db.currentUser;
      }
    } else {
      const match = db.profiles.find(p => p.role === role);
      if (match) db.currentUser = match;
    }
    saveMockDb(db);
    return db.currentUser;
  },

  syncFirebaseUser: (email: string, displayName?: string, photoURL?: string): Profile => {
    const dbData = getMockDb();
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Permanent Super Admin Check: ONLY for 8xSentinel@gmail.com
    if (cleanEmail === '8xsentinel@gmail.com') {
      let superAdmin = dbData.profiles.find(p => p.primary_email?.toLowerCase() === '8xsentinel@gmail.com');
      if (!superAdmin) {
        superAdmin = {
          id: 'user-super-admin',
          username: '8xSentinel_RootAdmin',
          display_name: displayName || '8xSentinel Root Super Admin',
          avatar_url: photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=chiefadmin',
          role: 'admin',
          roles: ['admin', 'super_admin'],
          primary_email: '8xSentinel@gmail.com',
          region: 'Global',
          is_banned: false,
          ban_reason: null,
          reputation_points: 9999,
          reports_submitted: 50,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        };
        dbData.profiles.unshift(superAdmin);
      } else {
        superAdmin.role = 'admin';
        superAdmin.roles = ['admin', 'super_admin'];
        if (photoURL) superAdmin.avatar_url = photoURL;
        if (displayName) superAdmin.display_name = displayName;
        superAdmin.last_seen = new Date().toISOString();
      }
      dbData.currentUser = superAdmin;
      saveMockDb(dbData);
      return superAdmin;
    }

    // 2. Non-admin users: Ensure they NEVER have super admin role
    let existing = dbData.profiles.find(
      p => p.primary_email && p.primary_email.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.role === 'admin' || existing.role === 'super_admin') {
        existing.role = 'user';
        existing.roles = ['user'];
      }
      existing.last_seen = new Date().toISOString();
      if (photoURL && !existing.avatar_url) existing.avatar_url = photoURL;
      if (displayName && !existing.display_name) existing.display_name = displayName;
      
      // Sync store status from trusted_resellers table
      const storeApp = dbData.trusted_resellers.find(r => r.profile_id === existing!.id);
      if (storeApp) {
        existing.store_status = storeApp.verification_status;
        existing.state = storeApp.state || existing.state;
        existing.region = storeApp.region || existing.region;
        if (storeApp.verification_status === 'approved' && existing.role !== 'regional_admin') {
          existing.role = 'verified_reseller';
        }
      } else if (!existing.store_status) {
        existing.store_status = 'not_registered';
      }

      dbData.currentUser = existing;
      saveMockDb(dbData);
      return existing;
    }

    // 3. Create new profile automatically for authenticated user
    const username = cleanEmail ? cleanEmail.split('@')[0] : `user_${Date.now().toString().slice(-4)}`;
    const newProfile: Profile = {
      id: `user-${Date.now()}`,
      username,
      display_name: displayName || username || 'Merchant Candidate',
      avatar_url: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      role: 'user',
      roles: ['user'],
      primary_email: email,
      store_status: 'not_registered',
      is_banned: false,
      ban_reason: null,
      reputation_points: 10,
      reports_submitted: 0,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString()
    };
    dbData.profiles.push(newProfile);
    dbData.currentUser = newProfile;
    saveMockDb(dbData);
    return newProfile;
  },

  registerUser: (username: string, display_name: string): Profile => {
    const db = getMockDb();
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      username: username.toLowerCase().trim(),
      display_name,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      role: 'user',
      is_banned: false,
      ban_reason: null,
      reputation_points: 0,
      reports_submitted: 0,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString()
    };
    db.profiles.push(newUser);
    db.currentUser = newUser;
    saveMockDb(db);
    return newUser;
  },

  // Search
  search: (query: string, type: 'all' | 'phone' | 'telegram' | 'whatsapp_username' | 'upi' | 'instagram' | 'bank_account' | 'bgmi_uid') => {
    const db = getMockDb();
    const cleanQuery = query.trim().toLowerCase().replace(/^@/, '');

    if (!cleanQuery) {
      return { scammers: [], resellers: [] };
    }

    // Filter scammers
    const scammers = db.scammer_entities.filter(entity => {
      const ids = entity.known_identifiers || {};
      
      const matchName = entity.canonical_name.toLowerCase().includes(cleanQuery);
      
      const matchTg = ids.telegram?.some(v => v.toLowerCase().includes(cleanQuery));
      const matchWhatsapp = ids.whatsapp?.some(v => v.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, '')));
      const matchWhatsappUser = ids.whatsapp_username?.some(v => v.toLowerCase().includes(cleanQuery));
      const matchUpi = ids.upi?.some(v => v.toLowerCase().includes(cleanQuery));
      const matchInsta = ids.instagram?.some(v => v.toLowerCase().includes(cleanQuery));
      const matchBank = ids.bank_account?.some(v => v.toLowerCase().includes(cleanQuery));
      const matchUid = ids.bgmi_uid?.some(v => v.includes(cleanQuery));

      if (type === 'all') {
        return matchName || matchTg || matchWhatsapp || matchWhatsappUser || matchUpi || matchInsta || matchBank || matchUid;
      }
      if (type === 'telegram') return matchTg;
      if (type === 'phone') return matchWhatsapp;
      if (type === 'whatsapp_username') return matchWhatsappUser || matchWhatsapp;
      if (type === 'upi') return matchUpi;
      if (type === 'instagram') return matchInsta;
      if (type === 'bank_account') return matchBank;
      if (type === 'bgmi_uid') return matchUid;
      return false;
    });

    // Filter resellers
    const resellers = db.trusted_resellers.filter(reseller => {
      if (reseller.verification_status !== 'approved') return false;

      const matchStore = reseller.store_name.toLowerCase().includes(cleanQuery);
      const matchTg = reseller.telegram_username?.toLowerCase().includes(cleanQuery);
      const matchWhatsapp = reseller.whatsapp_number?.replace(/\D/g, '').includes(cleanQuery.replace(/\D/g, ''));
      const matchInsta = reseller.instagram_username?.toLowerCase().includes(cleanQuery);

      if (type === 'all') {
        return matchStore || matchTg || matchWhatsapp || matchInsta;
      }
      if (type === 'telegram') return matchTg;
      if (type === 'phone' || type === 'whatsapp_username') return matchWhatsapp;
      if (type === 'instagram') return matchInsta;
      return false;
    }).map(reseller => {
      // Attach profile
      const prof = db.profiles.find(p => p.id === reseller.profile_id);
      return {
        ...reseller,
        profile: prof
      };
    });

    return { scammers, resellers };
  },

  // Scam Reports
  getReport: (id: string): ScamReport | null => {
    const db = getMockDb();
    const report = db.scam_reports.find(r => r.id === id);
    if (!report) return null;
    
    // Attach profile and entity details
    const reporter = db.profiles.find(p => p.id === report.reporter_id);
    const entity = db.scammer_entities.find(e => e.id === report.scammer_entity_id);

    return {
      ...report,
      reporter,
      scammer_entity: entity
    };
  },

  getLatestApprovedReports: (limit = 5): ScamReport[] => {
    const db = getMockDb();
    return db.scam_reports
      .filter(r => r.status === 'approved')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map(report => {
        const entity = db.scammer_entities.find(e => e.id === report.scammer_entity_id);
        return {
          ...report,
          scammer_entity: entity
        };
      });
  },

  submitReport: (reportData: Partial<ScamReport>): ScamReport => {
    const dbData = getMockDb();
    const reporter = dbData.currentUser;

    const newReport: ScamReport = {
      id: `rep-${Date.now()}`,
      reporter_id: reporter?.id || 'anonymous',
      scammer_name: reportData.scammer_name || 'Unknown',
      telegram_username: reportData.telegram_username || null,
      whatsapp_number: reportData.whatsapp_number || null,
      upi_id: reportData.upi_id || null,
      instagram_username: reportData.instagram_username || null,
      bgmi_uid: reportData.bgmi_uid || null,
      additional_identifiers: reportData.additional_identifiers || {},
      description: reportData.description || '',
      amount_lost: Number(reportData.amount_lost) || 0,
      victim_phone_number: reportData.victim_phone_number || null,
      currency: 'INR',
      incident_date: reportData.incident_date || new Date().toISOString().split('T')[0],
      scam_type: reportData.scam_type || 'other',
      evidence_links: reportData.evidence_links || [],
      status: 'pending',
      moderated_by: null,
      moderated_at: null,
      rejection_reason: null,
      scammer_entity_id: null,
      upvotes: 0,
      verified_by_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dbData.scam_reports.push(newReport);

    // Increase user reports count
    if (reporter) {
      const profile = dbData.profiles.find(p => p.id === reporter.id);
      if (profile) {
        profile.reports_submitted++;
        profile.reputation_points += 10; // Award 10 rep points for submission
      }
    }

    saveMockDb(dbData);
    return newReport;
  },

  voteReport: (reportId: string, voteType: 'upvote' | 'verify' | 'dispute'): ScamReport | null => {
    const dbData = getMockDb();
    const report = dbData.scam_reports.find(r => r.id === reportId);
    if (!report) return null;

    if (voteType === 'upvote') {
      report.upvotes++;
    } else if (voteType === 'verify') {
      report.verified_by_count++;
    }

    // If report is linked to an entity, update its scores
    if (report.scammer_entity_id) {
      const entity = dbData.scammer_entities.find(e => e.id === report.scammer_entity_id);
      if (entity) {
        if (voteType === 'verify') {
          entity.verified_by_count = (entity.verified_by_count || 0) + 1;
        }
        entity.trust_score = computeScammerRiskScore({
          report_count: entity.report_count,
          total_amount_lost: entity.total_amount_lost,
          verified_by_count: entity.verified_by_count || 0,
          is_verified_scammer: entity.is_verified_scammer,
          last_reported_at: entity.last_reported_at
        });
        entity.risk_level = getRiskLevel(entity.trust_score);
      }
    }

    saveMockDb(dbData);
    return report;
  },

  // Scammer Profile
  getScammerEntity: (entityId: string) => {
    const db = getMockDb();
    const entity = db.scammer_entities.find(e => e.id === entityId);
    if (!entity) return null;

    const reports = db.scam_reports.filter(
      r => r.scammer_entity_id === entityId && r.status === 'approved'
    );

    return {
      entity,
      reports
    };
  },

  // Resellers
  getResellers: (): TrustedReseller[] => {
    const db = getMockDb();
    return db.trusted_resellers
      .filter(r => r.verification_status === 'approved')
      .map(reseller => {
        const prof = db.profiles.find(p => p.id === reseller.profile_id);
        const scamReportCount = db.scam_reports.filter(
          r => r.status === 'approved' && 
          ((r.telegram_username && r.telegram_username.toLowerCase().replace('@', '') === reseller.telegram_username?.toLowerCase()) ||
           (r.whatsapp_number && r.whatsapp_number.replace(/\D/g, '') === reseller.whatsapp_number?.replace(/\D/g, '')))
        ).length;

        return {
          ...reseller,
          profile: prof,
          scam_report_count: scamReportCount,
          trust_score: computeResellerTrustScore({
            ...reseller,
            scam_report_count: scamReportCount
          })
        };
      });
  },

  getResellerByUsername: (username: string) => {
    const dbData = getMockDb();
    const profile = dbData.profiles.find(p => p.username === username);
    if (!profile) return null;

    const reseller = dbData.trusted_resellers.find(r => r.profile_id === profile.id);
    if (!reseller) return null;

    const reviews = dbData.reseller_reviews
      .filter(rev => rev.reseller_id === reseller.id && rev.is_visible)
      .map(rev => {
        const revProfile = dbData.profiles.find(p => p.id === rev.reviewer_id);
        return {
          ...rev,
          reviewer: revProfile
        };
      });

    // Count reports
    const scamReportCount = dbData.scam_reports.filter(
      r => r.status === 'approved' && 
      ((r.telegram_username && r.telegram_username.toLowerCase().replace('@', '') === reseller.telegram_username?.toLowerCase()) ||
       (r.whatsapp_number && r.whatsapp_number.replace(/\D/g, '') === reseller.whatsapp_number?.replace(/\D/g, '')))
    ).length;

    const score = computeResellerTrustScore({
      ...reseller,
      scam_report_count: scamReportCount
    });

    return {
      reseller: {
        ...reseller,
        profile,
        scam_report_count: scamReportCount,
        trust_score: score
      },
      reviews
    };
  },

  submitResellerReview: (resellerId: string, rating: number, comment: string, dealType: string): ResellerReview | null => {
    const dbData = getMockDb();
    const user = dbData.currentUser;
    if (!user) return null;

    const reseller = dbData.trusted_resellers.find(r => r.id === resellerId);
    if (!reseller) return null;

    const newReview: ResellerReview = {
      id: `rev-${Date.now()}`,
      reseller_id: resellerId,
      reviewer_id: user.id,
      rating,
      comment,
      deal_type: dealType,
      is_verified_deal: true, // Auto verify mock deals
      is_visible: true,
      created_at: new Date().toISOString()
    };

    dbData.reseller_reviews.push(newReview);

    // Recalculate feedback score
    if (rating >= 4) {
      reseller.positive_feedback++;
    } else {
      reseller.negative_feedback++;
    }
    reseller.deals_completed++;

    // Re-calc trust score
    const scamReportCount = dbData.scam_reports.filter(
      r => r.status === 'approved' && 
      ((r.telegram_username && r.telegram_username.toLowerCase().replace('@', '') === reseller.telegram_username?.toLowerCase()) ||
       (r.whatsapp_number && r.whatsapp_number.replace(/\D/g, '') === reseller.whatsapp_number?.replace(/\D/g, '')))
    ).length;

    reseller.trust_score = computeResellerTrustScore({
      ...reseller,
      scam_report_count: scamReportCount
    });

    saveMockDb(dbData);
    return newReview;
  },

  getUserStoreApplication: (profileId: string): TrustedReseller | null => {
    const db = getMockDb();
    if (!profileId) {
      if (db.currentUser) {
        profileId = db.currentUser.id;
      }
    }
    return db.trusted_resellers.find(r => r.profile_id === profileId) || 
           (db.currentUser ? db.trusted_resellers.find(r => r.profile_id === db.currentUser?.id) : null) || null;
  },

  applyForReseller: (storeData: Partial<TrustedReseller>): TrustedReseller | null => {
    const dbData = getMockDb();
    let user = dbData.currentUser;
    if (!user) {
      // Find the last registered non-admin profile or active profile
      user = dbData.profiles.find(p => p.role === 'user' || p.role === 'verified_reseller') || dbData.profiles[0];
      if (user) {
        dbData.currentUser = user;
      } else {
        return null;
      }
    }

    const chosenState = storeData.state || 'Delhi (NCT)';
    const region = getStateRegion(chosenState);

    let existing = dbData.trusted_resellers.find(r => r.profile_id === user.id);

    if (existing) {
      existing.store_name = storeData.store_name || existing.store_name;
      existing.state = chosenState;
      existing.region = region;
      existing.country_code = storeData.country_code || existing.country_code || '+91';
      existing.primary_platform = storeData.primary_platform || existing.primary_platform || 'whatsapp_primary';
      existing.operating_since_year = storeData.operating_since_year !== undefined ? storeData.operating_since_year : existing.operating_since_year;
      existing.tagline = storeData.tagline !== undefined ? storeData.tagline : existing.tagline;
      existing.bio = storeData.bio !== undefined ? storeData.bio : existing.bio;
      existing.telegram_username = storeData.telegram_username ? storeData.telegram_username.replace('@', '') : existing.telegram_username;
      existing.telegram_channel_link = storeData.telegram_channel_link !== undefined ? storeData.telegram_channel_link : existing.telegram_channel_link;
      existing.whatsapp_number = storeData.whatsapp_number !== undefined ? storeData.whatsapp_number : existing.whatsapp_number;
      existing.whatsapp_username = storeData.whatsapp_username !== undefined ? storeData.whatsapp_username : existing.whatsapp_username;
      existing.whatsapp_group_link = storeData.whatsapp_group_link !== undefined ? storeData.whatsapp_group_link : existing.whatsapp_group_link;
      existing.instagram_username = storeData.instagram_username ? storeData.instagram_username.replace('@', '') : existing.instagram_username;
      existing.youtube_channel = storeData.youtube_channel !== undefined ? storeData.youtube_channel : existing.youtube_channel;
      existing.bgmi_uid = storeData.bgmi_uid !== undefined ? storeData.bgmi_uid : existing.bgmi_uid;
      existing.specializes_in = storeData.specializes_in || existing.specializes_in;
      existing.years_active = storeData.years_active !== undefined ? Number(storeData.years_active) : existing.years_active;
      existing.price_range = storeData.price_range !== undefined ? storeData.price_range : existing.price_range;
      existing.verification_status = 'pending';
      existing.updated_at = new Date().toISOString();
    } else {
      existing = {
        id: `reseller-${Date.now()}`,
        profile_id: user.id,
        store_name: storeData.store_name || `${user.display_name || user.username}'s Store`,
        tagline: storeData.tagline || null,
        bio: storeData.bio || null,
        telegram_username: storeData.telegram_username?.replace('@', '') || null,
        telegram_channel_link: storeData.telegram_channel_link || null,
        whatsapp_number: storeData.whatsapp_number || null,
        whatsapp_username: storeData.whatsapp_username || null,
        whatsapp_group_link: storeData.whatsapp_group_link || null,
        instagram_username: storeData.instagram_username?.replace('@', '') || null,
        youtube_channel: storeData.youtube_channel || null,
        bgmi_uid: storeData.bgmi_uid || null,
        country_code: storeData.country_code || '+91',
        primary_platform: storeData.primary_platform || 'whatsapp_primary',
        operating_since_year: storeData.operating_since_year || 2022,
        verification_status: 'pending',
        verified_at: null,
        verified_by: null,
        rejection_reason: null,
        trust_score: 30, // Base default score
        deals_completed: 0,
        positive_feedback: 0,
        negative_feedback: 0,
        years_active: Number(storeData.years_active) || 0,
        specializes_in: storeData.specializes_in || ['account_sale'],
        badges: [],
        price_range: storeData.price_range || null,
        state: chosenState,
        region: region,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      dbData.trusted_resellers.push(existing);
    }

    // Update user profile in database
    const profile = dbData.profiles.find(p => p.id === user.id);
    if (profile) {
      profile.store_status = 'pending';
      profile.state = chosenState;
      profile.region = region;
      profile.primary_platform = existing.primary_platform;
      profile.country_code = existing.country_code;
      profile.whatsapp_username = existing.whatsapp_username;
      profile.whatsapp_group_link = existing.whatsapp_group_link;
      profile.telegram_channel_link = existing.telegram_channel_link;
      profile.operating_since_year = existing.operating_since_year;
      dbData.currentUser = profile;
    }

    saveMockDb(dbData);
    return existing;
  },

  // Admin moderation queues
  getPendingReports: (): ScamReport[] => {
    const db = getMockDb();
    return db.scam_reports
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getPendingResellers: (): TrustedReseller[] => {
    const db = getMockDb();
    return db.trusted_resellers
      .filter(r => r.verification_status === 'pending')
      .map(reseller => {
        const prof = db.profiles.find(p => p.id === reseller.profile_id);
        return {
          ...reseller,
          profile: prof
        };
      });
  },

  moderateReport: (reportId: string, status: 'approved' | 'rejected', rejectionReason?: string): ScamReport | null => {
    const dbData = getMockDb();
    const admin = dbData.currentUser;
    if (!admin || admin.role === 'user') return null;

    const report = dbData.scam_reports.find(r => r.id === reportId);
    if (!report) return null;

    report.status = status as any;
    report.moderated_by = admin.id;
    report.moderated_at = new Date().toISOString();
    
    if (status === 'rejected') {
      report.rejection_reason = rejectionReason || 'Does not meet evidence guidelines.';
    } else if (status === 'approved') {
      // Run entity matching
      const identifiers = {
        telegram_username: report.telegram_username,
        whatsapp_number: report.whatsapp_number,
        upi_id: report.upi_id,
        instagram_username: report.instagram_username,
        bgmi_uid: report.bgmi_uid
      };

      const matchResult = findMatchingEntity(identifiers, dbData.scammer_entities);

      if (matchResult) {
        // Link to existing scammer entity
        const entity = dbData.scammer_entities.find(e => e.id === matchResult.entity.id)!;
        report.scammer_entity_id = entity.id;
        
        entity.report_count++;
        entity.total_amount_lost += report.amount_lost;
        entity.last_reported_at = new Date().toISOString();

        // Update known identifiers without duplicates
        const known = entity.known_identifiers || {};
        if (report.telegram_username) {
          const val = report.telegram_username.replace('@', '');
          known.telegram = Array.from(new Set([...(known.telegram || []), val]));
        }
        if (report.whatsapp_number) {
          known.whatsapp = Array.from(new Set([...(known.whatsapp || []), report.whatsapp_number]));
        }
        if (report.upi_id) {
          known.upi = Array.from(new Set([...(known.upi || []), report.upi_id]));
        }
        if (report.instagram_username) {
          const val = report.instagram_username.replace('@', '');
          known.instagram = Array.from(new Set([...(known.instagram || []), val]));
        }
        if (report.bgmi_uid) {
          known.bgmi_uid = Array.from(new Set([...(known.bgmi_uid || []), report.bgmi_uid]));
        }
        
        entity.known_identifiers = known;
        entity.trust_score = computeScammerRiskScore({
          report_count: entity.report_count,
          total_amount_lost: entity.total_amount_lost,
          verified_by_count: entity.verified_by_count || 0,
          is_verified_scammer: entity.is_verified_scammer,
          last_reported_at: entity.last_reported_at
        });
        entity.risk_level = getRiskLevel(entity.trust_score);
      } else {
        // Create new scammer entity
        const newEntityId = `scammer-entity-${Date.now()}`;
        const known: Record<string, string[]> = {};
        if (report.telegram_username) known.telegram = [report.telegram_username.replace('@', '')];
        if (report.whatsapp_number) known.whatsapp = [report.whatsapp_number];
        if (report.upi_id) known.upi = [report.upi_id];
        if (report.instagram_username) known.instagram = [report.instagram_username.replace('@', '')];
        if (report.bgmi_uid) known.bgmi_uid = [report.bgmi_uid];

        const newEntity: ScammerEntity = {
          id: newEntityId,
          canonical_name: report.scammer_name || 'Identified Scammer',
          risk_level: 'medium',
          trust_score: 50,
          report_count: 1,
          total_amount_lost: report.amount_lost,
          first_reported_at: new Date().toISOString(),
          last_reported_at: new Date().toISOString(),
          known_identifiers: known,
          is_verified_scammer: false,
          admin_notes: `First reported on ${new Date().toLocaleDateString()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        newEntity.trust_score = computeScammerRiskScore({
          report_count: newEntity.report_count,
          total_amount_lost: newEntity.total_amount_lost,
          verified_by_count: newEntity.verified_by_count || 0,
          is_verified_scammer: newEntity.is_verified_scammer,
          last_reported_at: newEntity.last_reported_at
        });
        newEntity.risk_level = getRiskLevel(newEntity.trust_score);

        dbData.scammer_entities.push(newEntity);
        report.scammer_entity_id = newEntityId;
      }
    }

    saveMockDb(dbData);
    return report;
  },

  voteReseller: (resellerId: string, voteType: 'trust' | 'distrust'): TrustedReseller | null => {
    const dbData = getMockDb();
    const voter = dbData.currentUser;
    if (!voter) return null;

    const reseller = dbData.trusted_resellers.find(r => r.id === resellerId);
    if (!reseller) return null;

    if (voteType === 'trust') {
      reseller.trust_score = Math.min(100, reseller.trust_score + 5);
      reseller.positive_feedback++;
    } else {
      reseller.trust_score = Math.max(0, reseller.trust_score - 5);
      reseller.negative_feedback++;
    }
    
    saveMockDb(dbData);
    return reseller;
  },

  assignRegionalAdmin: (userId: string, stateOrRegion: string): Profile | null => {
    const dbData = getMockDb();
    const profile = dbData.profiles.find(p => p.id === userId);
    if (!profile) return null;

    profile.role = 'regional_admin';
    if (!profile.roles) profile.roles = ['verified_reseller'];
    if (!profile.roles.includes('regional_admin')) {
      profile.roles.push('regional_admin');
    }
    profile.state = stateOrRegion;
    profile.region = getStateRegion(stateOrRegion);
    saveMockDb(dbData);
    return profile;
  },

  verifySellerByRegionalAdmin: (resellerId: string, regionalAdminId: string): TrustedReseller | null => {
    const dbData = getMockDb();
    const admin = dbData.profiles.find(p => p.id === regionalAdminId);
    const reseller = dbData.trusted_resellers.find(r => r.id === resellerId);

    if (!reseller || !admin) return null;

    reseller.verification_status = 'approved';
    reseller.verified_by_regional_admin_id = admin.id;
    reseller.verified_by_regional_admin_name = admin.display_name || admin.username;
    reseller.verified_at = new Date().toISOString();
    if (!reseller.state && admin.state) reseller.state = admin.state;
    reseller.region = reseller.state ? getStateRegion(reseller.state) : admin.region || 'North India';

    // Upgrade seller profile
    const sellerProfile = dbData.profiles.find(p => p.id === reseller.profile_id);
    if (sellerProfile) {
      if (sellerProfile.role !== 'regional_admin' && sellerProfile.role !== 'admin') {
        sellerProfile.role = 'verified_reseller';
      }
      if (!sellerProfile.roles) sellerProfile.roles = ['user'];
      if (!sellerProfile.roles.includes('verified_reseller')) {
        sellerProfile.roles.push('verified_reseller');
      }
      sellerProfile.store_status = 'approved';
      sellerProfile.state = reseller.state || sellerProfile.state;
      sellerProfile.region = reseller.region || sellerProfile.region;
    }

    saveMockDb(dbData);
    return reseller;
  },

  moderateReseller: (resellerId: string, status: 'approved' | 'rejected' | 'suspended', rejectionReason?: string): TrustedReseller | null => {
    const dbData = getMockDb();
    const admin = dbData.currentUser;
    if (!admin || admin.role === 'user') return null;

    const reseller = dbData.trusted_resellers.find(r => r.id === resellerId);
    if (!reseller) return null;

    reseller.verification_status = status as any;
    reseller.verified_by = admin.id;
    reseller.verified_at = new Date().toISOString();
    reseller.updated_at = new Date().toISOString();

    const sellerProfile = dbData.profiles.find(p => p.id === reseller.profile_id);

    if (status === 'rejected') {
      reseller.rejection_reason = rejectionReason || 'Does not meet our trading standard requirements.';
      if (sellerProfile) {
        sellerProfile.store_status = 'rejected';
      }
    } else if (status === 'approved') {
      reseller.badges = [
        { type: 'verified', earned_at: new Date().toISOString() }
      ];
      reseller.trust_score = computeResellerTrustScore({
        ...reseller,
        scam_report_count: 0
      });

      if (sellerProfile) {
        if (sellerProfile.role !== 'regional_admin' && sellerProfile.role !== 'admin') {
          sellerProfile.role = 'verified_reseller';
        }
        if (!sellerProfile.roles) sellerProfile.roles = ['user'];
        if (!sellerProfile.roles.includes('verified_reseller')) {
          sellerProfile.roles.push('verified_reseller');
        }
        sellerProfile.store_status = 'approved';
        sellerProfile.state = reseller.state || sellerProfile.state;
        sellerProfile.region = reseller.region || sellerProfile.region;
      }
    }

    saveMockDb(dbData);
    return reseller;
  },

  // Overview stats
  getPlatformStats: () => {
    const db = getMockDb();
    const approvedReports = db.scam_reports.filter(r => r.status === 'approved');
    const totalReports = approvedReports.length;
    const totalScammers = db.scammer_entities.length;
    const totalProtected = approvedReports.reduce((sum, r) => sum + r.amount_lost, 0);
    const verifiedSellers = db.trusted_resellers.filter(r => r.verification_status === 'approved').length;

    // Additional admin panel analytics
    const pendingReportsCount = db.scam_reports.filter(r => r.status === 'pending').length;
    const pendingResellersCount = db.trusted_resellers.filter(r => r.verification_status === 'pending').length;
    
    // Graph reports over time
    const reportsOverTime = approvedReports
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(r => ({
        date: new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount: r.amount_lost
      }));

    // Scam types breakdown
    const scamTypesCount = approvedReports.reduce((acc, r) => {
      acc[r.scam_type] = (acc[r.scam_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      counters: {
        totalReports,
        totalScammers,
        totalProtected,
        verifiedSellers
      },
      queues: {
        pendingReportsCount,
        pendingResellersCount
      },
      reportsOverTime,
      scamTypesCount
    };
  }
};
