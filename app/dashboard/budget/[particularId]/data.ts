// app/dashboard/budget/[particularId]/data.ts

import { Project, BudgetParticular, PARTICULAR_FULL_NAMES } from "../types";

// Mock project data - in production, this would come from an API
export function getProjectsByParticular(
  particular: BudgetParticular
): Project[] {
  // Sample data - replace with actual API calls
  // In production, filter by particular from API
  const baseProjects: Project[] = [
    {
      id: "1",
      projectName: "Women's Empowerment Workshop Series",
      implementingOffice: "GAD Office",
      allocatedBudget: 1000000,
      dateStarted: "2024-01-15",
      completionDate: "2024-06-30",
      revisedBudget: 707000,
      totalBudgetUtilized: 500000,
      utilizationRate: 70.7,
      balance: 207000,
      projectAccomplishment: 65.0,
      status: "on_track",
      remarks: "On track with quarterly milestones",
    },
    {
      id: "2",
      projectName: "Gender Sensitivity Training Program",
      implementingOffice: "HRMO",
      allocatedBudget: 500000,
      dateStarted: "2024-02-01",
      completionDate: "2024-05-31",
      revisedBudget: 450000,
      totalBudgetUtilized: 405000,
      utilizationRate: 90.0,
      balance: 45000,
      projectAccomplishment: 85.0,
      status: "on_track",
      remarks: "Ahead of schedule",
    },
    {
      id: "3",
      projectName: "Childcare Support Initiative",
      implementingOffice: "Social Welfare Office",
      allocatedBudget: 750000,
      dateStarted: "2024-03-01",
      completionDate: "2024-12-31",
      revisedBudget: 750000,
      totalBudgetUtilized: 300000,
      utilizationRate: 40.0,
      balance: 450000,
      projectAccomplishment: 35.0,
      status: "on_track",
      remarks: "Initial phase completed",
    },
    {
      id: "4",
      projectName: "Gender-Responsive Budgeting Workshop",
      implementingOffice: "Budget Office",
      allocatedBudget: 300000,
      dateStarted: "2024-04-15",
      completionDate: "2024-08-15",
      revisedBudget: 300000,
      totalBudgetUtilized: 75000,
      utilizationRate: 25.0,
      balance: 225000,
      projectAccomplishment: 20.0,
      status: "delayed",
      remarks: "Planning phase",
    },
    {
      id: "5",
      projectName: "Women's Health Awareness Campaign",
      implementingOffice: "Health Office",
      allocatedBudget: 600000,
      dateStarted: "2024-05-01",
      completionDate: "2024-10-31",
      revisedBudget: 600000,
      totalBudgetUtilized: 300000,
      utilizationRate: 50.0,
      balance: 300000,
      projectAccomplishment: 45.0,
      status: "on_track",
      remarks: "Mid-implementation",
    },
  ];

  // Return different sets of projects based on particular
  // For now, return base projects for all particulars
  // In production, filter by particular from API
  return baseProjects;
}

export function getParticularFullName(particular: string): string {
  return PARTICULAR_FULL_NAMES[particular as BudgetParticular] || particular;
}