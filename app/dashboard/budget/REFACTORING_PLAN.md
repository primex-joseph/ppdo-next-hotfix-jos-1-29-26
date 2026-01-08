# Budget — Year Folders: Architecture & Plan

Overview
- Show one folder (tile) per year on `/dashboard/budget` only when budget data exists for that year. Clicking a year opens that year's items (lazy-loaded, paginated).

Goals
- Fast initial load: only year metadata (year, count, totalAllocated, lastUpdated).
- Scalable: avoid fetching full dataset up front; support pagination per year.
- Deep-linkable: `/dashboard/budget/2025` should load that year's view.

Data model / backend
- Source: existing budget items table (Convex). Each item must have a normalized `year` field (number).
- Add Convex indexes on `year` to support queries.

Convex queries (proposed)
- `getYearsWithCounts()` — returns `[{ year: number, count: number, totalAllocated: number, lastUpdated: number }]` ordered desc.
- `listByYear({ year, paginationOpts })` — paginated list of budget items for a given year.

Frontend components & routing
- `YearFoldersGrid` — root grid that shows `YearFolderCard` for every year returned by `getYearsWithCounts()`.
- `YearFolderCard` — shows year, count, total allocated, updated timestamp, and CTA to open/navigate.
- `app/dashboard/budget/page.tsx` — load `getYearsWithCounts()` and render `YearFoldersGrid`. Fallback: group results from `useBudgetData` if metadata unavailable.
- `app/dashboard/budget/[year]/page.tsx` — dynamic route rendering items for `year` using `listByYear` with pagination and filters.

UX behavior
- Default order: newest year first.
- Expand vs navigate: clicking the card navigates to `/dashboard/budget/2025`; a chevron expands inline (optional) and lazy-loads items.
- Support an "Unspecified" folder for items missing `year` (optional).

Implementation plan (steps)
1. Convex: implement `getYearsWithCounts()` and `listByYear()` and add `year` index. (server)
2. UI: create `YearFolderCard` and `YearFoldersGrid` components. (client)
3. Root page: update `app/dashboard/budget/page.tsx` to use `getYearsWithCounts()` and render folders; wire navigation.
4. Year page: add `app/dashboard/budget/[year]/page.tsx` to show paginated items and controls (filters, export, create-in-year CTA).
5. Wire fallback to `useBudgetData` grouping while Convex endpoints roll out. (compat)
6. Tests & QA: verify counts, pagination, performance, and RBAC.

Tasks (summary)
- Add Convex functions: `convex/budgetItems.ts` (years metadata + per-year list). Ensure `v` validators and index usage.
- Create UI components: `app/dashboard/budget/components/YearFolderCard.tsx` and `YearFoldersGrid.tsx`.
- Update `app/dashboard/budget/page.tsx` to load metadata and render grid.
- Add dynamic route: `app/dashboard/budget/[year]/page.tsx` to list items with `listByYear`.
- Integrate lazy-loading: wire `YearFolderCard` to fetch items on expand.
- Update docs & commit.

Acceptance criteria
- `/dashboard/budget` shows one tile per year where budget data exists.
- Clicking a year opens a page or expands inline to list that year's items (paginated).
- Counts and totals match DB data and update after changes.

Notes
- Use existing `useBudgetData` as fallback to avoid regressions.
- Prioritize server metadata query for large datasets; client-only grouping OK for small installs.

Files to change (suggested)
- convex/budgetItems.ts  (new)
- app/dashboard/budget/page.tsx
- app/dashboard/budget/[year]/page.tsx  (new)
- app/dashboard/budget/components/YearFolderCard.tsx (new)
- app/dashboard/budget/components/YearFoldersGrid.tsx (new)
- app/dashboard/budget/REFACTORING_PLAN.md  (this file)

----
Created on: 2026-01-08
