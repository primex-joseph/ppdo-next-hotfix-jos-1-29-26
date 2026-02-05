// Main unified toolbar component
export { TableToolbar } from "./TableToolbar";
export { TableToolbarColumnVisibility } from "./TableToolbarColumnVisibility";
export { TableToolbarBulkActions } from "./TableToolbarBulkActions";

// Types
export type {
  TableToolbarProps,
  BulkAction,
  ColumnVisibilityMenuProps,
  KanbanFieldConfig,
} from "./types";

// ============================================
// ADAPTERS (Backward Compatible)
// ============================================

// Budget
export { BudgetTableToolbar } from "./adapters/BudgetTableToolbar";
export type { BudgetTableToolbarProps } from "./adapters/BudgetTableToolbar";

// Projects
export { ProjectsTableToolbar } from "./adapters/ProjectsTableToolbar";
export type { ProjectsTableToolbarProps } from "./adapters/ProjectsTableToolbar";

// Funds
export { FundsTableToolbar } from "./adapters/FundsTableToolbar";
export type { FundsTableToolbarProps } from "./adapters/FundsTableToolbar";

// Twenty Percent DF
export { TwentyPercentDFTableToolbar } from "./adapters/TwentyPercentDFTableToolbar";
export type { TwentyPercentDFTableToolbarProps } from "./adapters/TwentyPercentDFTableToolbar";

// Trust Fund
export { TrustFundTableToolbar } from "./adapters/TrustFundTableToolbar";
export type { TrustFundTableToolbarProps } from "./adapters/TrustFundTableToolbar";