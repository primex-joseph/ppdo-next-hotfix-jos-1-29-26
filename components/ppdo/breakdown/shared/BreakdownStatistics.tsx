import React from "react";
import { formatCurrency, formatPercentage } from "@/components/ppdo/breakdown/utils/formatters";
import { StandardStatisticsGrid } from "@/components/ppdo/shared/StandardStatisticsGrid";

interface BreakdownStatisticsProps {
    totalAllocated: number;
    totalUtilized: number;
    totalObligated: number;
    averageUtilizationRate: number;
    totalBreakdowns: number;
    statusCounts: {
        completed: number;
        ongoing: number;
        delayed: number;
    };
    showDetails?: boolean;
}

export function BreakdownStatistics({
    totalAllocated,
    totalUtilized,
    totalObligated,
    averageUtilizationRate,
    totalBreakdowns,
    statusCounts,
    showDetails = true,
}: BreakdownStatisticsProps) {
    if (!showDetails) return null;

    const statusConfig = [
        { key: "completed", label: "Completed", dotColor: "bg-zinc-500" },
        { key: "ongoing", label: "Ongoing", dotColor: "bg-zinc-400" },
        { key: "delayed", label: "Delayed", dotColor: "bg-zinc-300" },
    ];

    return (
        <StandardStatisticsGrid
            stat1Label="Total Allocated Budget"
            stat1Value={formatCurrency(totalAllocated)}
            stat2Label="Average Utilization Rate"
            stat2Value={formatPercentage(averageUtilizationRate)}
            stat3Label="Total Utilized Budget"
            stat3Value={formatCurrency(totalUtilized)}
            stat4Label="Total Obligated Budget"
            stat4Value={formatCurrency(totalObligated)}
            stat5Label="Total Breakdown Records"
            stat5Value={totalBreakdowns.toString()}
            statusConfig={statusConfig}
            statusCounts={statusCounts}
            className="animate-in fade-in slide-in-from-top-4 duration-500"
        />
    );
}
