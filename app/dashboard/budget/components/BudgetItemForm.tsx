// app/dashboard/budget/components/BudgetItemForm.tsx

"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAccentColor } from "../../contexts/AccentColorContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BudgetItem {
  id: string;
  particular: string;
  totalBudgetAllocated: number;
  totalBudgetUtilized: number;
  utilizationRate: number;
  projectCompleted: number;
  projectDelayed: number;
  projectsOnTrack: number;
}

const BUDGET_PARTICULARS = [
  "GAD",
  "LDRRMP",
  "LCCAP",
  "LCPC",
  "SCPD",
  "POPS",
  "CAIDS",
  "LNP",
  "PID",
  "ACDP",
  "LYDP",
  "20% DF",
] as const;

const FORM_STORAGE_KEY = "budget_item_form_draft";

// Custom validation for no whitespace
const noWhitespaceString = z
  .string()
  .min(1, { message: "This field is required." })
  .refine((val) => val.trim().length > 0, {
    message: "Whitespace only is not allowed.",
  })
  .refine((val) => val === val.trim(), {
    message: "Leading or trailing whitespace is not allowed.",
  })
  .refine((val) => !/\s/.test(val), {
    message: "Whitespace is not allowed.",
  });

// Define the form schema with Zod
const budgetItemSchema = z.object({
  particular: noWhitespaceString,
  totalBudgetAllocated: z.number().min(0, {
    message: "Must be 0 or greater.",
  }),
  totalBudgetUtilized: z.number().min(0, {
    message: "Must be 0 or greater.",
  }),
  projectCompleted: z.number().min(0, {
    message: "Must be 0 or greater.",
  }).max(100, {
    message: "Must be 100 or less.",
  }),
  projectDelayed: z.number().min(0, {
    message: "Must be 0 or greater.",
  }).max(100, {
    message: "Must be 100 or less.",
  }),
  projectsOnTrack: z.number().min(0, {
    message: "Must be 0 or greater.",
  }).max(100, {
    message: "Must be 100 or less.",
  }),
}).refine(
  (data) => {
    const total = data.projectCompleted + data.projectDelayed + data.projectsOnTrack;
    return total <= 100;
  },
  {
    message: "Total project percentages cannot exceed 100%.",
    path: ["projectsOnTrack"], // Show error on the last field
  }
);

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

interface BudgetItemFormProps {
  item?: BudgetItem | null;
  onSave: (item: Omit<BudgetItem, "id" | "utilizationRate">) => void;
  onCancel: () => void;
}

export function BudgetItemForm({
  item,
  onSave,
  onCancel,
}: BudgetItemFormProps) {
  const { accentColorValue } = useAccentColor();

  // Load saved draft from localStorage (only for new items)
  const getSavedDraft = () => {
    if (item) return null; // Don't load draft when editing
    
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading form draft:", error);
    }
    return null;
  };

  const savedDraft = getSavedDraft();

  // Define the form
  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: savedDraft || {
      particular: item?.particular || "",
      totalBudgetAllocated: item?.totalBudgetAllocated || 0,
      totalBudgetUtilized: item?.totalBudgetUtilized || 0,
      projectCompleted: item?.projectCompleted || 0,
      projectDelayed: item?.projectDelayed || 0,
      projectsOnTrack: item?.projectsOnTrack || 0,
    },
  });

  // Watch all form values for auto-save
  const formValues = form.watch();

  // Auto-save draft to localStorage (only for new items)
  useEffect(() => {
    if (!item) { // Only save draft when creating new item
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues));
        } catch (error) {
          console.error("Error saving form draft:", error);
        }
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timer);
    }
  }, [formValues, item]);

  // Watch values for utilization rate calculation
  const totalBudgetAllocated = form.watch("totalBudgetAllocated");
  const totalBudgetUtilized = form.watch("totalBudgetUtilized");

  // Calculate utilization rate for preview
  const utilizationRate =
    totalBudgetAllocated > 0
      ? (totalBudgetUtilized / totalBudgetAllocated) * 100
      : 0;

  // Define submit handler
  function onSubmit(values: BudgetItemFormValues) {
    // Clear draft on successful submit
    if (!item) {
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form draft:", error);
      }
    }
    onSave(values);
  }

  // Handle cancel - clear draft if creating new item
  const handleCancel = () => {
    if (!item) {
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form draft:", error);
      }
    }
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Particular Field */}
        <FormField
          name="particular"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Particular
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!item}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <SelectValue placeholder="Select Particular" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BUDGET_PARTICULARS.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {item && (
                <FormDescription className="text-zinc-500 dark:text-zinc-400">
                  Particular cannot be changed after creation
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Budget Allocated */}
          <FormField
            name="totalBudgetAllocated"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Total Budget Allocated
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                    onBlur={(e) => {
                      e.target.value = e.target.value.trim();
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total Budget Utilized */}
          <FormField
            name="totalBudgetUtilized"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Total Budget Utilized
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                    onBlur={(e) => {
                      e.target.value = e.target.value.trim();
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Utilization Rate Preview */}
        {totalBudgetAllocated > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Utilization Rate (calculated):
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: accentColorValue }}
              >
                {utilizationRate.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Project Status Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Project Completed */}
          <FormField
            name="projectCompleted"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Project Completed (%)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                    onBlur={(e) => {
                      e.target.value = e.target.value.trim();
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project Delayed */}
          <FormField
            name="projectDelayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Project Delayed (%)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                    onBlur={(e) => {
                      e.target.value = e.target.value.trim();
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Projects On Track */}
          <FormField
            name="projectsOnTrack"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Projects On Track (%)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                    onBlur={(e) => {
                      e.target.value = e.target.value.trim();
                      field.onBlur();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            className="text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="text-white"
            style={{ backgroundColor: accentColorValue }}
          >
            {item ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}