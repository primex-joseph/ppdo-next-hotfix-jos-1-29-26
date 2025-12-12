// convex/media.ts

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Generate upload URL for image
 */
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

/**
 * Create upload session and save images
 */
export const createUploadSession = mutation({
  args: {
    imageCount: v.number(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const sessionId = await ctx.db.insert("uploadSessions", {
      userId,
      imageCount: args.imageCount,
      createdAt: Date.now(),
      caption: args.caption,
    });

    return sessionId;
  },
});

/**
 * Save media file metadata after upload
 */
export const saveMedia = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    sessionId: v.id("uploadSessions"),
    orderInSession: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    const mediaId = await ctx.db.insert("media", {
      storageId: args.storageId,
      name: args.name,
      type: args.type,
      size: args.size,
      userId,
      sessionId: args.sessionId,
      orderInSession: args.orderInSession,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return mediaId;
  },
});

/**
 * Get media URLs from storage
 */
export const getMediaUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});