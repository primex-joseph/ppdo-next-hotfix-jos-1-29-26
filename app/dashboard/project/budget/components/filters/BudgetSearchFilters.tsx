// app/dashboard/project/budget/components/filters/BudgetSearchFilters.tsx

"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BudgetSearchFiltersProps {
  searchQuery: string;
  statusFilter: string[];
  yearFilter: number[];
  accentColorValue: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onToggleStatusFilter: (status: string) => void;
  onToggleYearFilter: (year: number) => void;
}

export function BudgetSearchFilters({
  searchQuery,
  statusFilter,
  yearFilter,
  accentColorValue,
  hasActiveFilters,
  onSearchChange,
  onClearFilters,
  onToggleStatusFilter,
  onToggleYearFilter,
}: BudgetSearchFiltersProps) {
  return (
    <div className="space-y-4 animate-in slide-in-from-top duration-200">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by particular, year, status, or any value..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={
              {
                "--tw-ring-color": accentColorValue,
              } as React.CSSProperties
            }
          />
        </div>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="secondary"
            size="sm"
            className="gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Filters</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(statusFilter.length > 0 || yearFilter.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Active filters:
          </span>
          {statusFilter.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            >
              Status: {status}
              <button
                onClick={() => onToggleStatusFilter(status)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {yearFilter.map((year) => (
            <span
              key={year}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
            >
              Year: {year}
              <button
                onClick={() => onToggleYearFilter(year)}
                className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}