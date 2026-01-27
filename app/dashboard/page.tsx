// app/dashboard/page.tsx
/**
 * Main Dashboard Landing Page
 *
 * Displays fiscal year cards as the primary dashboard interface.
 * Users select a fiscal year to view year-specific analytics.
 *
 * This replaces the previous single analytics view with a year-selection view.
 */

import { FiscalYearLanding } from "@/components/ppdo/dashboard/landing";

export default function DashboardPage() {
  return <FiscalYearLanding />;
}
