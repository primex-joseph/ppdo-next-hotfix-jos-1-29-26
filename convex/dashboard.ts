// convex/dashboard.ts
/**
 * Dashboard API - Optimized queries for the new dashboard feature
 *
 * This module provides efficient data fetching for the dashboard
 * to minimize resource consumption by:
 * - Aggregating data at query time instead of client-side
 * - Returning only necessary fields
 * - Caching and batching computations
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { FiscalYearStats } from "../types/dashboard";

/**
 * Get complete dashboard summary data
 *
 * Returns aggregated statistics for all fiscal years and analytics data
 * optimized for the landing page and year-specific summary views.
 *
 * This query consolidates multiple data sources into a single efficient request.
 */
export const getSummaryData = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch fiscal years
    let fiscalYears;
    if (args.includeInactive) {
      fiscalYears = await ctx.db
        .query("fiscalYears")
        .order("desc")
        .collect();
    } else {
      fiscalYears = await ctx.db
        .query("fiscalYears")
        .withIndex("isActive", (q) => q.eq("isActive", true))
        .order("desc")
        .collect();
    }

    // Fetch all projects and budget items at once (more efficient than per-year queries)
    const allProjects = await ctx.db.query("projects").collect();
    const allBudgetItems = await ctx.db.query("budgetItems").collect();
    const allBreakdowns = await ctx.db
      .query("govtProjectBreakdowns")
      .collect();

    // Build year statistics in a single pass
    const yearStats: Record<string, FiscalYearStats> = {};
    const utilizationByYear: Record<string, Array<{ department: string; rate: number }>> = {};
    const budgetDistributionByYear: Record<
      string,
      Array<{
        label: string;
        value: number;
        subValue: string;
        percentage: number;
      }>
    > = {};
    const heatmapDataByYear: Record<string, Array<{ label: string; values: number[] }>> = {};

    // Initialize stats for all fiscal years
    for (const fy of fiscalYears) {
      const yearKey = fy.year.toString();

      // Get data for this year
      const yearProjects = allProjects.filter((p) => p.year === fy.year);
      const yearBudgets = allBudgetItems.filter((item) => item.year === fy.year);
      const yearBreakdowns = allBreakdowns.filter((bd) => {
        if (!bd.projectId) return false;
        const parentProject = allProjects.find(
          (p) => p._id === bd.projectId
        );
        return parentProject?.year === fy.year;
      });

      // Calculate KPI stats
      const projectCount = yearProjects.length;
      const ongoingCount = yearProjects.filter((p) => p.status === "ongoing").length;
      const completedCount = yearProjects.filter((p) => p.status === "completed").length;
      const delayedCount = yearProjects.filter((p) => p.status === "delayed").length;
      const breakdownCount = yearBreakdowns.length;

      // Calculate budget stats
      const totalBudgetAllocated = yearBudgets.reduce(
        (sum, item) => sum + (item.totalBudgetAllocated || 0),
        0
      );
      const totalBudgetUtilized = yearBudgets.reduce(
        (sum, item) => sum + (item.totalBudgetUtilized || 0),
        0
      );
      const utilizationRate =
        totalBudgetAllocated > 0
          ? (totalBudgetUtilized / totalBudgetAllocated) * 100
          : 0;

      yearStats[yearKey] = {
        projectCount,
        ongoingCount,
        completedCount,
        delayedCount,
        totalBudgetAllocated,
        totalBudgetUtilized,
        utilizationRate,
        breakdownCount,
      };

      // Calculate utilization by department/particular
      const grouped = yearBudgets.reduce(
        (acc, item) => {
          const label = item.particulars || "Uncategorized";
          if (!acc[label]) acc[label] = { allocated: 0, utilized: 0 };
          acc[label].allocated += item.totalBudgetAllocated || 0;
          acc[label].utilized += item.totalBudgetUtilized || 0;
          return acc;
        },
        {} as Record<string, { allocated: number; utilized: number }>
      );

      utilizationByYear[yearKey] = Object.entries(grouped)
        .map(([department, data]) => ({
          department,
          rate: data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 8);

      // Calculate budget distribution
      const categories = Array.from(
        new Set(yearBudgets.map((b) => b.particulars))
      ).slice(0, 6);

      budgetDistributionByYear[yearKey] = categories.map((cat) => {
        const items = yearBudgets.filter((b) => b.particulars === cat);
        const allocated = items.reduce(
          (sum, i) => sum + (i.totalBudgetAllocated || 0),
          0
        );
        const utilized = items.reduce(
          (sum, i) => sum + (i.totalBudgetUtilized || 0),
          0
        );

        return {
          label: cat || "Uncategorized",
          value: allocated,
          subValue: `${items.length} items`,
          percentage: allocated > 0 ? (utilized / allocated) * 100 : 0,
        };
      });

      // Calculate heatmap data (activity by office)
      const offices = Array.from(
        new Set(yearProjects.map((p) => p.implementingOffice))
      ).slice(0, 8);

      heatmapDataByYear[yearKey] = offices.map((office) => {
        const officeProjects = yearProjects.filter(
          (p) => p.implementingOffice === office
        );
        const values = Array(12).fill(0);
        officeProjects.forEach((p) => {
          values[new Date(p.createdAt).getMonth()]++;
        });
        return { label: office, values };
      });
    }

    return {
      fiscalYears: fiscalYears.map((fy) => ({
        _id: fy._id,
        year: fy.year,
        label: fy.label,
        description: fy.description,
        isActive: fy.isActive,
      })),
      yearStats,
      utilizationByYear,
      budgetDistributionByYear,
      heatmapDataByYear,
    };
  },
});

/**
 * Get dashboard data for a specific fiscal year
 *
 * More lightweight query if you only need one year's data
 */
export const getYearSummary = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch data for specific year
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();

    const budgetItems = await ctx.db
      .query("budgetItems")
      .filter((q) => q.eq(q.field("year"), args.year))
      .collect();

    const allBreakdowns = await ctx.db.query("govtProjectBreakdowns").collect();
    const yearBreakdowns = allBreakdowns.filter((bd) => {
      if (!bd.projectId) return false;
      const parentProject = projects.find((p) => p._id === bd.projectId);
      return !!parentProject;
    });

    // Calculate statistics
    const projectCount = projects.length;
    const ongoingCount = projects.filter((p) => p.status === "ongoing").length;
    const completedCount = projects.filter((p) => p.status === "completed").length;
    const delayedCount = projects.filter((p) => p.status === "delayed").length;
    const breakdownCount = yearBreakdowns.length;

    const totalBudgetAllocated = budgetItems.reduce(
      (sum, item) => sum + (item.totalBudgetAllocated || 0),
      0
    );
    const totalBudgetUtilized = budgetItems.reduce(
      (sum, item) => sum + (item.totalBudgetUtilized || 0),
      0
    );
    const utilizationRate =
      totalBudgetAllocated > 0
        ? (totalBudgetUtilized / totalBudgetAllocated) * 100
        : 0;

    // Build utilization data
    const grouped = budgetItems.reduce(
      (acc, item) => {
        const label = item.particulars || "Uncategorized";
        if (!acc[label]) acc[label] = { allocated: 0, utilized: 0 };
        acc[label].allocated += item.totalBudgetAllocated || 0;
        acc[label].utilized += item.totalBudgetUtilized || 0;
        return acc;
      },
      {} as Record<string, { allocated: number; utilized: number }>
    );

    const utilizationData = Object.entries(grouped)
      .map(([department, data]) => ({
        department,
        rate: data.allocated > 0 ? (data.utilized / data.allocated) * 100 : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);

    // Build budget distribution
    const categories = Array.from(
      new Set(budgetItems.map((b) => b.particulars))
    ).slice(0, 6);

    const budgetDistribution = categories.map((cat) => {
      const items = budgetItems.filter((b) => b.particulars === cat);
      const allocated = items.reduce((sum, i) => sum + (i.totalBudgetAllocated || 0), 0);
      const utilized = items.reduce((sum, i) => sum + (i.totalBudgetUtilized || 0), 0);

      return {
        label: cat || "Uncategorized",
        value: allocated,
        subValue: `${items.length} items`,
        percentage: allocated > 0 ? (utilized / allocated) * 100 : 0,
      };
    });

    // Build heatmap data
    const offices = Array.from(new Set(projects.map((p) => p.implementingOffice))).slice(
      0,
      8
    );

    const heatmapData = offices.map((office) => {
      const officeProjects = projects.filter((p) => p.implementingOffice === office);
      const values = Array(12).fill(0);
      officeProjects.forEach((p) => {
        values[new Date(p.createdAt).getMonth()]++;
      });
      return { label: office, values };
    });

    return {
      year: args.year,
      stats: {
        projectCount,
        ongoingCount,
        completedCount,
        delayedCount,
        breakdownCount,
        totalBudgetAllocated,
        totalBudgetUtilized,
        utilizationRate,
      },
      utilizationData,
      budgetDistribution,
      heatmapData,
    };
  },
});
