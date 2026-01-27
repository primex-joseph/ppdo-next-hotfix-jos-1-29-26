// components/ppdo/dashboard/landing/FiscalYearLandingCard.tsx
"use client";

import { Folder, ChevronDown, MoreVertical, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FiscalYearStats } from "@/types/dashboard";

interface FiscalYearLandingCardProps {
  fiscalYear: {
    _id: string;
    year: number;
    label?: string;
    stats: FiscalYearStats;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
  accentColor?: string;
  index?: number;
}

export function FiscalYearLandingCard({
  fiscalYear,
  isExpanded,
  onToggleExpand,
  onOpen,
  onDelete,
  accentColor = "#15803D",
  index = 0,
}: FiscalYearLandingCardProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className={cn(
        "p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-lg dark:hover:shadow-lg/50",
        "border-l-4 overflow-hidden bg-yellow-50 dark:bg-yellow-900/20"
      )}
      style={{
        borderLeftColor: accentColor,
        animation: `fadeInSlide 0.3s ease-out ${index * 0.05}s both`,
      }}
      onClick={onOpen}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Folder className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {fiscalYear.year}
            </h3>
            {fiscalYear.label && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {fiscalYear.label}
              </p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Projects</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {fiscalYear.stats.projectCount}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Budget</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            ₱{(fiscalYear.stats.totalBudgetAllocated / 1_000_000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Utilization Rate */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Utilization
          </p>
          <p className="text-xs font-semibold" style={{ color: accentColor }}>
            {fiscalYear.stats.utilizationRate.toFixed(1)}%
          </p>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, fiscalYear.stats.utilizationRate)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand();
        }}
        className="flex items-center justify-between w-full text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Ongoing</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.ongoingCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Completed
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.completedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Delayed</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.delayedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Breakdowns
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {fiscalYear.stats.breakdownCount}
              </p>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Allocated</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatCurrency(fiscalYear.stats.totalBudgetAllocated)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Utilized</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {formatCurrency(fiscalYear.stats.totalBudgetUtilized)}
              </span>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="w-full mt-3 text-sm h-8"
            style={{ backgroundColor: accentColor }}
          >
            View Full Summary
          </Button>
        </div>
      )}
    </Card>
  );
}
