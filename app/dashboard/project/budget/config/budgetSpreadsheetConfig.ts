// app/dashboard/project/budget/config/budgetSpreadsheetConfig.ts

import { SpreadsheetConfig, ColumnDefinition } from "@/components/spreadsheet/types";
import { BUDGET_TABLE_COLUMNS } from "@/app/dashboard/project/budget/constants";

// Map BUDGET_TABLE_COLUMNS to column definitions with types
function createColumnDefinitions(): ColumnDefinition[] {
  const typeMap: Record<string, "text" | "currency" | "percentage" | "number"> = {
    particular: "text",
    year: "number",
    status: "text",
    totalBudgetAllocated: "currency",
    obligatedBudget: "currency",
    totalBudgetUtilized: "currency",
    utilizationRate: "percentage",
    projectCompleted: "number",
    projectDelayed: "number",
    projectsOnTrack: "number",
  };

  return BUDGET_TABLE_COLUMNS.map(col => ({
    key: col.key,
    label: col.label,
    type: typeMap[col.key] || "text",
    align: col.align,
  }));
}

export const BUDGET_SPREADSHEET_CONFIG: SpreadsheetConfig = {
  tableName: "budgetItems",
  fetchQuery: "api.budgetItems.list",
  columns: createColumnDefinitions(),
  features: {
    enableExport: true,
    enablePrint: true,
    enableShare: false,
    showTotalsRow: true,
    showTotalsColumn: true,
  },
  title: "Budget Tracking",
};