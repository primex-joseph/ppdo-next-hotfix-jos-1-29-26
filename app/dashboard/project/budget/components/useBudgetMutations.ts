// app/dashboard/project/budget/components/useBudgetMutations.ts
// UPDATED FILE - Phase 5: Migrate to use service layer

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BudgetItem } from "@/types/types";
import { withMutationHandling } from "@/services";

export function useBudgetMutations() {
  const createBudgetItem = useMutation(api.budgetItems.create);
  const updateBudgetItem = useMutation(api.budgetItems.update);
  const moveToTrash = useMutation(api.budgetItems.moveToTrash);

  const handleAdd = async (
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => {
    return await withMutationHandling(
      () => createBudgetItem({
        particulars: item.particular,
        totalBudgetAllocated: item.totalBudgetAllocated,
        obligatedBudget: item.obligatedBudget,
        totalBudgetUtilized: item.totalBudgetUtilized,
        year: item.year,
      }),
      {
        loadingMessage: "Creating budget item...",
        successMessage: "Budget item created successfully",
        errorMessage: "Failed to create budget item",
        onError: (error) => {
          if (error?.code === "VALIDATION_ERROR") {
            console.error("Validation details:", error.details);
          }
        },
      }
    );
  };

  const handleEdit = async (
    id: string,
    item: Omit<
      BudgetItem,
      | "id"
      | "utilizationRate"
      | "projectCompleted"
      | "projectDelayed"
      | "projectsOnTrack"
      | "status"
    >
  ) => {
    return await withMutationHandling(
      () => updateBudgetItem({
        id: id as Id<"budgetItems">,
        particulars: item.particular,
        totalBudgetAllocated: item.totalBudgetAllocated,
        obligatedBudget: item.obligatedBudget,
        totalBudgetUtilized: item.totalBudgetUtilized,
        year: item.year,
      }),
      {
        loadingMessage: "Updating budget item...",
        successMessage: "Budget item updated successfully",
        errorMessage: "Failed to update budget item",
      }
    );
  };

  const handleDelete = async (id: string) => {
    return await withMutationHandling(
      () => moveToTrash({
        id: id as Id<"budgetItems">,
        reason: "Moved to trash via dashboard",
      }),
      {
        loadingMessage: "Moving to trash...",
        successMessage: "Item moved to trash",
        errorMessage: "Failed to move item to trash",
      }
    );
  };

  return {
    handleAdd,
    handleEdit,
    handleDelete,
  };
}