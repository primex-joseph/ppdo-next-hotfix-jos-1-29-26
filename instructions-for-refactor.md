Refactoring Task: Budget & Project Management Module
📋 High-Level Assessment
Current State Analysis
What's Wrong/Risky/Repetitive:

Massive Code Duplication Across Budget & Project Modules

BudgetTrackingTable.tsx (890 lines) and ProjectsTable.tsx (580 lines) share ~60% identical patterns
Filter logic, search, sorting, selection duplicated in both
Context menu implementations nearly identical
Modal management patterns repeated


Type Definitions Scattered

Budget types in app/dashboard/project/budget/types/index.ts
Project types in app/dashboard/project/budget/[particularId]/types.ts
Overlapping definitions (SortField, SortDirection, ContextMenu)


Utility Functions Duplicated

budget/utils/index.ts and [particularId]/utils.ts have identical helpers:

formatCurrency, getUtilizationColor, getStatusColor
Sorting, filtering logic repeated
CSV generation could be shared




Constants Fragmentation

budget/constants/index.ts and [particularId]/constants.ts
Validation messages, storage keys, timeouts duplicated


Form Logic Repetition

BudgetItemForm.tsx and ProjectForm.tsx share:

Number formatting helpers (formatNumberWithCommas, parseFormattedNumber)
Display state management for formatted inputs
Draft saving to localStorage
Year auto-fill from URL params




Component Patterns Repeated

Combobox components: BudgetParticularCombobox, ProjectParticularCombobox, ProjectCategoryCombobox, ImplementingOfficeSelector
All share: search, debounce, pagination, create-new functionality
Modal wrappers: Modal.tsx, ConfirmationModal.tsx used identically



What Can Be Improved Safely:

Extract shared table infrastructure
Consolidate type definitions
Create unified utility library
Build reusable form components
Centralize constants
Create generic combobox component


🎯 Refactoring Strategy
Phase 1: Foundation (Core Utilities & Types)
Goal: Establish shared infrastructure without touching business logic
Approach:

Create lib/shared/ directory for cross-module utilities
Extract common types to types/shared.ts
Consolidate formatting and color utilities
Merge constants files

Why This is Safe:

Pure functions with no side effects
Type consolidation doesn't change runtime behavior
Can be done incrementally with parallel imports


Phase 2: Reusable Components
Goal: Extract generic UI components used in both modules
Approach:

Create generic DataTable component for both Budget & Project tables
Build unified EntityCombobox component
Extract FormattedNumberInput component
Create SearchFilterBar component

Why This is Safe:

Components will be functionally identical to current implementations
Props interface will maintain backward compatibility
Existing components remain until migration complete


Phase 3: Hooks & State Management
Goal: Share stateful logic between modules
Approach:

Create useTableState hook for common table operations
Extract useFormattedNumber hook
Build useAutoSave hook for form drafts
Create useURLParams for year/filter synchronization

Why This is Safe:

Hooks encapsulate existing behavior
No changes to component render logic
Can be adopted gradually


Phase 4: Service Layer
Goal: Centralize business logic and API interactions
Approach:

Create services/mutations/ for consistent mutation handling
Build services/filtering/ for shared filter logic
Extract CSV generation to services/export/

Why This is Safe:

Services wrap existing mutation calls
Filtering logic extracted as pure functions
CSV logic isolated and testable


📁 File Changes
✅ Files to Create
Shared Foundation
lib/shared/
├── types/
│   ├── table.types.ts          # Common table types (SortField, Direction, ContextMenu)
│   ├── form.types.ts            # Shared form types (ValidationMessages, FormState)
│   └── entity.types.ts          # Generic entity types (searchable, selectable)
├── utils/
│   ├── formatting.ts            # formatCurrency, formatNumber, parseNumber
│   ├── colors.ts                # getUtilizationColor, getStatusColor, getAvatarColor
│   ├── sorting.ts               # Generic sort with pinned-first
│   ├── filtering.ts             # Generic filter helpers
│   └── csv.ts                   # CSV generation utilities
├── constants/
│   ├── validation.ts            # Shared validation rules & messages
│   ├── storage.ts               # LocalStorage keys
│   └── display.ts               # UI constants (pagination, timeouts)
└── hooks/
    ├── useTableState.ts         # Selection, sort, filter state management
    ├── useFormattedNumber.ts    # Number input formatting & display
    ├── useAutoSave.ts           # LocalStorage auto-save with debounce
    ├── useURLParams.ts          # Year/filter URL synchronization
    └── useDebounce.ts           # Already exists, keep as-is
Reusable Components
components/shared/
├── DataTable/
│   ├── DataTable.tsx            # Generic table wrapper
│   ├── DataTableHeader.tsx      # Sortable/filterable headers
│   ├── DataTableBody.tsx        # Rows with selection
│   ├── DataTableToolbar.tsx     # Search, filters, actions
│   ├── DataTableFooter.tsx      # Totals row
│   └── DataTable.types.ts       # Component prop types
├── EntityCombobox/
│   ├── EntityCombobox.tsx       # Generic searchable dropdown
│   ├── EntityCombobox.types.ts  # Prop interfaces
│   └── useEntityCombobox.ts     # Logic hook
├── FormInputs/
│   ├── FormattedNumberInput.tsx # Currency/number input with formatting
│   ├── CodeInput.tsx            # Validated code input (particular, category)
│   └── YearInput.tsx            # Year input with auto-fill
└── Modals/
    ├── GenericModal.tsx         # Base modal (keep existing Modal.tsx)
    └── ConfirmationModal.tsx    # Keep as-is (already good)
Services
services/
├── mutations/
│   ├── useBudgetMutations.ts    # Keep existing, enhance with error handling
│   ├── useProjectMutations.ts   # Keep existing, enhance with error handling
│   └── mutation.utils.ts        # Shared mutation response handling
├── filtering/
│   ├── tableFilters.ts          # Generic filter functions
│   └── filterPresets.ts         # Common filter configurations
└── export/
    ├── csvExport.ts             # Generic CSV generation
    └── printUtils.ts            # Print formatting helpers

✏️ Files to Modify
Budget Module
app/dashboard/project/budget/
├── components/
│   ├── BudgetTrackingTable.tsx
│   │   → Replace with DataTable component
│   │   → Keep budget-specific logic in wrapper
│   │
│   ├── BudgetItemForm.tsx
│   │   → Use FormattedNumberInput
│   │   → Use useAutoSave hook
│   │   → Use CodeInput component
│   │
│   ├── BudgetParticularCombobox.tsx
│   │   → Wrap EntityCombobox with budget-specific config
│   │
│   └── table/ (components)
│       → Migrate to shared DataTable components
│
├── types/index.ts
│   → Remove duplicated types
│   → Import from lib/shared/types
│
├── utils/index.ts
│   → Remove duplicated utilities
│   → Re-export from lib/shared/utils
│
├── constants/index.ts
│   → Remove duplications
│   → Import from lib/shared/constants
│
└── page.tsx
    → Update imports to use new paths
Project Module
app/dashboard/project/budget/[particularId]/
├── components/
│   ├── ProjectsTable.tsx
│   │   → Replace with DataTable component
│   │   → Keep project-specific grouping logic
│   │
│   ├── ProjectForm.tsx
│   │   → Use FormattedNumberInput
│   │   → Use useAutoSave hook
│   │   → Share validation with BudgetItemForm
│   │
│   ├── ProjectParticularCombobox.tsx
│   │   → Wrap EntityCombobox with project-specific config
│   │
│   ├── ProjectCategoryCombobox.tsx
│   │   → Wrap EntityCombobox with category-specific config
│   │
│   ├── ImplementingOfficeSelector.tsx
│   │   → Wrap EntityCombobox with office-specific config
│   │
│   └── ProjectsTable/ (components)
│       → Migrate to shared DataTable components
│
├── types.ts
│   → Remove duplicated types
│   → Import from lib/shared/types
│   → Keep project-specific types (GroupedProjects, etc.)
│
├── utils.ts
│   → Remove duplicated utilities
│   → Re-export from lib/shared/utils
│   → Keep project-specific utils (groupProjectsByCategory)
│
├── constants.ts
│   → Remove duplications
│   → Import from lib/shared/constants
│   → Keep project-specific constants (AVAILABLE_COLUMNS)
│
└── page.tsx
    → Update imports to use new paths
Global Components
components/budget/
├── BudgetStatistics.tsx         → Keep as-is (domain-specific)
├── BudgetViolationModal.tsx     → Keep as-is (domain-specific)
├── Modal.tsx                    → Keep as-is (working well)
└── ConfirmationModal.tsx        → Keep as-is (working well)

🗑️ Files to Remove
None initially. Files will be deprecated gradually after migration is complete and tested.
Future cleanup (Phase 5):

Old table component files after DataTable migration verified
Duplicate utility files after import paths updated
Redundant type definition files


💻 Code Examples
Example 1: Consolidated Types
Before (Duplicated):
typescript// app/dashboard/project/budget/types/index.ts
export type SortDirection = "asc" | "desc" | null;
export type SortField = "particular" | "year" | "status" | ...;

// app/dashboard/project/budget/[particularId]/types.ts
export type SortDirection = "asc" | "desc" | null;
export type ProjectSortField = "particulars" | "year" | "status" | ...;
After (Shared):
typescript// lib/shared/types/table.types.ts
export type SortDirection = "asc" | "desc" | null;

export interface SortState<T extends string> {
  field: T | null;
  direction: SortDirection;
}

export interface ContextMenuState<T> {
  x: number;
  y: number;
  entity: T;
}

export interface SelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

// app/dashboard/project/budget/types/index.ts
import { SortState } from '@/lib/shared/types/table.types';

export type BudgetSortField = "particular" | "year" | "totalBudgetAllocated" | ...;
export type BudgetSortState = SortState<BudgetSortField>;

// app/dashboard/project/budget/[particularId]/types.ts
import { SortState } from '@/lib/shared/types/table.types';

export type ProjectSortField = "particulars" | "implementingOffice" | ...;
export type ProjectSortState = SortState<ProjectSortField>;

Example 2: Shared Number Formatting
Before (Duplicated in 2 files):
typescript// BudgetItemForm.tsx
const formatNumberWithCommas = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) return parts[0] + '.' + parts[1].slice(0, 2);
  return parts[0];
};

// ProjectForm.tsx
const formatNumberWithCommas = (value: string): string => {
  // ... identical code
};
After (Shared Hook):
typescript// lib/shared/hooks/useFormattedNumber.ts
import { useState, useCallback } from 'react';

interface UseFormattedNumberReturn {
  displayValue: string;
  numericValue: number;
  handleChange: (value: string) => void;
  handleBlur: () => void;
  setValue: (value: number) => void;
}

export function useFormattedNumber(
  initialValue: number = 0,
  onChange?: (value: number) => void
): UseFormattedNumberReturn {
  const [displayValue, setDisplayValue] = useState(
    initialValue > 0 ? formatForDisplay(initialValue) : ''
  );
  const [numericValue, setNumericValue] = useState(initialValue);

  const handleChange = useCallback((value: string) => {
    const formatted = formatWithCommas(value);
    setDisplayValue(formatted);
    const numeric = parseFormattedNumber(formatted);
    setNumericValue(numeric);
    onChange?.(numeric);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    if (numericValue > 0) {
      setDisplayValue(formatForDisplay(numericValue));
    } else {
      setDisplayValue('');
    }
  }, [numericValue]);

  const setValue = useCallback((value: number) => {
    setNumericValue(value);
    setDisplayValue(value > 0 ? formatForDisplay(value) : '');
    onChange?.(value);
  }, [onChange]);

  return { displayValue, numericValue, handleChange, handleBlur, setValue };
}

// lib/shared/utils/formatting.ts
export function formatWithCommas(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (parts.length > 1) return parts[0] + '.' + parts[1].slice(0, 2);
  return parts[0];
}

export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatForDisplay(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}
Usage:
typescript// BudgetItemForm.tsx & ProjectForm.tsx
import { useFormattedNumber } from '@/lib/shared/hooks/useFormattedNumber';

function BudgetItemForm() {
  const form = useForm<FormValues>(...);
  
  const allocatedInput = useFormattedNumber(
    form.getValues("totalBudgetAllocated"),
    (value) => form.setValue("totalBudgetAllocated", value)
  );

  return (
    <FormField name="totalBudgetAllocated" render={({ field }) => (
      <FormattedNumberInput
        value={allocatedInput.displayValue}
        onChange={allocatedInput.handleChange}
        onBlur={allocatedInput.handleBlur}
        prefix="₱"
        placeholder="0"
      />
    )} />
  );
}

Example 3: Generic EntityCombobox
Before (4 nearly identical combobox components):

BudgetParticularCombobox.tsx (280 lines)
ProjectParticularCombobox.tsx (280 lines)
ProjectCategoryCombobox.tsx (320 lines)
ImplementingOfficeSelector.tsx (450 lines)

After (One generic component + config):
typescript// components/shared/EntityCombobox/EntityCombobox.tsx
import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/app/hooks/use-debounce';

export interface EntityComboboxItem {
  id: string;
  code: string;
  displayName: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface EntityComboboxConfig {
  // Entity display
  entityName: string;           // "particular", "category", "office"
  entityNamePlural: string;     // "particulars", "categories", "offices"
  
  // Validation
  codePattern: RegExp;          // /^[\p{L}0-9_%\s,.\-@]+$/u
  codeErrorMessage: string;
  
  // Creation
  allowCreate: boolean;
  createItemFn: (code: string) => Promise<void>;
  
  // Display customization
  renderItem?: (item: EntityComboboxItem) => React.ReactNode;
  renderSelectedValue?: (item: EntityComboboxItem) => React.ReactNode;
  
  // Pagination
  itemsPerPage?: number;
}

interface EntityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  items: EntityComboboxItem[] | undefined;
  config: EntityComboboxConfig;
  disabled?: boolean;
  error?: string;
}

export function EntityCombobox({ value, onChange, items, config, disabled, error }: EntityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(config.itemsPerPage || 20);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredItems = useMemo(() => {
    if (!items || !searchQuery) return items || [];
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.code.toLowerCase().includes(query) ||
      item.displayName.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const displayedItems = filteredItems.slice(0, displayedCount);
  const hasMore = displayedCount < filteredItems.length;

  const selectedItem = useMemo(() =>
    items?.find(item => item.code === value),
    [items, value]
  );

  const canCreateNew = useMemo(() => {
    if (!config.allowCreate || !searchQuery.trim()) return false;
    const upperSearch = searchQuery.trim().toUpperCase();
    if (!config.codePattern.test(upperSearch)) return false;
    return !items?.some(item => item.code.toUpperCase() === upperSearch);
  }, [searchQuery, items, config]);

  const handleCreateNew = async () => {
    if (!canCreateNew) return;
    setIsCreating(true);
    try {
      await config.createItemFn(searchQuery.trim().toUpperCase());
      onChange(searchQuery.trim().toUpperCase());
      setSearchQuery('');
      setOpen(false);
    } catch (error) {
      console.error('Entity creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = (code: string) => {
    onChange(code === value ? '' : code);
    setOpen(false);
    setSearchQuery('');
    setDisplayedCount(config.itemsPerPage || 20);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          {value && selectedItem ? (
            config.renderSelectedValue?.(selectedItem) || (
              <span className="flex items-center gap-2">
                <code className="text-xs">{selectedItem.code}</code>
                <span>{selectedItem.displayName}</span>
              </span>
            )
          ) : (
            `Select ${config.entityName}...`
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${config.entityNamePlural}...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {!items ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>No {config.entityNamePlural} found</CommandEmpty>
            ) : (
              <>
                <CommandGroup>
                  {displayedItems.map(item => (
                    <CommandItem
                      key={item.id}
                      value={item.code}
                      onSelect={() => handleSelect(item.code)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === item.code ? "opacity-100" : "opacity-0")} />
                      {config.renderItem?.(item) || (
                        <div className="flex items-center gap-2 flex-1">
                          <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.code}</code>
                          <span className="truncate">{item.displayName}</span>
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
                
                {hasMore && (
                  <Button variant="ghost" size="sm" onClick={() => setDisplayedCount(c => c + (config.itemsPerPage || 20))}>
                    Load more ({filteredItems.length - displayedCount} remaining)
                  </Button>
                )}
              </>
            )}
            
            {config.allowCreate && searchQuery.length > 0 && (
              <>
                <CommandSeparator />
                {canCreateNew ? (
                  <CommandItem onSelect={handleCreateNew} disabled={isCreating}>
                    {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create "{searchQuery.trim().toUpperCase()}"
                  </CommandItem>
                ) : (
                  <div className="px-2 py-3 text-xs text-muted-foreground">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    {config.codeErrorMessage}
                  </div>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
Usage Example:
typescript// app/dashboard/project/budget/components/BudgetParticularCombobox.tsx
import { EntityCombobox, EntityComboboxConfig } from '@/components/shared/EntityCombobox';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const budgetParticularConfig: EntityComboboxConfig = {
  entityName: 'particular',
  entityNamePlural: 'particulars',
  codePattern: /^[\p{L}0-9_%\s,.\-@]+$/u,
  codeErrorMessage: 'Code can only contain letters, numbers, underscores, percentage signs, spaces, commas, periods, hyphens, and @',
  allowCreate: true,
  itemsPerPage: 20,
  createItemFn: async (code: string) => {
    // Injected from parent
  },
};

export function BudgetParticularCombobox({ value, onChange, disabled, error }: Props) {
  const allParticulars = useQuery(api.budgetParticulars.list, { includeInactive: false });
  const createParticular = useMutation(api.budgetParticulars.create);

  const items = allParticulars?.map(p => ({
    id: p._id,
    code: p.code,
    displayName: p.fullName,
    description: p.description,
    metadata: { usageCount: p.usageCount, category: p.category },
  }));

  const config: EntityComboboxConfig = {
    ...budgetParticularConfig,
    createItemFn: async (code: string) => {
      await createParticular({
        code,
        fullName: code,
        description: `Custom budget particular: ${code}`,
        category: 'Custom',
      });
      toast.success(`Budget particular "${code}" created!`);
    },
  };

  return <EntityCombobox value={value} onChange={onChange} items={items} config={config} disabled={disabled} error={error} />;
}

Example 4: Shared Table State Hook
Before (Duplicated in both tables):
typescript// BudgetTrackingTable.tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [searchQuery, setSearchQuery] = useState("");
const [sortField, setSortField] = useState<SortField>(null);
const [sortDirection, setSortDirection] = useState<SortDirection>(null);
const [statusFilter, setStatusFilter] = useState<string[]>([]);
const [yearFilter, setYearFilter] = useState<number[]>([]);

const handleSort = (field: SortField) => {
  if (sortField === field) {
    setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
    if (sortDirection === "desc") setSortField(null);
  } else {
    setSortField(field);
    setSortDirection("asc");
  }
};

// ... same in ProjectsTable.tsx
After (Shared Hook):
typescript// lib/shared/hooks/useTableState.ts
import { useState, useCallback, useMemo } from 'react';
import { SortDirection } from '../types/table.types';

export interface TableState<TSortField extends string> {
  // Selection
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  
  // Search & Filters
  searchQuery: string;
  statusFilter: string[];
  yearFilter: number[];
  
  // Sorting
  sortField: TSortField | null;
  sortDirection: SortDirection;
}

export interface TableStateActions<TSortField extends string> {
  // Selection
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  toggleRow: (id: string) => void;
  setSelectedIds: (ids: Set<string>) => void;
  
  // Search & Filters
  setSearchQuery: (query: string) => void;
  toggleStatusFilter: (status: string) => void;
  toggleYearFilter: (year: number) => void;
  clearFilters: () => void;
  
  // Sorting
  handleSort: (field: TSortField) => void;
  resetSort: () => void;
}

export function useTableState<TSortField extends string>(
  totalItems: number
): [TableState<TSortField>, TableStateActions<TSortField>] {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<TSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);

  // Selection state
  const isAllSelected = totalItems > 0 && selectedIds.size === totalItems;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < totalItems;

  // Actions
  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleStatusFilter = useCallback((status: string) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }, []);

  const toggleYearFilter = useCallback((year: number) => {
    setYearFilter(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter([]);
    setYearFilter([]);
    setSortField(null);
    setSortDirection(null);
  }, []);

  const handleSort = useCallback((field: TSortField) => {
    if (sortField === field) {
      setSortDirection(prev =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const resetSort = useCallback(() => {
    setSortField(null);
    setSortDirection(null);
  }, []);

  const state: TableState<TSortField> = {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    searchQuery,
    statusFilter,
    yearFilter,
    sortField,
    sortDirection,
  };

  const actions: TableStateActions<TSortField> = {
selectAll,
clearSelection,
toggleRow,
setSelectedIds,
setSearchQuery,
toggleStatusFilter,
toggleYearFilter,
clearFilters,
handleSort,
resetSort,
};
return [state, actions];
}

**Usage:**
```typescript
// BudgetTrackingTable.tsx
import { useTableState } from '@/lib/shared/hooks/useTableState';
import type { BudgetSortField } from '../types';

export function BudgetTrackingTable({ budgetItems, ... }: Props) {
  const [tableState, tableActions] = useTableState<BudgetSortField>(filteredAndSortedItems.length);

  return (
    <div>
      <BudgetSearchFilters
        searchQuery={tableState.searchQuery}
        statusFilter={tableState.statusFilter}
        yearFilter={tableState.yearFilter}
        onSearchChange={tableActions.setSearchQuery}
        onToggleStatusFilter={tableActions.toggleStatusFilter}
        onToggleYearFilter={tableActions.toggleYearFilter}
        onClearFilters={tableActions.clearFilters}
      />
      
      <DataTable
        columns={BUDGET_COLUMNS}
        data={filteredAndSortedItems}
        sortField={tableState.sortField}
        sortDirection={tableState.sortDirection}
        onSort={tableActions.handleSort}
        selectedIds={tableState.selectedIds}
        onSelectAll={(ids) => tableActions.selectAll(ids)}
        onSelectRow={tableActions.toggleRow}
      />
    </div>
  );
}
```

---

## 📝 Additional Recommendations

### Non-Breaking Improvements

1. **Type Safety Enhancements**
   - Add strict typing for mutation responses
   - Create discriminated unions for entity states
   - Use branded types for IDs to prevent mixing Budget/Project IDs

2. **Error Handling Standardization**
   - Create `ErrorBoundary` components for table sections
   - Implement retry logic for failed mutations
   - Add optimistic updates with rollback

3. **Performance Optimizations**
   - Memoize expensive computations in tables
   - Implement virtual scrolling for large datasets
   - Add query result caching where appropriate

4. **Accessibility**
   - Add ARIA labels to all interactive elements
   - Implement keyboard navigation for tables
   - Ensure color contrast meets WCAG AA standards

5. **Testing Infrastructure**
   - Create test utilities for shared hooks
   - Add integration tests for table interactions
   - Mock Convex queries/mutations consistently

---

### Future Scalability Suggestions

1. **State Management Evolution**
   - Consider Zustand/Jotai for complex cross-component state
   - Implement optimistic updates consistently
   - Add undo/redo capability for mutations

2. **Design System**
   - Extract all color utilities to theme tokens
   - Create spacing/sizing constants
   - Document component variants

3. **API Layer**
   - Add request/response interceptors
   - Implement global loading states
   - Create typed API client

4. **Observability**
   - Add performance monitoring
   - Track user interactions (analytics)
   - Log mutation failures for debugging

---

## 🚀 Implementation Order (Recommended)

### Week 1: Foundation
1. Create `lib/shared/types/` structure
2. Extract utilities to `lib/shared/utils/`
3. Consolidate constants to `lib/shared/constants/`
4. Update imports in existing files (parallel to old code)

### Week 2: Shared Hooks
1. Create `useFormattedNumber` hook
2. Create `useTableState` hook
3. Create `useAutoSave` hook
4. Create `useURLParams` hook
5. Test hooks in isolation

### Week 3: Reusable Components
1. Build `FormattedNumberInput` component
2. Build `EntityCombobox` generic component
3. Create wrapper components (BudgetParticularCombobox, etc.)
4. Migrate forms to use new components

### Week 4: Table Infrastructure
1. Create `DataTable` component architecture
2. Build specialized table components (header, body, footer)
3. Migrate BudgetTrackingTable to use DataTable
4. Migrate ProjectsTable to use DataTable

### Week 5: Testing & Cleanup
1. Comprehensive testing of all refactored components
2. Performance benchmarking
3. Remove old duplicate code
4. Update documentation

---

## ⚠️ Migration Risks & Mitigation

### Risk 1: Breaking Changes in Production
**Mitigation:**
- Run old and new code in parallel
- Feature flag new components
- Gradual rollout per module
- Comprehensive E2E tests before deployment

### Risk 2: Performance Regression
**Mitigation:**
- Benchmark before/after
- Monitor bundle size
- Use React DevTools Profiler
- Implement code splitting where needed

### Risk 3: Type Conflicts
**Mitigation:**
- Use TypeScript strict mode
- Gradual migration with type aliases
- Maintain backward compatibility layers
- Thorough type testing

### Risk 4: State Management Issues
**Mitigation:**
- Preserve exact state behavior
- Test all state transitions
- Document state flow diagrams
- Add integration tests for complex interactions

---

## ✅ Success Criteria

This refactoring is successful when:

1. **Code Reduction:** ~40% reduction in total lines of code
2. **No Regressions:** All existing functionality works identically
3. **Improved DX:** Developers can add new features faster
4. **Better Performance:** No measurable performance degradation
5. **Type Safety:** Zero TypeScript errors, full IntelliSense
6. **Test Coverage:** >80% coverage for shared utilities/hooks
7. **Documentation:** Clear usage examples for all shared components

---

## 📚 Documentation Requirements

Create these documentation files alongside the refactor:
docs/
├── refactoring/
│   ├── MIGRATION_GUIDE.md        # Step-by-step migration for developers
│   ├── SHARED_COMPONENTS.md      # Usage guide for shared components
│   ├── HOOKS_API.md              # API reference for custom hooks
│   └── UTILITIES.md              # Reference for utility functions
└── architecture/
├── TABLE_ARCHITECTURE.md     # How DataTable system works
├── FORM_PATTERNS.md          # Form component patterns
└── STATE_MANAGEMENT.md       # State management strategies

---

**End of Refactoring Plan**

This plan prioritizes **safety**, **incremental progress**, and **zero breaking changes**. Each phase can be implemented, tested, and deployed independently.