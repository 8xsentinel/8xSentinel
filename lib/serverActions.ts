'use server';

import { db } from '../drizzle/index';
import { profiles, scammerEntities, scamReports, trustedResellers, resellerReviews, resellerVotes, escrowPartnerships } from '../drizzle/schema';
import { eq, or, and, ilike, desc, count, sql } from 'drizzle-orm';
import { ScamReport, TrustedReseller } from '../types';
import { isSentinel, isRegionalAdmin, isVerifiedReseller, canViewVerifiedResellers, canApproveResellerInRegion } from './permissions';
import { validateWhatsAppLink, validateTelegramLink } from './validators/linkValidators';

// --- PROFILES ---
export async function syncFirebaseUser(email: string, displayName?: string, photoURL?: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const username = cleanEmail.split('@')[0] || `user_${Date.now().toString().slice(-4)}`;
    const isSuperAdminEmail = cleanEmail === '8xsentinel@gmail.com';

    // Find existing profile
    const existing = await db.select().from(profiles).where(eq(profiles.primaryEmail, cleanEmail)).limit(1);

    if (existing.length > 0) {
      const prof = existing[0];
      const updateData: any = { lastSeen: new Date() };
      if (photoURL && !prof.avatarUrl) updateData.avatarUrl = photoURL;
      if (displayName && !prof.displayName) updateData.displayName = displayName;
      if (isSuperAdminEmail && prof.role !== 'sentinel' && prof.role !== 'super_admin') {
        updateData.role = 'sentinel';
        updateData.storeStatus = 'approved';
      }
      
      await db.update(profiles).set(updateData).where(eq(profiles.id, prof.id));
      return { ...prof, ...updateData };
    }

    // Create new profile - defaults to Sentinel Member
    const newProfile = {
      id: `user-${Date.now()}`,
      username,
      displayName: displayName || username || (isSuperAdminEmail ? 'Root Admin' : 'Sentinel Member'),
      avatarUrl: photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      role: isSuperAdminEmail ? 'sentinel' : 'member',
      primaryEmail: cleanEmail,
      storeStatus: isSuperAdminEmail ? 'approved' : 'not_registered',
    };

    await db.insert(profiles).values(newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error in syncFirebaseUser:", error);
    throw error;
  }
}

export async function updateMemberContact(profileId: string, displayName?: string, phoneNumber?: string) {
  try {
    const cleanName = sanitizeString(displayName);
    const cleanPhone = sanitizeString(phoneNumber);
    const updateData: any = {};
    if (cleanName) updateData.displayName = cleanName;
    if (cleanPhone) updateData.whatsappUsername = cleanPhone;

    if (Object.keys(updateData).length > 0) {
      await db.update(profiles).set(updateData).where(eq(profiles.id, profileId));
    }
    const updated = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);
    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("Error in updateMemberContact:", error);
    throw error;
  }
}

export async function registerUser(username: string, displayName: string) {
  try {
    const newProfile = {
      id: `user-${Date.now()}`,
      username: username.toLowerCase().trim(),
      displayName,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      role: 'member',
    };
    await db.insert(profiles).values(newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
}

// --- SEARCH ---
export async function search(query: string, type: string) {
  try {
    globalRegistryLookups += 1;
    const trimmed = (query || '').trim();

    // If query is empty, return all latest records for browsing
    if (!trimmed) {
      const [scammersResult, reportsResult, resellersResult] = await Promise.all([
        db.select().from(scammerEntities).orderBy(desc(scammerEntities.createdAt)).limit(30),
        db.select().from(scamReports).orderBy(desc(scamReports.createdAt)).limit(50),
        db.select().from(trustedResellers).where(eq(trustedResellers.verificationStatus, 'approved')).orderBy(desc(trustedResellers.createdAt)).limit(30)
      ]);

      return {
        scammers: scammersResult || [],
        reports: reportsResult || [],
        resellers: resellersResult || []
      };
    }

    const cleanQuery = `%${trimmed.toLowerCase()}%`;
    const rawQuery = trimmed.toLowerCase();
    // Also stripped digits for phone/UID matching (e.g. "+91 909809890909" -> "909809890909")
    const digitsOnly = trimmed.replace(/\D/g, '');
    const cleanDigits = digitsOnly.length >= 4 ? `%${digitsOnly}%` : cleanQuery;
    
    // Search scammer entities (grouped approved profiles)
    const scammersResult = await db.select().from(scammerEntities)
      .where(or(
        ilike(scammerEntities.canonicalName, cleanQuery),
        sql`${scammerEntities.knownIdentifiers}::text ILIKE ${cleanQuery}`,
        sql`${scammerEntities.adminNotes}::text ILIKE ${cleanQuery}`
      ))
      .limit(30);

    // Search individual scam reports directly (including pending & approved ones)
    const reportsResult = await db.select().from(scamReports)
      .where(or(
        ilike(scamReports.scammerName, cleanQuery),
        ilike(scamReports.telegramUsername, cleanQuery),
        ilike(scamReports.whatsappNumber, cleanQuery),
        ilike(scamReports.whatsappNumber, cleanDigits),
        ilike(scamReports.instagramUsername, cleanQuery),
        ilike(scamReports.upiId, cleanQuery),
        ilike(scamReports.bgmiUid, cleanQuery),
        ilike(scamReports.bgmiUid, cleanDigits),
        sql`${scamReports.additionalIdentifiers}::text ILIKE ${cleanQuery}`,
        sql`${scamReports.additionalIdentifiers}::text ILIKE ${cleanDigits}`,
        sql`${scamReports.description}::text ILIKE ${cleanQuery}`
      ))
      .orderBy(desc(scamReports.createdAt))
      .limit(50);

    // Search trusted resellers
    const resellersResult = await db.select().from(trustedResellers)
      .where(and(
        eq(trustedResellers.verificationStatus, 'approved'),
        or(
          ilike(trustedResellers.storeName, cleanQuery),
          ilike(trustedResellers.telegramUsername, cleanQuery),
          ilike(trustedResellers.whatsappNumber, cleanQuery),
          ilike(trustedResellers.whatsappNumber, cleanDigits),
          ilike(trustedResellers.instagramUsername, cleanQuery),
          ilike(trustedResellers.bgmiUid, cleanQuery),
          sql`${trustedResellers.tagline}::text ILIKE ${cleanQuery}`
        )
      ))
      .limit(30);

    return { 
      scammers: scammersResult || [], 
      reports: reportsResult || [],
      resellers: resellersResult || [] 
    };
  } catch (error) {
    console.error("Error in search:", error);
    return { scammers: [], reports: [], resellers: [] };
  }
}

// --- REPORTS ---
export async function getReport(id: string) {
  try {
    const result = await db.select({
      report: scamReports,
      reporter: profiles,
      entity: scammerEntities
    }).from(scamReports)
      .leftJoin(profiles, eq(scamReports.reporterId, profiles.id))
      .leftJoin(scammerEntities, eq(scamReports.scammerEntityId, scammerEntities.id))
      .where(eq(scamReports.id, id))
      .limit(1);

    if (!result.length) return null;
    return { ...result[0].report, reporter: result[0].reporter, scammer_entity: result[0].entity };
  } catch (error) {
    console.error("Error in getReport:", error);
    return null;
  }
}

export async function getLatestApprovedReports(limit = 5) {
  try {
    const results = await db.select({
      report: scamReports,
      entity: scammerEntities
    }).from(scamReports)
      .leftJoin(scammerEntities, eq(scamReports.scammerEntityId, scammerEntities.id))
      .where(eq(scamReports.status, 'approved'))
      .orderBy(desc(scamReports.createdAt))
      .limit(limit);

    return (results || []).map(r => ({ ...r.report, scammer_entity: r.entity }));
  } catch (error) {
    console.error("Error in getLatestApprovedReports:", error);
    return [];
  }
}

export async function getAllReports(limit = 100) {
  try {
    const results = await db.select().from(scamReports)
      .orderBy(desc(scamReports.createdAt))
      .limit(limit);
    return results || [];
  } catch (error) {
    console.error("Error in getAllReports:", error);
    return [];
  }
}

function sanitizeString(str?: string | null): string | undefined {
  if (!str || typeof str !== 'string') return undefined;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export async function submitReport(reportData: Partial<ScamReport>) {
  try {
    const rawDesc = reportData.description || '';
    const cleanDesc = sanitizeString(rawDesc) || rawDesc.trim();

    const newReport = {
      id: `rep-${Date.now()}`,
      reporterId: reportData.reporter_id || 'anonymous',
      scammerName: sanitizeString(reportData.scammer_name) || reportData.scammer_name || 'Unknown Scammer',
      telegramUsername: sanitizeString(reportData.telegram_username),
      whatsappNumber: sanitizeString(reportData.whatsapp_number),
      upiId: sanitizeString(reportData.upi_id),
      instagramUsername: sanitizeString(reportData.instagram_username),
      bgmiUid: sanitizeString(reportData.bgmi_uid),
      additionalIdentifiers: {
        ...(reportData.additional_identifiers as any || {}),
        victim_phone_number: sanitizeString(reportData.victim_phone_number) || undefined,
      },
      description: cleanDesc,
      amountLost: Math.max(0, Number(reportData.amount_lost) || 0),
      incidentDate: new Date(reportData.incident_date || Date.now()),
      scamType: reportData.scam_type || 'other',
      evidenceLinks: Array.isArray(reportData.evidence_links) ? reportData.evidence_links.slice(0, 10) : [],
      status: 'pending',
    };

    await db.insert(scamReports).values(newReport);
    return newReport;
  } catch (error) {
    console.error("Error in submitReport:", error);
    throw error;
  }
}

export async function voteReport(reportId: string, voteType: 'upvote' | 'verify' | 'dispute') {
  try {
    const report = await db.select().from(scamReports).where(eq(scamReports.id, reportId)).limit(1);
    if (!report.length) return null;

    const current = report[0];
    let upvotes = current.upvotes;
    let verifiedCount = current.verifiedByCount;

    if (voteType === 'upvote') upvotes++;
    if (voteType === 'verify') verifiedCount++;

    await db.update(scamReports)
      .set({ upvotes, verifiedByCount: verifiedCount })
      .where(eq(scamReports.id, reportId));

    return { ...current, upvotes, verifiedByCount: verifiedCount };
  } catch (error) {
    console.error("Error in voteReport:", error);
    return null;
  }
}

export async function withdrawReport(reportId: string, withdrawalReason: string, userId?: string) {
  try {
    const reportList = await db.select().from(scamReports).where(eq(scamReports.id, reportId)).limit(1);
    if (!reportList.length) throw new Error('Report not found');
    const rep = reportList[0];

    const currentAdditional = (rep.additionalIdentifiers as Record<string, any>) || {};
    const updatedAdditional = {
      ...currentAdditional,
      withdrawal_reason: withdrawalReason || 'Resolved / Withdrawn by reporter',
      withdrawn_at: new Date().toISOString(),
      withdrawn_by: userId || 'reporter'
    };

    // If report was already approved and linked to a scammer entity, adjust entity totals
    if (rep.status === 'approved' && rep.scammerEntityId) {
      const entityList = await db.select().from(scammerEntities).where(eq(scammerEntities.id, rep.scammerEntityId)).limit(1);
      if (entityList.length) {
        const ent = entityList[0];
        const newCount = Math.max(0, ent.reportCount - 1);
        const newAmount = Math.max(0, ent.totalAmountLost - rep.amountLost);
        await db.update(scammerEntities)
          .set({ reportCount: newCount, totalAmountLost: newAmount })
          .where(eq(scammerEntities.id, ent.id));
      }
    }

    await db.update(scamReports)
      .set({
        status: 'withdrawn',
        rejectionReason: `Withdrawn by user: ${withdrawalReason || 'Resolved / Refunded'}`,
        additionalIdentifiers: updatedAdditional,
        updatedAt: new Date()
      })
      .where(eq(scamReports.id, reportId));

    return { success: true, status: 'withdrawn' };
  } catch (error) {
    console.error("Error in withdrawReport:", error);
    throw error;
  }
}

export async function getUserReports(userId: string) {
  try {
    const results = await db.select({
      report: scamReports,
      entity: scammerEntities
    }).from(scamReports)
      .leftJoin(scammerEntities, eq(scamReports.scammerEntityId, scammerEntities.id))
      .where(eq(scamReports.reporterId, userId))
      .orderBy(desc(scamReports.createdAt));

    return (results || []).map(r => ({ ...r.report, scammer_entity: r.entity }));
  } catch (error) {
    console.error("Error in getUserReports:", error);
    return [];
  }
}

// --- RESELLERS ---
export async function getResellers(callerProfileId?: string) {
  try {
    if (callerProfileId) {
      const caller = await db.select().from(profiles).where(eq(profiles.id, callerProfileId)).limit(1);
      if (caller.length > 0 && !canViewVerifiedResellers(caller[0] as any, caller[0].primaryEmail)) {
        console.warn(`Unauthorized reseller directory access attempted by member: ${callerProfileId}`);
        return [];
      }
    }

    const results = await db.select({
      reseller: trustedResellers,
      profile: profiles
    }).from(trustedResellers)
      .leftJoin(profiles, eq(trustedResellers.profileId, profiles.id))
      .where(eq(trustedResellers.verificationStatus, 'approved'));

    return (results || []).map(r => ({ ...r.reseller, profile: r.profile }));
  } catch (error) {
    console.error("Error in getResellers:", error);
    return [];
  }
}

export async function getUserStoreApplication(profileId: string) {
  try {
    const results = await db.select().from(trustedResellers).where(eq(trustedResellers.profileId, profileId)).limit(1);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error in getUserStoreApplication:", error);
    return null;
  }
}

let globalRegistryLookups = 14878;

export async function recordRegistryLookup() {
  globalRegistryLookups += 1;
  return globalRegistryLookups;
}

export async function getRegistryLookups() {
  return globalRegistryLookups;
}

export async function getPlatformStats() {
  try {
    const scammersCount = await db.select({ count: count() }).from(scammerEntities);
    const reportsCount = await db.select({ count: count() }).from(scamReports);
    const resellersCount = await db.select({ count: count() }).from(trustedResellers).where(eq(trustedResellers.verificationStatus, 'approved'));
    const lossSumResult = await db.select({ total: sql<string>`COALESCE(SUM(${scamReports.amountLost}), 0)` }).from(scamReports);

    const allApproved = await db.select({ scamType: scamReports.scamType }).from(scamReports).where(eq(scamReports.status, 'approved'));
    const scamTypesCount: Record<string, number> = {};
    for (const r of allApproved) {
      if (r.scamType) {
        scamTypesCount[r.scamType] = (scamTypesCount[r.scamType] || 0) + 1;
      }
    }

    return {
      scammers: Number(scammersCount[0]?.count ?? 0),
      reports: Number(reportsCount[0]?.count ?? 0),
      resellers: Number(resellersCount[0]?.count ?? 0),
      totalLoss: Number(lossSumResult[0]?.total ?? 0),
      scamTypesCount,
      lookups: globalRegistryLookups
    };
  } catch (error) {
    console.error("Error in getPlatformStats:", error);
    return {
      scammers: 0,
      reports: 0,
      resellers: 0,
      totalLoss: 0,
      scamTypesCount: {},
      lookups: globalRegistryLookups
    };
  }
}

export async function getResellerByUsername(username: string, callerProfileId?: string) {
  return await getResellerProfile(username, callerProfileId);
}

export async function getResellerProfile(identifier: string, callerProfileId?: string) {
  try {
    if (callerProfileId) {
      const caller = await db.select().from(profiles).where(eq(profiles.id, callerProfileId)).limit(1);
      if (caller.length > 0 && !canViewVerifiedResellers(caller[0] as any, caller[0].primaryEmail)) {
        console.warn(`Unauthorized reseller profile access attempted by member: ${callerProfileId}`);
        return null;
      }
    }

    const clean = decodeURIComponent(identifier).trim().replace('@', '');
    
    // Find reseller by id, profileId, username, telegram username, or store name
    const match = await db.select({
      reseller: trustedResellers,
      profile: profiles
    }).from(trustedResellers)
      .leftJoin(profiles, eq(trustedResellers.profileId, profiles.id))
      .where(
        or(
          eq(trustedResellers.id, clean),
          eq(trustedResellers.profileId, clean),
          eq(profiles.id, clean),
          eq(profiles.username, clean.toLowerCase()),
          ilike(profiles.username, clean),
          ilike(profiles.displayName, clean),
          eq(trustedResellers.telegramUsername, clean),
          ilike(trustedResellers.storeName, clean),
          ilike(trustedResellers.storeName, `%${clean}%`)
        )
      ).limit(1);

    if (!match.length) return null;

    const resellerData = { ...match[0].reseller, profile: match[0].profile };
    const resellerId = match[0].reseller.id;

    // Fetch customer reviews
    const reviews = await db.select({
      review: resellerReviews,
      reviewer: profiles
    }).from(resellerReviews)
      .leftJoin(profiles, eq(resellerReviews.reviewerId, profiles.id))
      .where(and(eq(resellerReviews.resellerId, resellerId), eq(resellerReviews.isVisible, true)))
      .orderBy(desc(resellerReviews.createdAt));

    // Fetch peer trust votes
    const votes = await db.select({
      vote: resellerVotes,
      voter: profiles
    }).from(resellerVotes)
      .leftJoin(profiles, eq(resellerVotes.voterId, profiles.id))
      .where(eq(resellerVotes.resellerId, resellerId))
      .orderBy(desc(resellerVotes.createdAt));

    // Fetch escrow partnerships
    const rawPartners = await db.select({
      partnership: escrowPartnerships,
      partnerStore: trustedResellers,
      partnerProfile: profiles
    }).from(escrowPartnerships)
      .leftJoin(trustedResellers, eq(escrowPartnerships.partnerResellerId, trustedResellers.id))
      .leftJoin(profiles, eq(trustedResellers.profileId, profiles.id))
      .where(and(eq(escrowPartnerships.resellerId, resellerId), eq(escrowPartnerships.status, 'active')))
      .orderBy(desc(escrowPartnerships.createdAt));

    const escrowPartners = rawPartners.map(p => ({
      ...p.partnership,
      store: p.partnerStore ? { ...p.partnerStore, profile: p.partnerProfile } : null
    }));

    return {
      reseller: resellerData,
      reviews: reviews.map(r => ({ ...r.review, reviewer: r.reviewer })),
      votes: votes.map(v => ({ ...v.vote, voter: v.voter })),
      escrowPartners
    };
  } catch (error) {
    console.error("Error in getResellerProfile:", error);
    return null;
  }
}

export async function voteResellerTrust(resellerId: string, voterProfileId: string) {
  try {
    const reseller = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (!reseller.length) throw new Error("Reseller not found");

    if (reseller[0].profileId === voterProfileId) {
      throw new Error("You cannot vouch for your own store.");
    }

    // Check if voter already vouched
    const existing = await db.select().from(resellerVotes)
      .where(and(eq(resellerVotes.resellerId, resellerId), eq(resellerVotes.voterId, voterProfileId)))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("You have already vouched for this reseller.");
    }

    // Voter profile check
    const voter = await db.select().from(profiles).where(eq(profiles.id, voterProfileId)).limit(1);
    const isVoterReseller = voter.length > 0 && (voter[0].role === 'verified_reseller' || voter[0].storeStatus === 'approved');

    const voteId = `vote-${Date.now()}`;
    await db.insert(resellerVotes).values({
      id: voteId,
      resellerId,
      voterId: voterProfileId,
      voteType: 'trust',
    });

    const scoreBoost = isVoterReseller ? 5 : 2;
    const newScore = Math.min(100, (reseller[0].trustScore || 30) + scoreBoost);

    await db.update(trustedResellers)
      .set({ trustScore: newScore })
      .where(eq(trustedResellers.id, resellerId));

    return { success: true, newScore, message: isVoterReseller ? "Peer Reseller Vouch recorded (+5 Trust Score)!" : "Community Trust Vouch recorded (+2 Trust Score)!" };
  } catch (error: any) {
    console.error("Error in voteResellerTrust:", error);
    return { success: false, message: error.message || "Failed to submit vouch." };
  }
}

export async function toggleEscrowPartner(resellerId: string, partnerProfileId: string, terms?: string) {
  try {
    // Partner must have an approved verified store
    const partnerStore = await db.select().from(trustedResellers).where(eq(trustedResellers.profileId, partnerProfileId)).limit(1);
    if (!partnerStore.length || partnerStore[0].verificationStatus !== 'approved') {
      throw new Error("Only approved Sentinel Verified Resellers can join as Escrow Partners.");
    }

    const partnerResellerId = partnerStore[0].id;
    if (resellerId === partnerResellerId) {
      throw new Error("A store cannot act as its own escrow middleman.");
    }

    // Check if partnership already exists
    const existing = await db.select().from(escrowPartnerships)
      .where(and(eq(escrowPartnerships.resellerId, resellerId), eq(escrowPartnerships.partnerResellerId, partnerResellerId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(escrowPartnerships).where(eq(escrowPartnerships.id, existing[0].id));
      return { success: true, action: 'removed', message: "Escrow partnership removed." };
    } else {
      const partnershipId = `escrow-${Date.now()}`;
      await db.insert(escrowPartnerships).values({
        id: partnershipId,
        resellerId,
        partnerResellerId,
        status: 'active',
        terms: terms || 'Verified Sentinel Escrow Middleman. 100% Deal Security guaranteed.',
        dealsBrokered: 0
      });
      return { success: true, action: 'added', message: "Officially partnered as Escrow Middleman!" };
    }
  } catch (error: any) {
    console.error("Error in toggleEscrowPartner:", error);
    return { success: false, message: error.message || "Failed to configure escrow partnership." };
  }
}

export async function applyForReseller(storeData: any) {
  try {
    const profileId = storeData.profile_id || storeData.profileId;
    if (!profileId) {
      throw new Error("profile_id is required to apply for reseller");
    }

    const existing = await db.select().from(trustedResellers).where(eq(trustedResellers.profileId, profileId)).limit(1);
    const rawWaLink = sanitizeString(storeData.whatsapp_group_link || storeData.whatsappGroupLink);
    const waValidation = rawWaLink ? validateWhatsAppLink(rawWaLink) : null;
    const normalizedWaLink = waValidation && waValidation.isValid ? waValidation.normalizedUrl : rawWaLink;

    const rawTgLink = sanitizeString(storeData.telegram_channel_link || storeData.telegramChannelLink);
    const tgValidation = rawTgLink ? validateTelegramLink(rawTgLink) : null;
    const normalizedTgLink = tgValidation && tgValidation.isValid ? tgValidation.normalizedUrl : rawTgLink;

    const mappedData = {
      profileId: profileId,
      storeName: sanitizeString(storeData.store_name || storeData.storeName) || 'Store',
      ownerName: sanitizeString(storeData.owner_name || storeData.ownerName || storeData.seller_name || storeData.sellerName),
      state: sanitizeString(storeData.state),
      region: sanitizeString(storeData.region),
      countryCode: sanitizeString(storeData.country_code || storeData.countryCode) || '+91',
      primaryPlatform: storeData.primary_platform || storeData.primaryPlatform || 'whatsapp_primary',
      whatsappNumber: sanitizeString(storeData.whatsapp_number || storeData.whatsappNumber),
      backupWhatsappNumber: sanitizeString(storeData.backup_whatsapp_number || storeData.backupWhatsappNumber || storeData.backupWhatsapp),
      whatsappUsername: sanitizeString(storeData.whatsapp_username || storeData.whatsappUsername),
      whatsappGroupLink: normalizedWaLink,
      telegramUsername: sanitizeString(storeData.telegram_username || storeData.telegramUsername),
      telegramChannelLink: normalizedTgLink,
      operatingSinceYear: Number(storeData.operating_since_year || storeData.operatingSinceYear || 2022),
      instagramUsername: sanitizeString(storeData.instagram_username || storeData.instagramUsername),
      yearsActive: Number(storeData.years_active || storeData.yearsActive || 1),
      bio: sanitizeString(storeData.bio),
      specializesIn: Array.isArray(storeData.specializes_in || storeData.specializesIn) 
        ? (storeData.specializes_in || storeData.specializesIn).map((s: string) => sanitizeString(s)).filter(Boolean)
        : [],
    };

    if (existing.length > 0) {
      await db.update(trustedResellers).set(mappedData as any).where(eq(trustedResellers.id, existing[0].id));
      await db.update(profiles).set({ storeStatus: 'pending', state: mappedData.state }).where(eq(profiles.id, profileId));
      return { ...existing[0], ...mappedData, verificationStatus: 'pending' };
    } else {
      const newId = `reseller-${Date.now()}`;
      const newEntry = { ...mappedData, id: newId, verificationStatus: 'pending' };
      await db.insert(trustedResellers).values(newEntry as any);
      await db.update(profiles).set({ storeStatus: 'pending', state: mappedData.state }).where(eq(profiles.id, profileId));
      return newEntry;
    }
  } catch (error) {
    console.error("Error in applyForReseller:", error);
    throw error;
  }
}

export async function getScammerEntity(id: string) {
  try {
    const result = await db.select().from(scammerEntities).where(eq(scammerEntities.id, id)).limit(1);
    if (!result.length) return null;
    
    const reports = await db.select().from(scamReports).where(eq(scamReports.scammerEntityId, id));
    return { entity: result[0], reports: reports || [] };
  } catch (error) {
    console.error("Error in getScammerEntity:", error);
    return null;
  }
}

export async function getPendingReports() {
  try {
    return await db.select().from(scamReports).where(eq(scamReports.status, 'pending')).orderBy(desc(scamReports.createdAt));
  } catch (error) {
    console.error("Error in getPendingReports:", error);
    return [];
  }
}

export async function getPendingResellers() {
  try {
    const results = await db.select({
      reseller: trustedResellers,
      profile: profiles
    }).from(trustedResellers)
      .leftJoin(profiles, eq(trustedResellers.profileId, profiles.id))
      .where(
        or(
          eq(trustedResellers.verificationStatus, 'pending'),
          eq(trustedResellers.tier2Status, 'pending')
        )
      )
      .orderBy(desc(trustedResellers.createdAt));
      
    return (results || []).map(r => ({ ...r.reseller, profile: r.profile }));
  } catch (error) {
    console.error("Error in getPendingResellers:", error);
    return [];
  }
}

export async function moderateReport(reportId: string, status: string, rejectionReason?: string) {
  try {
    await db.update(scamReports).set({ status, rejectionReason }).where(eq(scamReports.id, reportId));
    return true;
  } catch (error) {
    console.error("Error in moderateReport:", error);
    return false;
  }
}

export async function moderateReseller(resellerId: string, status: string, rejectionReason?: string) {
  try {
    const existing = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (!existing.length) return null;
    
    const isTier2 = existing[0].verificationStatus === 'approved' && existing[0].tier2Status === 'pending';
    
    if (isTier2) {
      await db.update(trustedResellers)
        .set({ 
          tier2Status: status, 
          tier: status === 'approved' ? 2 : 1, 
          rejectionReason: status === 'rejected' ? rejectionReason : null,
          verifiedAt: status === 'approved' ? new Date() : existing[0].verifiedAt
        })
        .where(eq(trustedResellers.id, resellerId));
    } else {
      await db.update(trustedResellers)
        .set({ 
          verificationStatus: status, 
          rejectionReason: status === 'rejected' ? rejectionReason : null,
          verifiedAt: status === 'approved' ? new Date() : null
        })
        .where(eq(trustedResellers.id, resellerId));

      // Synchronize profile store_status and role with the clearance decision
      const userProfile = await db.select().from(profiles).where(eq(profiles.id, existing[0].profileId)).limit(1);
      const isPrivileged = userProfile.length > 0 && (userProfile[0].role === 'super_admin' || userProfile[0].role === 'regional_admin');

      await db.update(profiles)
        .set({ 
          storeStatus: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
          role: status === 'approved' && !isPrivileged ? 'verified_reseller' : (isPrivileged ? userProfile[0].role : 'user')
        })
        .where(eq(profiles.id, existing[0].profileId));
    }

    const updated = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    return updated.length > 0 ? updated[0] : existing[0];
  } catch (error) {
    console.error("Error in moderateReseller:", error);
    return null;
  }
}

export async function applyForSentinelTrusted(resellerId: string, kycData: any) {
  try {
    const existing = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (!existing.length) {
      throw new Error("Reseller not found");
    }

    const mappedData = {
      govIdUrl: kycData.govIdUrl,
      selfieUrl: kycData.selfieUrl,
      locationLat: kycData.locationLat,
      locationLng: kycData.locationLng,
      tier2Status: 'pending',
    };

    await db.update(trustedResellers).set(mappedData as any).where(eq(trustedResellers.id, resellerId));
    return { ...existing[0], ...mappedData };
  } catch (error) {
    console.error("Error in applyForSentinelTrusted:", error);
    throw error;
  }
}

export async function submitResellerReview(resellerId: string, rating: number, comment: string, dealType: string, reviewerId?: string) {
  try {
    const id = `rev-${Date.now()}`;
    await db.insert(resellerReviews).values({
      id,
      resellerId,
      reviewerId: reviewerId || null,
      rating,
      comment,
      dealType: dealType || 'account_trade',
      isVisible: true
    });

    const reseller = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (reseller.length > 0) {
      const isPositive = rating >= 4;
      const deals = (reseller[0].dealsCompleted || 0) + 1;
      const pos = (reseller[0].positiveFeedback || 0) + (isPositive ? 1 : 0);
      const neg = (reseller[0].negativeFeedback || 0) + (!isPositive ? 1 : 0);
      const newScore = Math.min(100, Math.max(10, (reseller[0].trustScore || 30) + (isPositive ? 3 : -5)));

      await db.update(trustedResellers).set({
        dealsCompleted: deals,
        positiveFeedback: pos,
        negativeFeedback: neg,
        trustScore: newScore
      }).where(eq(trustedResellers.id, resellerId));
    }

    return true;
  } catch (error) {
    console.error("Error in submitResellerReview:", error);
    return false;
  }
}
export async function voteReseller(resellerId: string, voteType: string) { return true; }

export async function assignRegionalAdmin(userId: string, targetState: string) {
  try {
    const existing = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
    if (!existing.length) return false;

    await db.update(profiles).set({
      role: 'regional_admin',
      state: targetState,
      region: targetState
    }).where(eq(profiles.id, userId));

    return true;
  } catch (error) {
    console.error("Error in assignRegionalAdmin:", error);
    return false;
  }
}

export async function adminUpdateReseller(resellerId: string, updates: any) {
  try {
    const existing = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (!existing.length) return null;

    const sanitizedUpdates: any = {};
    if (updates.storeName !== undefined || updates.store_name !== undefined) {
      sanitizedUpdates.storeName = sanitizeString(updates.storeName || updates.store_name);
    }
    if (updates.ownerName !== undefined || updates.owner_name !== undefined) {
      sanitizedUpdates.ownerName = sanitizeString(updates.ownerName || updates.owner_name);
    }
    if (updates.whatsappNumber !== undefined || updates.whatsapp_number !== undefined) {
      sanitizedUpdates.whatsappNumber = sanitizeString(updates.whatsappNumber || updates.whatsapp_number);
    }
    if (updates.whatsappUsername !== undefined || updates.whatsapp_username !== undefined) {
      sanitizedUpdates.whatsappUsername = sanitizeString(updates.whatsappUsername || updates.whatsapp_username);
    }
    if (updates.whatsappGroupLink !== undefined || updates.whatsapp_group_link !== undefined) {
      const raw = sanitizeString(updates.whatsappGroupLink || updates.whatsapp_group_link);
      const v = raw ? validateWhatsAppLink(raw) : null;
      sanitizedUpdates.whatsappGroupLink = v && v.isValid ? v.normalizedUrl : raw;
    }
    if (updates.telegramUsername !== undefined || updates.telegram_username !== undefined) {
      sanitizedUpdates.telegramUsername = sanitizeString(updates.telegramUsername || updates.telegram_username)?.replace('@', '');
    }
    if (updates.telegramChannelLink !== undefined || updates.telegram_channel_link !== undefined) {
      const raw = sanitizeString(updates.telegramChannelLink || updates.telegram_channel_link);
      const v = raw ? validateTelegramLink(raw) : null;
      sanitizedUpdates.telegramChannelLink = v && v.isValid ? v.normalizedUrl : raw;
    }
    if (updates.instagramUsername !== undefined || updates.instagram_username !== undefined) {
      sanitizedUpdates.instagramUsername = sanitizeString(updates.instagramUsername || updates.instagram_username)?.replace('@', '');
    }
    if (updates.state !== undefined) sanitizedUpdates.state = sanitizeString(updates.state);
    if (updates.bio !== undefined) sanitizedUpdates.bio = sanitizeString(updates.bio);
    if (updates.primaryPlatform !== undefined || updates.primary_platform !== undefined) {
      sanitizedUpdates.primaryPlatform = updates.primaryPlatform || updates.primary_platform;
    }
    if (updates.specializesIn !== undefined || updates.specializes_in !== undefined) {
      sanitizedUpdates.specializesIn = updates.specializesIn || updates.specializes_in;
    }
    if (updates.trustScore !== undefined || updates.trust_score !== undefined) {
      sanitizedUpdates.trustScore = Math.max(0, Math.min(100, Number(updates.trustScore ?? updates.trust_score)));
    }
    if (updates.tier !== undefined) sanitizedUpdates.tier = Number(updates.tier);
    if (updates.tier2Status !== undefined || updates.tier2_status !== undefined) {
      sanitizedUpdates.tier2Status = updates.tier2Status || updates.tier2_status;
    }
    if (updates.verificationStatus !== undefined || updates.verification_status !== undefined) {
      sanitizedUpdates.verificationStatus = updates.verificationStatus || updates.verification_status;
    }

    await db.update(trustedResellers)
      .set(sanitizedUpdates)
      .where(eq(trustedResellers.id, resellerId));

    const updated = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("Error in adminUpdateReseller:", error);
    return null;
  }
}

export async function adjustResellerTrustScore(resellerId: string, delta: number) {
  try {
    const existing = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (!existing.length) return null;

    const currentScore = existing[0].trustScore ?? 30;
    const newScore = Math.max(0, Math.min(100, currentScore + delta));

    await db.update(trustedResellers)
      .set({ trustScore: newScore })
      .where(eq(trustedResellers.id, resellerId));

    return newScore;
  } catch (error) {
    console.error("Error in adjustResellerTrustScore:", error);
    return null;
  }
}

export async function verifySellerByRegionalAdmin(resellerId: string, adminId: string) {
  try {
    const admin = await db.select().from(profiles).where(eq(profiles.id, adminId)).limit(1);
    const existing = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    if (!existing.length || !admin.length) return null;
    
    const isTier2 = existing[0].verificationStatus === 'approved' && existing[0].tier2Status === 'pending';
    
    if (isTier2) {
      await db.update(trustedResellers)
        .set({
          tier2Status: 'approved',
          tier: 2,
          verifiedByRegionalAdminId: adminId,
          verifiedByRegionalAdminName: admin[0].displayName
        }).where(eq(trustedResellers.id, resellerId));
    } else {
      await db.update(trustedResellers)
        .set({
          verificationStatus: 'approved',
          verifiedAt: new Date(),
          verifiedByRegionalAdminId: adminId,
          verifiedByRegionalAdminName: admin[0].displayName
        }).where(eq(trustedResellers.id, resellerId));
      
      // Update profile status and role as well
      const userProfile = await db.select().from(profiles).where(eq(profiles.id, existing[0].profileId)).limit(1);
      const isPrivileged = userProfile.length > 0 && (userProfile[0].role === 'super_admin' || userProfile[0].role === 'regional_admin');

      await db.update(profiles)
        .set({ 
          storeStatus: 'approved',
          role: !isPrivileged ? 'verified_reseller' : userProfile[0].role
        })
        .where(eq(profiles.id, existing[0].profileId));
    }

    const updated = await db.select().from(trustedResellers).where(eq(trustedResellers.id, resellerId)).limit(1);
    return updated.length > 0 ? updated[0] : existing[0];
  } catch (error) {
    console.error("Error in verifySellerByRegionalAdmin:", error);
    return null;
  }
}
