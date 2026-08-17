import { Profile } from '../types';

export type UserRole = 'sentinel' | 'regional_admin' | 'verified_reseller' | 'member' | 'super_admin' | 'user';

export const ROLES = {
  SENTINEL: 'sentinel',
  REGIONAL_ADMIN: 'regional_admin',
  VERIFIED_RESELLER: 'verified_reseller',
  MEMBER: 'member',
} as const;

/**
 * Check if the user is a Sentinel (Root/Super Admin)
 */
export function isSentinel(profile?: Profile | null, email?: string | null): boolean {
  if (email && email.toLowerCase().trim() === '8xsentinel@gmail.com') return true;
  if (!profile) return false;
  return profile.role === 'sentinel' || profile.role === 'super_admin';
}

/**
 * Check if the user is a Regional Administrator
 */
export function isRegionalAdmin(profile?: Profile | null): boolean {
  if (!profile) return false;
  return profile.role === 'regional_admin' || (profile.roles && profile.roles.includes('regional_admin')) || false;
}

/**
 * Check if the user is an approved Verified Reseller
 */
export function isVerifiedReseller(profile?: Profile | null): boolean {
  if (!profile) return false;
  return profile.role === 'verified_reseller' || profile.store_status === 'approved' || profile.storeStatus === 'approved';
}

/**
 * Check if the user is a Member (standard buyer/victim community user)
 */
export function isMember(profile?: Profile | null): boolean {
  if (!profile) return false;
  return profile.role === 'member' || profile.role === 'user' || (!isSentinel(profile) && !isRegionalAdmin(profile) && !isVerifiedReseller(profile));
}

/**
 * Permission: Can report scammers and file disputes
 * Allowed for: Member, Verified Reseller, Regional Admin, Sentinel
 */
export function canReportScammer(profile?: Profile | null): boolean {
  return Boolean(profile && profile.id);
}

/**
 * Permission: Can view Verified Resellers Directory & Public Reseller Profiles
 * Allowed for: Verified Reseller, Regional Admin, Sentinel
 * Strictly DENIED for: Member
 */
export function canViewVerifiedResellers(profile?: Profile | null, email?: string | null): boolean {
  if (isSentinel(profile, email)) return true;
  if (isRegionalAdmin(profile)) return true;
  if (isVerifiedReseller(profile)) return true;
  return false;
}

/**
 * Permission: Can access Admin Moderation Deck
 * Allowed for: Regional Admin, Sentinel
 */
export function canAccessAdminDeck(profile?: Profile | null, email?: string | null): boolean {
  return isSentinel(profile, email) || isRegionalAdmin(profile);
}

/**
 * Permission: Can approve/reject reseller applications within regional boundary
 */
export function canApproveResellerInRegion(
  adminProfile: Profile | null,
  targetStateOrRegion?: string | null
): boolean {
  if (!adminProfile) return false;
  if (isSentinel(adminProfile)) return true; // Global admin can approve anywhere
  if (!isRegionalAdmin(adminProfile)) return false;

  if (!targetStateOrRegion) return false;
  const adminState = adminProfile.state?.toLowerCase().trim();
  const adminRegion = adminProfile.region?.toLowerCase().trim();
  const target = targetStateOrRegion.toLowerCase().trim();

  return Boolean(
    (adminState && adminState === target) ||
    (adminRegion && adminRegion === target)
  );
}
