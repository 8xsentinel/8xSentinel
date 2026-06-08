import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("reseller"),
      v.literal("community_admin"),
      v.literal("chief_admin")
    ),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  resellers: defineTable({
    ownerId: v.id("users"),
    displayName: v.string(),
    username: v.string(),
    phoneNumber: v.string(),
    telegramUsername: v.string(),
    instagramUsername: v.string(),
    upiId: v.string(),
    bio: v.optional(v.string()),
    communitySince: v.optional(v.string()),
    verificationLevel: v.union(
      v.literal("none"),
      v.literal("sentinel_verified"),
      v.literal("sentinel_trusted")
    ),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    trustScore: v.number(),
    reportCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_username", ["username"])
    .index("by_verificationLevel", ["verificationLevel"]),

  verifications: defineTable({
    resellerId: v.id("resellers"),
    type: v.union(
      v.literal("phone"),
      v.literal("telegram"),
      v.literal("instagram"),
      v.literal("upi"),
      v.literal("govt_id"),
      v.literal("live_location")
    ),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    verifiedAt: v.optional(v.number()),
  }).index("by_resellerId", ["resellerId"]),

  verificationApplications: defineTable({
    resellerId: v.id("resellers"),
    badgeAppliedFor: v.union(v.literal("sentinel_verified"), v.literal("sentinel_trusted")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
  }).index("by_status", ["status"]),

  reports: defineTable({
    reporterId: v.id("users"),
    reportedResellerId: v.id("resellers"),
    reason: v.string(),
    description: v.string(),
    evidenceStorageIds: v.array(v.id("_storage")),
    status: v.union(v.literal("pending"), v.literal("investigating"), v.literal("resolved"), v.literal("dismissed")),
    createdAt: v.number(),
  }).index("by_reportedResellerId", ["reportedResellerId"]),

  appeals: defineTable({
    reportId: v.id("reports"),
    resellerId: v.id("resellers"),
    reason: v.string(),
    evidenceStorageIds: v.array(v.id("_storage")),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    createdAt: v.number(),
  }).index("by_resellerId", ["resellerId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    link: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  auditLogs: defineTable({
    action: v.string(),
    performedBy: v.id("users"),
    targetId: v.optional(v.string()),
    details: v.string(),
    createdAt: v.number(),
  }).index("by_performedBy", ["performedBy"]),
});
