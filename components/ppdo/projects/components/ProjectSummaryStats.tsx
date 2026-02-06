/**
 * Project Summary Statistics Component
 * 
 * Standardized 3-column statistics grid for project particulars page.
 * Matches the Budget Tracking 2025 reference design.
 */

import React, { useMemo } from "react";
import { StandardStatisticsGrid } from "@/components/ppdo/shared";

interface ProjectSummaryStatsProps {
  totalAllocated: number;
  totalUtilized: number;
  totalObligated?: number;
  avgUtilizationRate: number;
  totalProjects: number;
  statusCounts?: {
    completed: number;
    ongoing: number;
    delayed: number;
  };
}

export function ProjectSummaryStats({
  totalAllocated,
  totalUtilized,
  totalObligated = 0,
  avgUtilizationRate,
  totalProjects,
  statusCounts,
}: ProjectSummaryStatsProps) {
  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  // Default status counts if not provided
  const defaultStatusCounts = {
    completed: 0,
    ongoing: 0,
    delayed: 0,
  };

  const counts = statusCounts || defaultStatusCounts;

  const statusConfig = [
    {
      key: "completed" as const,
      label: "Completed",
      dotColor: "bg-zinc-700",
    },
    {
      key: "ongoing" as const,
      label: "Ongoing",
      dotColor: "bg-zinc-600",
    },
    {
      key: "delayed" as const,
      label: "Delayed",
      dotColor: "bg-zinc-500",
    },
  ];

  return (
    <StandardStatisticsGrid
      ariaLabel="Project summary statistics"
      stat1Label="Total Allocated Budget"
      stat1Value={currency.format(totalAllocated)}
      stat2Label="Average Utilization Rate"
      stat2Value={`${avgUtilizationRate.toFixed(1)}%`}
      stat3Label="Total Utilized Budget"
      stat3Value={currency.format(totalUtilized)}
      stat4Label="Total Obligated Budget"
      stat4Value={currency.format(totalObligated)}
      stat5Label="Total Projects"
      stat5Value={totalProjects.toLocaleString()}
      statusConfig={statusConfig}
      statusCounts={counts}
    />
  );
}

export default ProjectSummaryStats;
