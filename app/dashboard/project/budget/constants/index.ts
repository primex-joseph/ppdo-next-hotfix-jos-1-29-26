// app/dashboard/project/budget/constants/index.ts

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  FORM_DRAFT: "budget_item_form_draft",
  YEAR_PREFERENCE: "budget_year_preference",
  OPEN_ADD: "budget_open_add",
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const ITEMS_PER_PAGE = 20;

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required.",
  EMPTY_WHITESPACE: "Cannot be empty or only whitespace.",
  INVALID_FORMAT:
    "Only letters (including accents), numbers, underscores, percentage signs, spaces, commas, periods, hyphens, and @ are allowed.",
  MIN_ZERO: "Must be 0 or greater.",
  MIN_YEAR: 2000,
  MAX_YEAR: 2100,
} as const;

// ============================================================================
// STATUS OPTIONS
// ============================================================================

export const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "delayed", label: "Delayed" },
] as const;

// ============================================================================
// ACCESS LEVELS
// ============================================================================

export const ACCESS_LEVELS = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
] as const;

// ============================================================================
// TABLE COLUMN CONFIGURATION
// ============================================================================

export const TABLE_COLUMNS = [
  { key: "particular", label: "Particulars", sortable: true, align: "left" },
  { key: "year", label: "Year", sortable: false, align: "center" },
  { key: "status", label: "Status", sortable: false, align: "center" },
  {
    key: "totalBudgetAllocated",
    label: "Budget Allocated",
    sortable: true,
    align: "right",
  },
  {
    key: "obligatedBudget",
    label: "Obligated Budget",
    sortable: true,
    align: "right",
  },
  {
    key: "totalBudgetUtilized",
    label: "Budget Utilized",
    sortable: true,
    align: "right",
  },
  {
    key: "utilizationRate",
    label: "Utilization Rate",
    sortable: true,
    align: "right",
  },
  {
    key: "projectCompleted",
    label: "Completed",
    sortable: true,
    align: "right",
  },
  {
    key: "projectDelayed",
    label: "Delayed",
    sortable: true,
    align: "right",
  },
  {
    key: "projectsOnTrack",
    label: "Ongoing",
    sortable: true,
    align: "right",
  },
] as const;

// ============================================================================
// AVATAR COLORS
// ============================================================================

export const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
] as const;

// ============================================================================
// TIMEOUTS
// ============================================================================

export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 300,
  DRAFT_SAVE: 500,
  HEADER_SKELETON: 600,
} as const;

// ============================================================================
// LIMITS
// ============================================================================

export const LIMITS = {
  UTILIZATION_WARNING: 60,
  UTILIZATION_DANGER: 80,
  PROJECT_STATUS_GOOD: 50,
  PROJECT_STATUS_WARNING: 30,
} as const;