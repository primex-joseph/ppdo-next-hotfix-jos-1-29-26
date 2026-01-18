// app/dashboard/project/budget/[particularId]/components/useProjectMutations.ts
// UPDATED FILE - Phase 5: Migrate to use service layer

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { withMutationHandling } from "@/services";

export function useProjectMutations(budgetItemId?: Id<"budgetItems">) {
  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.moveToTrash);
  const recalculateBudgetItem = useMutation(api.budgetItems.recalculateSingleBudgetItem);

  const handleAddProject = async (projectData: any): Promise<string | null> => {
    if (!budgetItemId) {
      console.error("Budget item not found. Cannot create project.");
      return null;
    }

    const success = await withMutationHandling(
      () => createProject({
        particulars: projectData.particulars,
        budgetItemId,
        categoryId: projectData.categoryId || undefined,
        implementingOffice: projectData.implementingOffice,
        totalBudgetAllocated: projectData.totalBudgetAllocated,
        obligatedBudget: projectData.obligatedBudget || undefined,
        totalBudgetUtilized: projectData.totalBudgetUtilized || 0,
        remarks: projectData.remarks || undefined,
        year: projectData.year || undefined,
        targetDateCompletion: projectData.targetDateCompletion || undefined,
        projectManagerId: projectData.projectManagerId || undefined,
      }),
      {
        loadingMessage: "Creating project...",
        successMessage: `Project "${projectData.particulars}" created successfully!`,
        errorMessage: "Failed to create project",
        onError: (error) => {
          if (error?.code === "VALIDATION_ERROR") {
            console.error("Validation details:", error.details);
          }
        },
      }
    );

    // Extract project ID from response if available
    // Note: This assumes the mutation returns the created project ID
    // You may need to adjust based on your actual API response structure
    return success ? (success as any).id || (success as any).data?.id || null : null;
  };

  const handleEditProject = async (id: string, projectData: any) => {
    if (!budgetItemId) {
      console.error("Budget item not found. Cannot edit project.");
      return false;
    }
    
    return await withMutationHandling(
      () => updateProject({
        id: id as Id<"projects">,
        particulars: projectData.particulars,
        budgetItemId,
        categoryId: projectData.categoryId || undefined,
        implementingOffice: projectData.implementingOffice,
        totalBudgetAllocated: projectData.totalBudgetAllocated,
        obligatedBudget: projectData.obligatedBudget || undefined,
        totalBudgetUtilized: projectData.totalBudgetUtilized || 0,
        remarks: projectData.remarks || undefined,
        year: projectData.year || undefined,
        targetDateCompletion: projectData.targetDateCompletion || undefined,
        projectManagerId: projectData.projectManagerId || undefined,
        reason: "Updated via dashboard UI",
      }),
      {
        loadingMessage: "Updating project...",
        successMessage: `Project "${projectData.particulars}" updated successfully!`,
        errorMessage: "Failed to update project",
      }
    );
  };

  const handleDeleteProject = async (id: string) => {
    return await withMutationHandling(
      () => deleteProject({
        id: id as Id<"projects">,
        reason: "Moved to trash via project dashboard",
      }),
      {
        loadingMessage: "Moving to trash...",
        successMessage: "Project moved to trash successfully!",
        errorMessage: "Failed to delete project",
      }
    );
  };

  const handleRecalculate = async () => {
    if (!budgetItemId) {
      console.error("Budget item not found. Cannot recalculate.");
      return false;
    }
    
    return await withMutationHandling(
      () => recalculateBudgetItem({ budgetItemId }),
      {
        loadingMessage: "Recalculating...",
        successMessage: "Budget item recalculated successfully!",
        errorMessage: "Failed to recalculate budget item",
      }
    );
  };

  return {
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    handleRecalculate,
  };
}