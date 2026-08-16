import * as serverActions from './serverActions';
import { Profile, ScamReport, TrustedReseller } from '../types';

export { isSupabaseConfigured } from './supabase/supabaseClient';

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      newObj[snakeKey] = convertKeysToSnakeCase(obj[key]);
    }
  }
  return newObj;
}

export const db = {
  // Profiles & Sessions
  getCurrentUser: (): Profile | null => {
    console.warn("db.getCurrentUser() is deprecated. Please use useAuth().profile instead.");
    return null;
  },

  setCurrentUser: (role: any, authEmail?: string): Profile | null => {
    console.warn("db.setCurrentUser() is deprecated.");
    return null;
  },

  syncFirebaseUser: async (email: string, displayName?: string, photoURL?: string): Promise<Profile> => {
    return convertKeysToSnakeCase(await serverActions.syncFirebaseUser(email, displayName, photoURL));
  },

  registerUser: async (username: string, display_name: string): Promise<Profile> => {
    return convertKeysToSnakeCase(await serverActions.registerUser(username, display_name));
  },

  // Search Engine
  search: async (query: string, type: string) => {
    return convertKeysToSnakeCase(await serverActions.search(query, type));
  },

  // Scam Reports
  getReport: async (id: string): Promise<ScamReport | null> => {
    return convertKeysToSnakeCase(await serverActions.getReport(id)) as any;
  },

  getLatestApprovedReports: async (limit = 5): Promise<ScamReport[]> => {
    return convertKeysToSnakeCase(await serverActions.getLatestApprovedReports(limit)) as any;
  },

  getUserReports: async (userId: string): Promise<ScamReport[]> => {
    return convertKeysToSnakeCase(await serverActions.getUserReports(userId)) as any;
  },

  submitReport: async (reportData: Partial<ScamReport>): Promise<ScamReport> => {
    return convertKeysToSnakeCase(await serverActions.submitReport(reportData)) as any;
  },

  voteReport: async (reportId: string, voteType: 'upvote' | 'verify' | 'dispute'): Promise<ScamReport | null> => {
    return convertKeysToSnakeCase(await serverActions.voteReport(reportId, voteType)) as any;
  },

  withdrawReport: async (reportId: string, withdrawalReason: string, userId?: string) => {
    return convertKeysToSnakeCase(await serverActions.withdrawReport(reportId, withdrawalReason, userId)) as any;
  },

  voteReseller: async (resellerId: string, voteType: 'trust' | 'distrust'): Promise<TrustedReseller | null> => {
    return convertKeysToSnakeCase(await serverActions.voteReseller(resellerId, voteType)) as any;
  },

  assignRegionalAdmin: async (userId: string, region: string): Promise<Profile | null> => {
    return convertKeysToSnakeCase(await serverActions.assignRegionalAdmin(userId, region)) as any;
  },

  verifySellerByRegionalAdmin: async (resellerId: string, regionalAdminId: string): Promise<TrustedReseller | null> => {
    return convertKeysToSnakeCase(await serverActions.verifySellerByRegionalAdmin(resellerId, regionalAdminId)) as any;
  },

  // Scammer Profiles
  getScammerEntity: async (entityId: string) => {
    return convertKeysToSnakeCase(await serverActions.getScammerEntity(entityId));
  },

  // Resellers
  getResellers: async (): Promise<TrustedReseller[]> => {
    return convertKeysToSnakeCase(await serverActions.getResellers()) as any;
  },

  getResellerByUsername: async (username: string) => {
    return convertKeysToSnakeCase(await serverActions.getResellerByUsername(username));
  },

  getResellerProfile: async (identifier: string) => {
    return convertKeysToSnakeCase(await serverActions.getResellerProfile(identifier));
  },

  voteResellerTrust: async (resellerId: string, voterProfileId: string) => {
    return await serverActions.voteResellerTrust(resellerId, voterProfileId);
  },

  toggleEscrowPartner: async (resellerId: string, partnerProfileId: string, terms?: string) => {
    return await serverActions.toggleEscrowPartner(resellerId, partnerProfileId, terms);
  },

  submitResellerReview: async (resellerId: string, rating: number, comment: string, dealType: string, reviewerId?: string) => {
    return await serverActions.submitResellerReview(resellerId, rating, comment, dealType, reviewerId);
  },

  getUserStoreApplication: async (profileId: string): Promise<TrustedReseller | null> => {
    return convertKeysToSnakeCase(await serverActions.getUserStoreApplication(profileId)) as any;
  },

  applyForReseller: async (storeData: Partial<TrustedReseller>): Promise<TrustedReseller | null> => {
    return convertKeysToSnakeCase(await serverActions.applyForReseller(storeData)) as any;
  },

  applyForSentinelTrusted: async (resellerId: string, kycData: any): Promise<TrustedReseller | null> => {
    return convertKeysToSnakeCase(await serverActions.applyForSentinelTrusted(resellerId, kycData)) as any;
  },

  // Admin moderation queues
  getPendingReports: async (): Promise<ScamReport[]> => {
    return convertKeysToSnakeCase(await serverActions.getPendingReports()) as any;
  },

  getPendingResellers: async (): Promise<TrustedReseller[]> => {
    return convertKeysToSnakeCase(await serverActions.getPendingResellers()) as any;
  },

  moderateReport: async (reportId: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<ScamReport | null> => {
    return convertKeysToSnakeCase(await serverActions.moderateReport(reportId, status, rejectionReason)) as any;
  },

  moderateReseller: async (resellerId: string, status: 'approved' | 'rejected' | 'suspended', rejectionReason?: string): Promise<TrustedReseller | null> => {
    return convertKeysToSnakeCase(await serverActions.moderateReseller(resellerId, status, rejectionReason)) as any;
  },

  getPlatformStats: async () => {
    return serverActions.getPlatformStats();
  }
};
