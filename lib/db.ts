import { db as mockDb, getMockDb } from './supabase/mockDb';
import { supabase, isSupabaseConfigured } from './supabase/supabaseClient';
import { 
  Profile, ScamReport, ScammerEntity, TrustedReseller, ResellerReview, 
  ScamType, EvidenceLink, RiskLevel, ResellerVerificationStatus 
} from '../types';

export { isSupabaseConfigured } from './supabase/supabaseClient';
export { getMockDb } from './supabase/mockDb';

export const db = {
  // Profiles & Sessions
  getCurrentUser: (): Profile | null => {
    // We maintain active testing session in mockDb (localStorage) for layout simplicity
    return mockDb.getCurrentUser();
  },

  setCurrentUser: (role: 'user' | 'moderator' | 'admin' | null): Profile | null => {
    return mockDb.setCurrentUser(role);
  },

  registerUser: (username: string, display_name: string): Profile => {
    const user = mockDb.registerUser(username, display_name);
    // If Supabase is connected, sync user profile in background
    if (isSupabaseConfigured() && supabase) {
      supabase.from('profiles').insert({
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        role: user.role,
        is_banned: user.is_banned,
        reputation_points: user.reputation_points,
        reports_submitted: user.reports_submitted,
        created_at: user.created_at,
        last_seen: user.last_seen
      }).then(({ error }) => {
        if (error) console.error("Supabase Profile Sync Error:", error.message);
      });
    }
    return user;
  },

  // Search Engine
  search: async (query: string, type: 'all' | 'phone' | 'telegram' | 'upi' | 'instagram' | 'bgmi_uid') => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.search(query, type);
    }

    const cleanQuery = query.trim().toLowerCase().replace(/^@/, '');
    if (!cleanQuery) return { scammers: [], resellers: [] };

    try {
      // 1. Query Scammers from Supabase
      let scammerQuery = supabase.from('scammer_entities').select('*');
      
      if (type === 'all') {
        scammerQuery = scammerQuery.or(`canonical_name.ilike.%${cleanQuery}%,known_identifiers.textSearch.${cleanQuery}`);
      } else {
        scammerQuery = scammerQuery.filter('known_identifiers', 'cs', JSON.stringify({ [type]: [cleanQuery] }));
      }
      
      const { data: scammersData, error: scammerError } = await scammerQuery;
      if (scammerError) throw scammerError;

      // 2. Query Resellers from Supabase
      let resellerQuery = supabase
        .from('trusted_resellers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('verification_status', 'approved');

      if (type === 'all') {
        resellerQuery = resellerQuery.or(`store_name.ilike.%${cleanQuery}%,telegram_username.ilike.%${cleanQuery}%,instagram_username.ilike.%${cleanQuery}%`);
      } else if (type === 'telegram') {
        resellerQuery = resellerQuery.ilike('telegram_username', `%${cleanQuery}%`);
      } else if (type === 'phone') {
        resellerQuery = resellerQuery.ilike('whatsapp_number', `%${cleanQuery}%`);
      } else if (type === 'instagram') {
        resellerQuery = resellerQuery.ilike('instagram_username', `%${cleanQuery}%`);
      }

      const { data: resellersData, error: resellerError } = await resellerQuery;
      if (resellerError) throw resellerError;

      // Sync search log to Supabase in background
      const activeUser = mockDb.getCurrentUser();
      supabase.from('search_logs').insert({
        query,
        query_type: type,
        result_count: (scammersData?.length || 0) + (resellersData?.length || 0),
        searcher_id: activeUser ? activeUser.id : null
      }).then(({ error }) => {
        if (error) console.error("Search Log Sync Error:", error.message);
      });

      return {
        scammers: (scammersData || []) as ScammerEntity[],
        resellers: (resellersData || []) as TrustedReseller[]
      };
    } catch (err) {
      console.warn("Supabase query failed, falling back to mockDb search. Error:", err);
      return mockDb.search(query, type);
    }
  },

  // Scam Reports
  getReport: async (id: string): Promise<ScamReport | null> => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getReport(id);
    }

    try {
      const { data, error } = await supabase
        .from('scam_reports')
        .select(`
          *,
          reporter:profiles(*),
          scammer_entity:scammer_entities(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ScamReport;
    } catch (err) {
      console.warn("Supabase getReport failed, falling back to mockDb. Error:", err);
      return mockDb.getReport(id);
    }
  },

  getLatestApprovedReports: async (limit = 5): Promise<ScamReport[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getLatestApprovedReports(limit);
    }

    try {
      const { data, error } = await supabase
        .from('scam_reports')
        .select(`
          *,
          scammer_entity:scammer_entities(*)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ScamReport[];
    } catch (err) {
      console.warn("Supabase getLatestApprovedReports failed, falling back to mockDb. Error:", err);
      return mockDb.getLatestApprovedReports(limit);
    }
  },

  submitReport: async (reportData: Partial<ScamReport>): Promise<ScamReport> => {
    // First commit to local mock database
    const localReport = mockDb.submitReport(reportData);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('scam_reports').insert({
          id: localReport.id,
          reporter_id: localReport.reporter_id === 'anonymous' ? null : localReport.reporter_id,
          scammer_name: localReport.scammer_name,
          telegram_username: localReport.telegram_username,
          whatsapp_number: localReport.whatsapp_number,
          upi_id: localReport.upi_id,
          instagram_username: localReport.instagram_username,
          bgmi_uid: localReport.bgmi_uid,
          additional_identifiers: localReport.additional_identifiers,
          description: localReport.description,
          amount_lost: localReport.amount_lost,
          currency: localReport.currency,
          incident_date: localReport.incident_date,
          scam_type: localReport.scam_type,
          evidence_links: localReport.evidence_links,
          status: 'pending'
        });
        if (error) throw error;
      } catch (err) {
        console.error("Supabase submitReport failed. Error:", err);
      }
    }
    return localReport;
  },

  voteReport: async (reportId: string, voteType: 'upvote' | 'verify' | 'dispute'): Promise<ScamReport | null> => {
    const localReport = mockDb.voteReport(reportId, voteType);
    
    if (isSupabaseConfigured() && supabase) {
      try {
        const user = mockDb.getCurrentUser();
        if (user) {
          // Log the vote in DB
          await supabase.from('report_votes').insert({
            report_id: reportId,
            voter_id: user.id,
            vote_type: voteType
          });

          // Increment counters in remote DB
          const updateObj: Record<string, any> = {};
          if (voteType === 'upvote') {
            updateObj.upvotes = (localReport?.upvotes || 0);
          } else if (voteType === 'verify') {
            updateObj.verified_by_count = (localReport?.verified_by_count || 0);
          }
          await supabase.from('scam_reports').update(updateObj).eq('id', reportId);
        }
      } catch (err) {
        console.error("Supabase voteReport failed. Error:", err);
      }
    }
    return localReport;
  },

  // Scammer Profiles
  getScammerEntity: async (entityId: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getScammerEntity(entityId);
    }

    try {
      const { data: entity, error: entityError } = await supabase
        .from('scammer_entities')
        .select('*')
        .eq('id', entityId)
        .single();

      if (entityError) throw entityError;

      const { data: reports, error: reportsError } = await supabase
        .from('scam_reports')
        .select('*')
        .eq('scammer_entity_id', entityId)
        .eq('status', 'approved');

      if (reportsError) throw reportsError;

      return {
        entity: entity as ScammerEntity,
        reports: (reports || []) as ScamReport[]
      };
    } catch (err) {
      console.warn("Supabase getScammerEntity failed, falling back to mockDb. Error:", err);
      return mockDb.getScammerEntity(entityId);
    }
  },

  // Resellers
  getResellers: async (): Promise<TrustedReseller[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getResellers();
    }

    try {
      const { data, error } = await supabase
        .from('trusted_resellers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('verification_status', 'approved');

      if (error) throw error;
      return (data || []) as TrustedReseller[];
    } catch (err) {
      console.warn("Supabase getResellers failed, falling back to mockDb. Error:", err);
      return mockDb.getResellers();
    }
  },

  getResellerByUsername: async (username: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getResellerByUsername(username);
    }

    try {
      // Find profile by username
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (pError) throw pError;

      // Get reseller matching profile id
      const { data: reseller, error: rError } = await supabase
        .from('trusted_resellers')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (rError) throw rError;

      // Get reviews
      const { data: reviews, error: revError } = await supabase
        .from('reseller_reviews')
        .select(`
          *,
          reviewer:profiles(*)
        `)
        .eq('reseller_id', reseller.id)
        .eq('is_visible', true);

      if (revError) throw revError;

      return {
        reseller: {
          ...reseller,
          profile
        } as TrustedReseller,
        reviews: (reviews || []) as ResellerReview[]
      };
    } catch (err) {
      console.warn("Supabase getResellerByUsername failed, falling back to mockDb. Error:", err);
      return mockDb.getResellerByUsername(username);
    }
  },

  submitResellerReview: async (resellerId: string, rating: number, comment: string, dealType: string): Promise<ResellerReview | null> => {
    const localReview = mockDb.submitResellerReview(resellerId, rating, comment, dealType);

    if (isSupabaseConfigured() && supabase && localReview) {
      try {
        await supabase.from('reseller_reviews').insert({
          id: localReview.id,
          reseller_id: resellerId,
          reviewer_id: localReview.reviewer_id,
          rating,
          comment,
          deal_type: dealType,
          is_verified_deal: true,
          is_visible: true
        });
      } catch (err) {
        console.error("Supabase submitResellerReview failed. Error:", err);
      }
    }
    return localReview;
  },

  applyForReseller: async (storeData: Partial<TrustedReseller>): Promise<TrustedReseller | null> => {
    const localReseller = mockDb.applyForReseller(storeData);

    if (isSupabaseConfigured() && supabase && localReseller) {
      try {
        await supabase.from('trusted_resellers').insert({
          id: localReseller.id,
          profile_id: localReseller.profile_id,
          store_name: localReseller.store_name,
          tagline: localReseller.tagline,
          bio: localReseller.bio,
          telegram_username: localReseller.telegram_username,
          whatsapp_number: localReseller.whatsapp_number,
          instagram_username: localReseller.instagram_username,
          youtube_channel: localReseller.youtube_channel,
          verification_status: 'pending',
          years_active: localReseller.years_active,
          specializes_in: localReseller.specializes_in,
          price_range: localReseller.price_range,
          is_active: true
        });
      } catch (err) {
        console.error("Supabase applyForReseller failed. Error:", err);
      }
    }
    return localReseller;
  },

  // Admin moderation queues
  getPendingReports: async (): Promise<ScamReport[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getPendingReports();
    }

    try {
      const { data, error } = await supabase
        .from('scam_reports')
        .select(`
          *,
          reporter:profiles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ScamReport[];
    } catch (err) {
      console.warn("Supabase getPendingReports failed, falling back to mockDb. Error:", err);
      return mockDb.getPendingReports();
    }
  },

  getPendingResellers: async (): Promise<TrustedReseller[]> => {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDb.getPendingResellers();
    }

    try {
      const { data, error } = await supabase
        .from('trusted_resellers')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('verification_status', 'pending');

      if (error) throw error;
      return (data || []) as TrustedReseller[];
    } catch (err) {
      console.warn("Supabase getPendingResellers failed, falling back to mockDb. Error:", err);
      return mockDb.getPendingResellers();
    }
  },

  moderateReport: async (reportId: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<ScamReport | null> => {
    const localReport = mockDb.moderateReport(reportId, status, rejectionReason);

    if (isSupabaseConfigured() && supabase && localReport) {
      try {
        const admin = mockDb.getCurrentUser();
        // 1. Update report status
        await supabase.from('scam_reports').update({
          status,
          moderated_by: admin ? admin.id : null,
          moderated_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
          scammer_entity_id: localReport.scammer_entity_id
        }).eq('id', reportId);

        // 2. Sync / insert matched scammer entity
        if (status === 'approved' && localReport.scammer_entity_id) {
          const entityData = getMockDb().scammer_entities.find(e => e.id === localReport.scammer_entity_id);
          if (entityData) {
            await supabase.from('scammer_entities').upsert({
              id: entityData.id,
              canonical_name: entityData.canonical_name,
              risk_level: entityData.risk_level,
              trust_score: entityData.trust_score,
              report_count: entityData.report_count,
              total_amount_lost: entityData.total_amount_lost,
              first_reported_at: entityData.first_reported_at,
              last_reported_at: entityData.last_reported_at,
              known_identifiers: entityData.known_identifiers,
              is_verified_scammer: entityData.is_verified_scammer,
              admin_notes: entityData.admin_notes
            });
          }
        }
      } catch (err) {
        console.error("Supabase moderateReport failed. Error:", err);
      }
    }
    return localReport;
  },

  moderateReseller: async (resellerId: string, status: 'approved' | 'rejected' | 'suspended', rejectionReason?: string): Promise<TrustedReseller | null> => {
    const localReseller = mockDb.moderateReseller(resellerId, status, rejectionReason);

    if (isSupabaseConfigured() && supabase && localReseller) {
      try {
        const admin = mockDb.getCurrentUser();
        await supabase.from('trusted_resellers').update({
          verification_status: status,
          verified_by: admin ? admin.id : null,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
          badges: localReseller.badges,
          trust_score: localReseller.trust_score
        }).eq('id', resellerId);
      } catch (err) {
        console.error("Supabase moderateReseller failed. Error:", err);
      }
    }
    return localReseller;
  },

  getPlatformStats: async () => {
    // Fallback is extremely rich and provides chart series, so we use it as base.
    // Sync to supabase if configured.
    return mockDb.getPlatformStats();
  }
};
