import { db as mockDb, getMockDb } from './supabase/mockDb';
import { 
  Profile, ScamReport, ScammerEntity, TrustedReseller, ResellerReview, 
  UserRole
} from '../types';

export { isSupabaseConfigured } from './supabase/supabaseClient';
export { getMockDb } from './supabase/mockDb';

export const db = {
  // Profiles & Sessions
  getCurrentUser: (): Profile | null => {
    return mockDb.getCurrentUser();
  },

  setCurrentUser: (role: UserRole | null, authEmail?: string): Profile | null => {
    return mockDb.setCurrentUser(role, authEmail);
  },

  syncFirebaseUser: (email: string, displayName?: string, photoURL?: string): Profile => {
    return mockDb.syncFirebaseUser(email, displayName, photoURL);
  },

  syncClerkUser: (email: string, username: string, name: string): Profile => {
    return mockDb.syncFirebaseUser(email, name);
  },

  registerUser: (username: string, display_name: string): Profile => {
    return mockDb.registerUser(username, display_name);
  },

  // Search Engine
  search: async (query: string, type: 'all' | 'phone' | 'telegram' | 'whatsapp_username' | 'upi' | 'instagram' | 'bank_account' | 'bgmi_uid') => {
    return mockDb.search(query, type);
  },

  // Scam Reports
  getReport: async (id: string): Promise<ScamReport | null> => {
    return mockDb.getReport(id);
  },

  getLatestApprovedReports: async (limit = 5): Promise<ScamReport[]> => {
    return mockDb.getLatestApprovedReports(limit);
  },

  submitReport: async (reportData: Partial<ScamReport>): Promise<ScamReport> => {
    return mockDb.submitReport(reportData);
  },

  voteReport: async (reportId: string, voteType: 'upvote' | 'verify' | 'dispute'): Promise<ScamReport | null> => {
    return mockDb.voteReport(reportId, voteType);
  },

  voteReseller: async (resellerId: string, voteType: 'trust' | 'distrust'): Promise<TrustedReseller | null> => {
    return mockDb.voteReseller(resellerId, voteType);
  },

  assignRegionalAdmin: async (userId: string, region: string): Promise<Profile | null> => {
    return mockDb.assignRegionalAdmin(userId, region);
  },

  verifySellerByRegionalAdmin: async (resellerId: string, regionalAdminId: string): Promise<TrustedReseller | null> => {
    return mockDb.verifySellerByRegionalAdmin(resellerId, regionalAdminId);
  },

  // Scammer Profiles
  getScammerEntity: async (entityId: string) => {
    return mockDb.getScammerEntity(entityId);
  },

  // Resellers
  getResellers: async (): Promise<TrustedReseller[]> => {
    return mockDb.getResellers();
  },

  getResellerByUsername: async (username: string) => {
    return mockDb.getResellerByUsername(username);
  },

  submitResellerReview: async (resellerId: string, rating: number, comment: string, dealType: string): Promise<ResellerReview | null> => {
    return mockDb.submitResellerReview(resellerId, rating, comment, dealType);
  },

  getUserStoreApplication: async (profileId: string): Promise<TrustedReseller | null> => {
    return mockDb.getUserStoreApplication(profileId);
  },

  applyForReseller: async (storeData: Partial<TrustedReseller>): Promise<TrustedReseller | null> => {
    return mockDb.applyForReseller(storeData);
  },

  // Admin moderation queues
  getPendingReports: async (): Promise<ScamReport[]> => {
    return mockDb.getPendingReports();
  },

  getPendingResellers: async (): Promise<TrustedReseller[]> => {
    return mockDb.getPendingResellers();
  },

  moderateReport: async (reportId: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<ScamReport | null> => {
    return mockDb.moderateReport(reportId, status, rejectionReason);
  },

  moderateReseller: async (resellerId: string, status: 'approved' | 'rejected' | 'suspended', rejectionReason?: string): Promise<TrustedReseller | null> => {
    return mockDb.moderateReseller(resellerId, status, rejectionReason);
  },

  getPlatformStats: async () => {
    return mockDb.getPlatformStats();
  }
};
