// convex/schema/twentyPercentDF.ts
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twentyPercentDFTables = {
    /**
     * 20% Development Fund (20% DF)
     * Tracks projects funded by the 20% Development Fund
     */
    twentyPercentDF: defineTable({
        // ============================================================================
        // IDENTIFICATION
        // ============================================================================
        /**
         * Particulars/Name of the project/program
         */
        particulars: v.string(),

        /**
         * Implementing Office (Department name as string for display)
         */
        implementingOffice: v.string(),

        /**
         * Department ID reference
         */
        departmentId: v.optional(v.id("departments")),

        /**
         * 🆕 CATEGORY (OPTIONAL)
         */
        categoryId: v.optional(v.id("projectCategories")),

        // ============================================================================
        // FINANCIAL DATA
        // ============================================================================
        totalBudgetAllocated: v.number(),
        obligatedBudget: v.optional(v.number()),
        totalBudgetUtilized: v.number(),
        utilizationRate: v.number(),

        /**
         * 🆕 AUTO-CALCULATION FLAG
         * When TRUE (default): totalBudgetUtilized is auto-calculated from child breakdowns
         */
        autoCalculateBudgetUtilized: v.optional(v.boolean()),

        // ============================================================================
        // METRICS
        // ============================================================================
        projectCompleted: v.number(),
        projectDelayed: v.number(),
        projectsOnTrack: v.number(), // "projectsOngoing" in frontend context

        // ============================================================================
        // ADDITIONAL FIELDS
        // ============================================================================
        remarks: v.optional(v.string()),
        year: v.optional(v.number()),

        /**
         * Status - determines how it's counted
         * STRICT 3 OPTIONS: completed, delayed, ongoing
         */
        status: v.optional(
            v.union(
                v.literal("completed"),
                v.literal("delayed"),
                v.literal("ongoing")
            )
        ),
        targetDateCompletion: v.optional(v.number()),

        /**
         * Project manager/lead
         */
        projectManagerId: v.optional(v.id("users")),

        // ============================================================================
        // PIN FUNCTIONALITY
        // ============================================================================
        isPinned: v.optional(v.boolean()),
        pinnedAt: v.optional(v.number()),
        pinnedBy: v.optional(v.id("users")),

        // ============================================================================
        // TRASH SYSTEM
        // ============================================================================
        isDeleted: v.optional(v.boolean()),
        deletedAt: v.optional(v.number()),
        deletedBy: v.optional(v.id("users")),

        // ============================================================================
        // SYSTEM FIELDS
        // ============================================================================
        createdBy: v.id("users"),
        createdAt: v.number(),
        updatedAt: v.number(),
        updatedBy: v.optional(v.id("users")),

        // Optional: Access Request related fields if needed
        access: v.optional(v.string()), // Placeholder for access logic if string-based
        accessRequest: v.optional(v.string()), // Placeholder
        recycleBin: v.optional(v.boolean()), // Explicit recycle bin flag if separate from isDeleted
    })
        .index("particulars", ["particulars"])
        .index("implementingOffice", ["implementingOffice"])
        .index("departmentId", ["departmentId"])
        .index("categoryId", ["categoryId"])
        .index("isDeleted", ["isDeleted"])
        .index("status", ["status"])
        .index("year", ["year"])
        .index("departmentAndStatus", ["departmentId", "status"])
        .index("categoryAndStatus", ["categoryId", "status"]),
};
