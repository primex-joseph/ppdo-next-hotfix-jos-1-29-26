// convex/schema/tableSettings.ts

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tableSettingsTables = {
  userTableSettings: defineTable({
    userId: v.id("users"),
    tableIdentifier: v.string(),
    columns: v.array(
      v.object({
        fieldKey: v.string(),
        width: v.number(), // CHANGED: Made width required (not optional)
        isVisible: v.boolean(),
        pinned: v.optional(v.union(v.literal("left"), v.literal("right"), v.null())),
      })
    ),
    defaultRowHeight: v.optional(v.number()),
    customRowHeights: v.optional(v.string()), 
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_and_table", ["userId", "tableIdentifier"]),
};