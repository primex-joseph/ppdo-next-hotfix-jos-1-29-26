// convex/media.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Create a new upload session
 * Called before uploading files to group them together
 */
export const createUploadSession = mutation({
  args: {
    imageCount: v.number(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to create upload session");
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("uploadSessions", {
      userId,
      imageCount: args.imageCount,
      caption: args.caption,
      createdAt: now,
    });

    return sessionId;
  },
});

/**
 * Upload a media file to a session
 * Associates media with an upload session for grouping
 */
export const uploadMedia = mutation({
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
      throw new Error("Unauthorized: Must be logged in to upload media");
    }

    // Verify the session belongs to the user
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Invalid upload session");
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
 * Get all upload sessions for the current user
 * Returns sessions with their associated media files (Facebook-style)
 */
export const getMyUploadSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all sessions for this user, ordered by most recent first
    const sessions = await ctx.db
      .query("uploadSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // For each session, get its media files
    const sessionsWithMedia = await Promise.all(
      sessions.map(async (session) => {
        const mediaItems = await ctx.db
          .query("media")
          .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
          .collect();

        // Sort by order in session
        mediaItems.sort((a, b) => a.orderInSession - b.orderInSession);

        // Get URLs for each media item
        const mediaWithUrls = await Promise.all(
          mediaItems.map(async (item) => {
            const url = await ctx.storage.getUrl(item.storageId);
            return {
              _id: item._id,
              _creationTime: item._creationTime,
              storageId: item.storageId,
              name: item.name,
              type: item.type,
              size: item.size,
              userId: item.userId,
              sessionId: item.sessionId,
              orderInSession: item.orderInSession,
              uploadedAt: item.uploadedAt,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              url: url,
            };
          })
        );

        return {
          _id: session._id,
          _creationTime: session._creationTime,
          userId: session.userId,
          imageCount: session.imageCount,
          caption: session.caption,
          createdAt: session.createdAt,
          media: mediaWithUrls,
        };
      })
    );

    return sessionsWithMedia;
  },
});

/**
 * Get a single media item by ID
 */
export const getMediaById = query({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      return null;
    }

    // Verify user owns this media
    if (media.userId !== userId) {
      throw new Error("Unauthorized: Cannot access this media");
    }

    const url = await ctx.storage.getUrl(media.storageId);
    return {
      ...media,
      url,
    };
  },
});

/**
 * Delete a media item
 * If it's the last item in a session, also delete the session
 */
export const deleteMedia = mutation({
  args: {
    mediaId: v.id("media"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to delete media");
    }

    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    // Verify user owns this media
    if (media.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete this media");
    }

    // Delete from storage
    await ctx.storage.delete(media.storageId);

    // Delete from database
    await ctx.db.delete(args.mediaId);

    // Check if there are any other media items in this session
    const remainingMedia = await ctx.db
      .query("media")
      .withIndex("sessionId", (q) => q.eq("sessionId", media.sessionId))
      .collect();

    // If this was the last media item, delete the session too
    if (remainingMedia.length === 0) {
      await ctx.db.delete(media.sessionId);
    } else {
      // Update the session's image count
      const session = await ctx.db.get(media.sessionId);
      if (session) {
        await ctx.db.patch(media.sessionId, {
          imageCount: remainingMedia.length,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Delete an entire upload session with all its media
 */
export const deleteUploadSession = mutation({
  args: {
    sessionId: v.id("uploadSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to delete session");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete this session");
    }

    // Get all media in this session
    const mediaItems = await ctx.db
      .query("media")
      .withIndex("sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Delete all media files from storage and database
    for (const media of mediaItems) {
      await ctx.storage.delete(media.storageId);
      await ctx.db.delete(media._id);
    }

    // Delete the session
    await ctx.db.delete(args.sessionId);

    return { success: true };
  },
});

/**
 * Update media metadata (name only for now)
 */
export const updateMedia = mutation({
  args: {
    mediaId: v.id("media"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to update media");
    }

    const media = await ctx.db.get(args.mediaId);
    if (!media) {
      throw new Error("Media not found");
    }

    // Verify user owns this media
    if (media.userId !== userId) {
      throw new Error("Unauthorized: Cannot update this media");
    }

    await ctx.db.patch(args.mediaId, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update upload session caption
 */
export const updateSessionCaption = mutation({
  args: {
    sessionId: v.id("uploadSessions"),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Verify user owns this session
    if (session.userId !== userId) {
      throw new Error("Unauthorized: Cannot update this session");
    }

    await ctx.db.patch(args.sessionId, {
      caption: args.caption,
    });

    return { success: true };
  },
});

/**
 * Generate an upload URL for storing files
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Must be logged in to upload");
    }

    return await ctx.storage.generateUploadUrl();
  },
});