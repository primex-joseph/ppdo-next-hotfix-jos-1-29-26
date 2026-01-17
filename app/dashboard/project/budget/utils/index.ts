// app/dashboard/project/budget/utils/index.ts

import { BudgetItem, BudgetTotals, SortField, SortDirection } from "../types";

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Returns color class based on utilization rate
 * @param rate - Utilization rate percentage (0-100)
 * @returns Tailwind color class string
 */
export function getUtilizationColor(rate: number): string {
  if (rate >= 80) return "text-red-600 dark:text-red-400";
  if (rate >= 60) return "text-orange-600 dark:text-orange-400";
  return "text-green-600 dark:text-green-400";
}

/**
 * Returns color class based on project status value
 * @param value - Project status percentage
 * @returns Tailwind color class string
 */
export function getProjectStatusColor(value: number): string {
  if (value >= 50) return "text-green-600 dark:text-green-400";
  if (value >= 30) return "text-orange-600 dark:text-orange-400";
  return "text-zinc-600 dark:text-zinc-400";
}

/**
 * Returns color class based on budget status
 * @param status - Budget status string
 * @returns Tailwind color class string
 */
export function getStatusColor(status?: string): string {
  if (!status) return "text-zinc-600 dark:text-zinc-400";

  switch (status) {
    case "completed":
      return "text-green-600 dark:text-green-400";
    case "ongoing":
      return "text-blue-600 dark:text-blue-400";
    case "delayed":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-zinc-600 dark:text-zinc-400";
  }
}

/**
 * Returns avatar background color based on name
 * @param name - User name
 * @returns Tailwind background color class
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Formats number with commas for display
 * @param value - String value to format
 * @returns Formatted string with commas
 */
export function formatNumberWithCommas(value: string): string {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, "");

  // Split by decimal point
  const parts = cleaned.split(".");

  // Format the integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Rejoin with decimal (limit to 2 decimal places)
  if (parts.length > 1) {
    return parts[0] + "." + parts[1].slice(0, 2);
  }

  return parts[0];
}

/**
 * Parses formatted number string to number
 * @param value - Formatted string
 * @returns Parsed number
 */
export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats number for display after blur
 * @param value - Number value
 * @returns Formatted string
 */
export function formatNumberForDisplay(value: number): string {
  if (value === 0) return "";
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats currency value
 * @param value - Number to format as currency
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================================
// FILTERING & SORTING UTILITIES
// ============================================================================

/**
 * Filters budget items based on search query
 * @param items - Array of budget items
 * @param query - Search query string
 * @returns Filtered array of budget items
 */
export function filterBySearchQuery(
  items: BudgetItem[],
  query: string
): BudgetItem[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) => {
    return (
      item.particular.toLowerCase().includes(lowerQuery) ||
      item.year?.toString().includes(lowerQuery) ||
      item.status?.toLowerCase().includes(lowerQuery) ||
      item.totalBudgetAllocated.toString().includes(lowerQuery) ||
      (item.obligatedBudget?.toString() || "").includes(lowerQuery) ||
      item.totalBudgetUtilized.toString().includes(lowerQuery) ||
      item.utilizationRate.toFixed(1).includes(lowerQuery) ||
      item.projectCompleted.toFixed(1).includes(lowerQuery) ||
      item.projectDelayed.toFixed(1).includes(lowerQuery) ||
      item.projectsOnTrack.toFixed(1).includes(lowerQuery)
    );
  });
}

/**
 * Filters budget items by status
 * @param items - Array of budget items
 * @param statuses - Array of status strings to filter by
 * @returns Filtered array of budget items
 */
export function filterByStatus(
  items: BudgetItem[],
  statuses: string[]
): BudgetItem[] {
  if (statuses.length === 0) return items;
  return items.filter((item) => item.status && statuses.includes(item.status));
}

/**
 * Filters budget items by year
 * @param items - Array of budget items
 * @param years - Array of years to filter by
 * @returns Filtered array of budget items
 */
export function filterByYear(
  items: BudgetItem[],
  years: number[]
): BudgetItem[] {
  if (years.length === 0) return items;
  return items.filter((item) => item.year && years.includes(item.year));
}

/**
 * Sorts budget items by field and direction
 * @param items - Array of budget items to sort
 * @param field - Field to sort by
 * @param direction - Sort direction
 * @returns Sorted array of budget items
 */
export function sortBudgetItems(
  items: BudgetItem[],
  field: SortField,
  direction: SortDirection
): BudgetItem[] {
  if (!field || !direction) return items;

  return [...items].sort((a, b) => {
    const aVal = a[field as keyof BudgetItem];
    const bVal = b[field as keyof BudgetItem];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

/**
 * Sorts items with pinned items first
 * @param items - Array of budget items
 * @returns Sorted array with pinned items first
 */
export function sortWithPinnedFirst(items: BudgetItem[]): BudgetItem[] {
  return [...items].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
}

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculates totals from budget items
 * @param items - Array of budget items
 * @returns Object containing all totals
 */
export function calculateBudgetTotals(items: BudgetItem[]): BudgetTotals {
  return items.reduce(
    (acc, item) => ({
      totalBudgetAllocated: acc.totalBudgetAllocated + item.totalBudgetAllocated,
      obligatedBudget: acc.obligatedBudget + (item.obligatedBudget || 0),
      totalBudgetUtilized: acc.totalBudgetUtilized + item.totalBudgetUtilized,
      projectCompleted: acc.projectCompleted + item.projectCompleted,
      projectDelayed: acc.projectDelayed + item.projectDelayed,
      projectsOnTrack: acc.projectsOnTrack + item.projectsOnTrack,
    }),
    {
      totalBudgetAllocated: 0,
      obligatedBudget: 0,
      totalBudgetUtilized: 0,
      projectCompleted: 0,
      projectDelayed: 0,
      projectsOnTrack: 0,
    }
  );
}

/**
 * Calculates total utilization rate
 * @param totals - Budget totals object
 * @returns Utilization rate percentage
 */
export function calculateTotalUtilizationRate(totals: BudgetTotals): number {
  return totals.totalBudgetAllocated > 0
    ? (totals.totalBudgetUtilized / totals.totalBudgetAllocated) * 100
    : 0;
}

// ============================================================================
// EXTRACTION UTILITIES
// ============================================================================

/**
 * Extracts unique statuses from budget items
 * @param items - Array of budget items
 * @returns Sorted array of unique status strings
 */
export function extractUniqueStatuses(items: BudgetItem[]): string[] {
  const statuses = new Set<string>();
  items.forEach((item) => {
    if (item.status) statuses.add(item.status);
  });
  return Array.from(statuses).sort();
}

/**
 * Extracts unique years from budget items
 * @param items - Array of budget items
 * @returns Sorted array of unique years (descending)
 */
export function extractUniqueYears(items: BudgetItem[]): number[] {
  const years = new Set<number>();
  items.forEach((item) => {
    if (item.year) years.add(item.year);
  });
  return Array.from(years).sort((a, b) => b - a);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Checks if a string is a valid particular code format
 * @param value - String to validate
 * @returns Boolean indicating if valid
 */
export function isValidParticularCode(value: string): boolean {
  return /^[\p{L}0-9_%\s,.\-@]+$/u.test(value);
}

/**
 * Checks if budget is exceeded
 * @param utilized - Amount utilized
 * @param allocated - Amount allocated
 * @returns Boolean indicating if exceeded
 */
export function isBudgetExceeded(utilized: number, allocated: number): boolean {
  return utilized > allocated;
}

/**
 * Checks if obligated budget exceeds allocated
 * @param obligated - Obligated amount
 * @param allocated - Allocated amount
 * @returns Boolean indicating if exceeded
 */
export function isObligatedExceeded(
  obligated: number | undefined,
  allocated: number
): boolean {
  return obligated !== undefined && obligated > allocated;
}