"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardFilters } from "@/hooks/useDashboardFilters";
import { DashboardSkeleton } from "@/components/analytics/DashboardSkeleton";
import { KPICardsRow } from "@/components/ppdo/dashboard/summary/KPICardsRow";
import { EnhancedBudgetChart } from "@/components/analytics/EnhancedBudgetChart";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { DepartmentBreakdownChart } from "@/components/analytics/DepartmentBreakdownChart";
import { StatusDistributionChart } from "@/components/analytics/StatusDistributionChart";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardContentProps {
    filters: DashboardFilters;
    year?: string;
}

export function DashboardContent({ filters, year }: DashboardContentProps) {
    // Get fiscal year ID first to ensure we have one
    const fiscalYears = useQuery(api.fiscalYears.list, {});

    // Resolve fiscal year ID
    const fiscalYearId = filters.fiscalYearId || (
        year && fiscalYears
            ? fiscalYears.find(fy => fy.year === parseInt(year))?._id
            : undefined
    );

    // Prepare query args avoiding extra fields
    const shouldSkip = !fiscalYearId && (!fiscalYears || fiscalYears.length === 0);

    // Destructure to separate flat date fields from the rest
    const { startDate, endDate, ...otherFilters } = filters;

    // Construct API arguments
    const queryArgs = shouldSkip ? "skip" : {
        ...otherFilters,
        fiscalYearId,
        dateRange: (startDate && endDate) ? { start: startDate, end: endDate } : undefined,
    };

    const analytics = useQuery(
        api.dashboard.getDashboardAnalytics,
        queryArgs
    );

    if (!analytics) {
        return <DashboardSkeleton />;
    }

    const { metrics, chartData, timeSeriesData, departmentBreakdown } = analytics;

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* KPI Cards */}
            <KPICardsRow
                totalProjects={metrics.totalProjects}
                ongoing={metrics.ongoingProjects}
                completed={metrics.completedProjects}
                delayed={metrics.delayedProjects}
            />

            {/* Top Row: Budget & Time Series */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedBudgetChart data={chartData.budgetOverview} />
                <TimeSeriesChart data={timeSeriesData} />
            </div>

            {/* Bottom Row: Department Breakdown & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DepartmentBreakdownChart
                    data={departmentBreakdown}
                    officeData={analytics.officeBreakdown}
                />

                {/* Status Distribution (New Small Chart) */}
                <StatusDistributionChart data={chartData.statusDistribution} />
            </div>
        </motion.div>
    );
}
