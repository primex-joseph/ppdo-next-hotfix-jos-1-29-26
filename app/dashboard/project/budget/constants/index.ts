// app/dashboard/project/budget/constants/index.ts

// Re-export shared constants
export {
  VALIDATION_MESSAGES,
  VALIDATION_LIMITS,
  CODE_PATTERN,
} from "@/lib/shared/constants/validation";

export {
  STORAGE_KEYS,
} from "@/lib/shared/constants/storage";

export {
  PAGINATION,
  TIMEOUTS,
  LIMITS,
  AVATAR_COLORS,
} from "@/lib/shared/constants/display";

// Budget-specific constants
export const ITEMS_PER_PAGE = 20;

export const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "delayed", label: "Delayed" },
] as const;

export const ACCESS_LEVELS = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
] as const;

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