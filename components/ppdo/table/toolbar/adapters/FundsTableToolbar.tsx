"use client";

/**
 * FundsTableToolbar Adapter
 *
 * BACKWARD COMPATIBILITY WRAPPER WITH KANBAN SUPPORT
 *
 * This component wraps the unified TableToolbar to maintain backward compatibility
 * with existing FundsTableToolbar imports while supporting Kanban view features:
 * - Status visibility toggle (for Kanban columns)
 * - Field visibility toggle (for Kanban card fields)
 * - Feature toggles for showing/hiding column and export menus
 *
 * Old code continues to work:
 * ```tsx
 * import { FundsTableToolbar } from "@/components/ppdo/table/toolbar";
 * <FundsTableToolbar {...props} />
 * ```
 *
 * The props interface is unchanged (new Kanban props are optional).
 * Internally, it uses the new TableToolbar.
 */

import React from "react";
import { TableToolbar } from "../TableToolbar";
import { KanbanFieldConfig } from "../types";
import { AVAILABLE_COLUMNS } from "@/components/ppdo/funds/constants";

/**
 * Default Kanban fields for funds cards
 */
const DEFAULT_KANBAN_FIELDS: KanbanFieldConfig[] = [
  { id: "received", label: "Received" },
  { id: "obligatedPR", label: "Obligated/PR" },
  { id: "utilized", label: "Utilized" },
  { id: "balance", label: "Balance" },
  { id: "utilizationRate", label: "Utilization Rate" },
  { id: "date", label: "Date" },
  { id: "remarks", label: "Remarks" },
];

export interface FundsTableToolbarProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;

  // Selection
  selectedCount: number;
  onClearSelection: () => void;

  // Column Visibility
  hiddenColumns: Set<string>;
  onToggleColumn: (columnId: string, isChecked: boolean) => void;
  onShowAllColumns: () => void;
  onHideAllColumns: () => void;

  // Export/Print
  onExportCSV: () => void;
  onPrint?: () => void;
  onOpenPrintPreview?: () => void;
  hasPrintDraft?: boolean;

  // Actions
  isAdmin: boolean;
  onOpenTrash?: () => void;
  onBulkTrash: () => void;
  onAddNew?: () => void;

  // UI
  accentColor: string;
  title?: string;
  searchPlaceholder?: string;

  // Feature toggles
  showColumnToggle?: boolean;
  showExport?: boolean;

  // ============================================
  // KANBAN VIEW SUPPORT (NEW)
  // ============================================

  /** Visible status IDs for Kanban view filtering */
  visibleStatuses?: Set<string>;
  /** Callback when user toggles status visibility in Kanban view */
  onToggleStatus?: (statusId: string, isChecked: boolean) => void;
  /** Visible field IDs for Kanban card display */
  visibleFields?: Set<string>;
  /** Callback when user toggles field visibility on Kanban cards */
  onToggleField?: (fieldId: string, isChecked: boolean) => void;

  // ============================================
  // ENHANCED FEATURES (NEW)
  // ============================================

  /** Share functionality (requires backend support) */
  pendingRequestsCount?: number;
  onOpenShare?: () => void;

  /** Expand button slot */
  expandButton?: React.ReactNode;
}

export function FundsTableToolbar({
  searchQuery,
  onSearchChange,
  searchInputRef,
  selectedCount,
  onClearSelection,
  hiddenColumns,
  onToggleColumn,
  onShowAllColumns,
  onHideAllColumns,
  onExportCSV,
  onPrint,
  onOpenPrintPreview,
  hasPrintDraft,
  isAdmin,
  onOpenTrash,
  onBulkTrash,
  onAddNew,
  accentColor,
  title = "Funds",
  searchPlaceholder = "Search funds...",
  showColumnToggle = true,
  showExport = true,
  // Kanban support
  visibleStatuses,
  onToggleStatus,
  visibleFields,
  onToggleField,
  // Enhanced features
  pendingRequestsCount,
  onOpenShare,
  expandButton,
}: FundsTableToolbarProps) {
  return (
    <TableToolbar
      title={title}
      searchPlaceholder={searchPlaceholder}
      addButtonLabel="Add"
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchInputRef={searchInputRef as React.RefObject<HTMLInputElement>}
      selectedCount={selectedCount}
      onClearSelection={onClearSelection}
      hiddenColumns={hiddenColumns}
      onToggleColumn={onToggleColumn}
      onShowAllColumns={onShowAllColumns}
      onHideAllColumns={onHideAllColumns}
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
      accentColor={accentColor}
      expandButton={expandButton}
      columns={AVAILABLE_COLUMNS.map(col => ({ key: col.id, label: col.label }))}
      // Kanban support
      visibleStatuses={visibleStatuses}
      onToggleStatus={onToggleStatus}
      visibleFields={visibleFields}
      onToggleField={onToggleField}
      kanbanFields={DEFAULT_KANBAN_FIELDS}
      // Feature toggles
      showColumnVisibility={showColumnToggle}
      showExport={showExport}
      showShare={!!onOpenShare}
      showPrintPreview={true}
      showDirectPrint={true}
      animatedSearch={true}
    />
  );
}
