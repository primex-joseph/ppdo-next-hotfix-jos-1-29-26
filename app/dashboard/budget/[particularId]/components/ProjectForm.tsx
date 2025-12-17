// app/dashboard/budget/[particularId]/components/ProjectForm.tsx

"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAccentColor } from "../../../contexts/AccentColorContext";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calculator, AlertCircle } from "lucide-react";
import { Project } from "../../types";

const FORM_STORAGE_KEY = "project_form_draft";

// Define the form schema with Zod
const projectSchema = z
  .object({
    projectName: z
      .string()
      .min(1, { message: "Project name is required." })
      .max(200, { message: "Project name is too long." }),
    implementingOffice: z.string().min(1, { message: "Implementing office is required." }),
    allocatedBudget: z.number().min(0, { message: "Must be 0 or greater." }),
    revisedBudget: z.number().min(0, { message: "Must be 0 or greater." }),
    totalBudgetUtilized: z.number().min(0, { message: "Must be 0 or greater." }),
    dateStarted: z.string().min(1, { message: "Date started is required." }),
    completionDate: z.string().optional(),
    projectAccomplishment: z
      .number()
      .min(0, { message: "Must be 0 or greater." })
      .max(100, { message: "Must be 100 or less." }),
    status: z.enum(["on_track", "delayed", "completed", "cancelled", "on_hold"]),
    remarks: z.string().optional(),
  })
  .refine((data) => data.totalBudgetUtilized <= (data.revisedBudget || data.allocatedBudget), {
    message: "Budget utilized cannot exceed revised budget.",
    path: ["totalBudgetUtilized"],
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: Omit<Project, "id">) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const { accentColorValue } = useAccentColor();
  
  // Fetch departments from backend
  const departments = useQuery(api.departments.list, { includeInactive: false });

  // Load saved draft from localStorage (only for new projects)
  const getSavedDraft = () => {
    if (project) return null;

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
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: savedDraft || {
      projectName: project?.projectName || "",
      implementingOffice: project?.implementingOffice || "",
      allocatedBudget: project?.allocatedBudget || 0,
      revisedBudget: project?.revisedBudget || 0,
      totalBudgetUtilized: project?.totalBudgetUtilized || 0,
      dateStarted: project?.dateStarted || "",
      completionDate: project?.completionDate || "",
      projectAccomplishment: project?.projectAccomplishment || 0,
      status: project?.status || "on_track",
      remarks: project?.remarks || "",
    },
  });

  // Watch all form values for auto-save
  const formValues = form.watch();

  // Auto-save draft to localStorage (only for new projects)
  useEffect(() => {
    if (!project) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formValues));
        } catch (error) {
          console.error("Error saving form draft:", error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formValues, project]);

  // Watch values for utilization rate calculation
  const allocatedBudget = form.watch("allocatedBudget");
  const revisedBudget = form.watch("revisedBudget");
  const totalBudgetUtilized = form.watch("totalBudgetUtilized");

  // Calculate utilization rate and balance for preview
  const effectiveBudget = revisedBudget || allocatedBudget;
  const utilizationRate = effectiveBudget > 0 ? (totalBudgetUtilized / effectiveBudget) * 100 : 0;
  const balance = effectiveBudget - totalBudgetUtilized;

  // Check if budget is exceeded
  const isBudgetExceeded = totalBudgetUtilized > effectiveBudget;

  // Get color based on utilization rate
  const getUtilizationColor = () => {
    if (utilizationRate > 100) return "text-red-600 dark:text-red-400 font-bold";
    if (utilizationRate >= 80) return "text-red-600 dark:text-red-400";
    if (utilizationRate >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  // Define submit handler
  function onSubmit(values: ProjectFormValues) {
    // Calculate final values
    const effectiveBudget = values.revisedBudget || values.allocatedBudget;
    const utilizationRate = effectiveBudget > 0 ? (values.totalBudgetUtilized / effectiveBudget) * 100 : 0;
    const balance = effectiveBudget - values.totalBudgetUtilized;

    const projectData = {
      ...values,
      utilizationRate,
      balance,
      completionDate: values.completionDate || "",
      remarks: values.remarks || "",
    };

    // Clear draft on successful submit
    if (!project) {
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing form draft:", error);
      }
    }

    onSave(projectData);
  }

  // Handle cancel
  const handleCancel = () => {
    if (!project) {
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
        {/* Project Name */}
        <FormField
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Project Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter project name"
                  className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Implementing Office */}
        <FormField
          name="implementingOffice"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Implementing Office
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={departments === undefined}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    <SelectValue placeholder={departments === undefined ? "Loading departments..." : "Select implementing office"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments && departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept.name}>
                        {dept.name} {dept.code ? `(${dept.code})` : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No departments available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription className="text-zinc-500 dark:text-zinc-400">
                Select the department responsible for this project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Allocated Budget */}
          <FormField
            name="allocatedBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Allocated Budget
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Revised Budget */}
          <FormField
            name="revisedBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Revised Budget
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
                  />
                </FormControl>
                <FormDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Leave as 0 to use allocated budget
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Budget Utilized */}
          <FormField
            name="totalBudgetUtilized"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Budget Utilized
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                      isBudgetExceeded
                        ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Started */}
          <FormField
            name="dateStarted"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Date Started
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Completion Date */}
          <FormField
            name="completionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Completion Date <span className="text-xs text-zinc-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Project Status */}
          <FormField
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Project Status
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="on_track">On Track</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Budget Exceeded Warning */}
        {isBudgetExceeded && effectiveBudget > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Budget Exceeded
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                Budget utilized (₱{totalBudgetUtilized.toFixed(2)}) cannot exceed revised budget (₱
                {effectiveBudget.toFixed(2)})
              </p>
            </div>
          </div>
        )}

        {/* Utilization Rate Preview */}
        {effectiveBudget > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Calculated Values:
              </span>
            </div>
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Utilization Rate
                </label>
                <div className={`text-sm font-semibold ${getUtilizationColor()}`}>
                  {utilizationRate.toFixed(2)}%
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Balance
                </label>
                <div className="text-sm font-semibold" style={{ color: accentColorValue }}>
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(balance)}
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="formula" className="border-none">
                <AccordionTrigger className="px-4 pb-3 pt-0 hover:no-underline">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>How is this calculated?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                        The utilization rate shows how much of your budget you've used.
                      </p>
                      <div className="bg-white dark:bg-zinc-900 rounded p-2.5 font-mono text-xs border border-zinc-200 dark:border-zinc-700">
                        (Budget Utilized ÷ Effective Budget) × 100
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
                        Your calculation:
                      </p>
                      <div className="bg-white dark:bg-zinc-900 rounded p-2.5 font-mono text-xs border border-zinc-200 dark:border-zinc-700">
                        (₱{totalBudgetUtilized.toFixed(2)} ÷ ₱{effectiveBudget.toFixed(2)}) × 100 ={" "}
                        {utilizationRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
                        Balance:
                      </p>
                      <div className="bg-white dark:bg-zinc-900 rounded p-2.5 font-mono text-xs border border-zinc-200 dark:border-zinc-700">
                        ₱{effectiveBudget.toFixed(2)} - ₱{totalBudgetUtilized.toFixed(2)} = ₱
                        {balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Project Accomplishment */}
        <FormField
          name="projectAccomplishment"
          render={({ field }) => {
            const value = field.value;
            const isInvalid = value < 0 || value > 100;

            return (
              <FormItem>
                <FormLabel className="text-zinc-700 dark:text-zinc-300">
                  Project Accomplishment (%)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    className={`bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${
                      isInvalid
                        ? "border-red-500 dark:border-red-500 focus-visible:ring-red-500"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      field.onChange(parseFloat(value) || 0);
                    }}
                  />
                </FormControl>
                {isInvalid && (
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Must be between 0 and 100
                  </p>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Remarks */}
        <FormField
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-700 dark:text-zinc-300">
                Remarks <span className="text-xs text-zinc-500">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes or remarks..."
                  rows={3}
                  className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            disabled={departments === undefined}
          >
            {project ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}