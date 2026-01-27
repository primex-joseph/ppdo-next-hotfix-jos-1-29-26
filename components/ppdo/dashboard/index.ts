// components/ppdo/dashboard/index.ts
/**
 * Dashboard component barrel exports
 * Provides unified access to all dashboard components
 */

// Charts
export {
  ActivityHeatmap,
  BudgetStatusProgressList,
  DashboardChartCard,
  DepartmentUtilizationHorizontalBar,
  ExecutiveFinancialPie,
  GovernmentTrendsAreaChart,
  ProjectStatusVerticalBar,
  StatusDistributionPie,
  TrustFundLineChart,
} from './charts';

// Summary Components
export {
  DashboardSummary,
  KPICardsRow,
  AnalyticsGrid,
} from './summary';

// Landing Components
export {
  FiscalYearLanding,
  FiscalYearLandingCard,
} from './landing';