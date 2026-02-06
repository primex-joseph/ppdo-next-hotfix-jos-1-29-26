// components/ppdo/funds/components/FundsStatistics.tsx

"use client";

import React, { useMemo } from "react";
import { StandardStatisticsGrid } from "@/components/ppdo/shared";
import { StatusCounts } from "../types";

export interface FundsStatisticsProps {
  totalAllocated: number;
  totalUtilized: number;
  totalObligated: number;
  averageUtilizationRate: number;
  totalProjects: number;
  statusCounts: StatusCounts;
  labels?: {
    allocated?: string;
    utilized?: string;
    obligated?: string;
    utilizationRate?: string;
    projects?: string;
  };
}

export function FundsStatistics({
  totalAllocated,
  totalUtilized,
  totalObligated,
  averageUtilizationRate,
  totalProjects,
  statusCounts,
  labels = {
    allocated: "Total Budget Allocated",
    utilized: "Total Budget Utilized",
    obligated: "Total Obligated Budget",
    utilizationRate: "Average Utilization Rate",
    projects: "Total Projects",
  },
}: FundsStatisticsProps) {
  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
      }),
    []
  );

  // Status configuration - using gray scale like BudgetStatistics
  const statusConfig = [
    {
      key: "on_process" as const,
      label: "On Process",
      dotColor: "bg-zinc-700",
    },
    {
      key: "ongoing" as const,
      label: "Ongoing",
      dotColor: "bg-zinc-600",
    },
    {
      key: "completed" as const,
      label: "Completed",
      dotColor: "bg-zinc-500",
    },
  ];

  return (
    <StandardStatisticsGrid
      ariaLabel="Fund statistics"
      stat1Label={labels.allocated || "Total Budget Allocated"}
      stat1Value={currency.format(totalAllocated)}
      stat2Label={labels.utilizationRate || "Average Utilization Rate"}
      stat2Value={`${averageUtilizationRate.toFixed(1)}%`}
      stat3Label={labels.utilized || "Total Budget Utilized"}
      stat3Value={currency.format(totalUtilized)}
      stat4Label={labels.obligated || "Total Obligated Budget"}
      stat4Value={currency.format(totalObligated)}
      stat5Label={labels.projects || "Total Projects"}
      stat5Value={totalProjects.toLocaleString()}
      statusConfig={statusConfig}
      statusCounts={{
        on_process: statusCounts.on_process || 0,
        ongoing: statusCounts.ongoing || 0,
        completed: statusCounts.completed || 0,
      }}
    />
  );
}

export default FundsStatistics;
