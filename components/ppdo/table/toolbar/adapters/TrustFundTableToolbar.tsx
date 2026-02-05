"use client";

/**
 * TrustFundTableToolbar Adapter
 *
 * BACKWARD COMPATIBILITY WRAPPER WITH ENHANCED FEATURES
 *
 * This component wraps the unified TableToolbar to maintain backward compatibility
 * with existing TrustFundTableToolbar imports while adding new features:
 * - Column visibility toggle (NEW)
 * - Print preview (NEW)
 * - Admin share functionality (NEW - requires backend support)
 *
 * Old code continues to work:
 * ```tsx
 * import { TrustFundTableToolbar } from "@/components/ppdo/table/toolbar";
 * <TrustFundTableToolbar {...props} />
 * ```
 *
 * The props interface is unchanged (new props are optional).
 * Internally, it uses the new TableToolbar.
 */

import React from "react";
import { TableToolbar } from "../TableToolbar";

/**
 * Trust Fund table columns for visibility toggling
 */
const TRUST_FUND_COLUMNS = [
  { key: "description", label: "Description" },
  { key: "amount", label: "Amount" },
  { key: "received", label: "Received" },
  { key: "utilized", label: "Utilized" },
  { key: "balance", label: "Balance" },
  { key: "utilizationRate", label: "Utilization Rate" },
  { key: "remarks", label: "Remarks" },
];

export interface TrustFundTableToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;

  // Selection
  selectedCount: number;
  onClearSelection: () => void;

  // Export/Print
  onExportCSV: () => void;
  onPrint: () => void;

  // Actions
  isAdmin: boolean;
  onOpenTrash: () => void;
  onBulkTrash: () => void;
  onAddNew?: () => void;

  // UI State
  accentColor: string;

  // ============================================
  // NEW OPTIONAL PROPS (Enhanced features)
  // ============================================

  // Column Visibility (NEW)
  hiddenColumns?: Set<string>;
  onToggleColumn?: (columnId: string, isChecked: boolean) => void;
  onShowAllColumns?: () => void;
  onHideAllColumns?: () => void;

  // Print Preview (NEW)
  onOpenPrintPreview?: () => void;
  hasPrintDraft?: boolean;

  // Share (NEW - requires backend support)
  pendingRequestsCount?: number;
  onOpenShare?: () => void;

  // Expand Button (NEW)
  expandButton?: React.ReactNode;
}

export function TrustFundTableToolbar({
  searchQuery,
  onSearchChange,
  searchInputRef,
  selectedCount,
  onClearSelection,
  onExportCSV,
  onPrint,
  isAdmin,
  onOpenTrash,
  onBulkTrash,
  onAddNew,
  accentColor,
  // New optional props with defaults
  hiddenColumns = new Set(),
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns,
  onOpenPrintPreview,
  hasPrintDraft,
  pendingRequestsCount,
  onOpenShare,
  expandButton,
}: TrustFundTableToolbarProps) {
  // Determine if column visibility features are enabled
  const hasColumnVisibility = !!(onToggleColumn && onShowAllColumns && onHideAllColumns);

  return (
    <TableToolbar
      title="Trust Funds"
      searchPlaceholder="Search trust funds..."
      addButtonLabel="Add"
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchInputRef={searchInputRef}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn || (() => {})}
      onShowAllColumns={onShowAllColumns || (() => {})}
      onHideAllColumns={onHideAllColumns || (() => {})}
      onExportCSV={onExportCSV}
      onPrint={onPrint}
      onOpenPrintPreview={onOpenPrintPreview}
      hasPrintDraft={hasPrintDraft}
      isAdmin={isAdmin}
      pendingRequestsCount={pendingRequestsCount}
      onOpenShare={onOpenShare}
      onOpenTrash={onOpenTrash}
      onBulkTrash={onBulkTrash}
      onAddNew={onAddNew}
      expandButton={expandButton}
      accentColor={accentColor}
      columns={TRUST_FUND_COLUMNS}
      // Feature toggles based on whether props are provided
      showColumnVisibility={hasColumnVisibility}
      showExport={true}
      showShare={!!onOpenShare}
      showPrintPreview={!!onOpenPrintPreview}
      showDirectPrint={true}
      animatedSearch={true}
    />
  );
}
