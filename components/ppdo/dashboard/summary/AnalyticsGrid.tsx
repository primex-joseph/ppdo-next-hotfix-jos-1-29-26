// components/ppdo/dashboard/summary/AnalyticsGrid.tsx
"use client";

import {
  GovernmentTrendsAreaChart,
  ActivityHeatmap,
  BudgetStatusProgressList,
  ExecutiveFinancialPie,
  StatusDistributionPie,
  DepartmentUtilizationHorizontalBar,
} from "@/components/ppdo/dashboard/charts";
import { AnalyticsDataPoint } from "@/types/dashboard";

interface AnalyticsGridProps {
  trendData: AnalyticsDataPoint[];
  financialData: {
    allocated: number;
    utilized: number;
    obligated: number;
  };
  statusData: Array<{
    status: "ongoing" | "completed" | "delayed";
    count: number;
  }>;
  utilizationData: Array<{
    department: string;
    rate: number;
  }>;
  budgetDistributionData: Array<{
    label: string;
    value: number;
    subValue: string;
    percentage: number;
  }>;
  heatmapData: Array<{
    label: string;
    values: number[];
  }>;
  accentColor?: string;
}

export function AnalyticsGrid({
  trendData,
  financialData,
  statusData,
  utilizationData,
  budgetDistributionData,
  heatmapData,
  accentColor = "#15803D",
}: AnalyticsGridProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: High Level Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Trend Chart - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <GovernmentTrendsAreaChart
            title="Budget Allocation vs. Utilization"
            subtitle="Year comparison"
            data={trendData}
            isLoading={false}
          />
        </div>
        {/* Financial Pie Chart - 1 column */}
        <div>
          <ExecutiveFinancialPie
            data={financialData}
            isLoading={false}
          />
        </div>
      </div>

      {/* Row 2: Operational Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatusDistributionPie
          data={statusData}
          isLoading={false}
        />
        <DepartmentUtilizationHorizontalBar
          data={utilizationData}
          isLoading={false}
        />
        <BudgetStatusProgressList
          title="Sector Distribution"
          subtitle="Budget allocation by sector"
          data={budgetDistributionData}
          isLoading={false}
        />
      </div>

      {/* Row 3: Activity Heatmap (Full Width) */}
      <div>
        <ActivityHeatmap
          data={heatmapData}
          isLoading={false}
        />
      </div>
    </div>
  );
}
