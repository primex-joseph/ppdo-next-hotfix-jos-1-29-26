// app/dashboard/budget/[particularId]/components/ProjectForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useAccentColor } from "../../../contexts/AccentColorContext";

import { Project } from "../../types";

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: Omit<Project, "id">) => void;
  onCancel: () => void;
}

export function ProjectForm({
  project,
  onSave,
  onCancel,
}: ProjectFormProps) {
  const { accentColorValue } = useAccentColor();
  const [formData, setFormData] = useState<Omit<Project, "id">>({
    projectName: project?.projectName || "",
    implementingOffice: project?.implementingOffice || "",
    allocatedBudget: project?.allocatedBudget || 0,
    dateStarted: project?.dateStarted || "",
    completionDate: project?.completionDate || "",
    revisedBudget: project?.revisedBudget || 0,
    totalBudgetUtilized: project?.totalBudgetUtilized || 0,
    utilizationRate: project?.utilizationRate || 0,
    balance: project?.balance || 0,
    projectAccomplishment: project?.projectAccomplishment || 0,
    status: project?.status || "on_track",
    remarks: project?.remarks || "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.projectName,
        implementingOffice: project.implementingOffice,
        allocatedBudget: project.allocatedBudget,
        dateStarted: project.dateStarted,
        completionDate: project.completionDate,
        revisedBudget: project.revisedBudget,
        totalBudgetUtilized: project.totalBudgetUtilized,
        utilizationRate: project.utilizationRate,
        balance: project.balance,
        projectAccomplishment: project.projectAccomplishment,
        status: project.status || "on_track",
        remarks: project.remarks,
      });
    }
  }, [project]);

  // Auto-calculate utilization rate and balance when budget values change
  useEffect(() => {
    const effectiveBudget = formData.revisedBudget || formData.allocatedBudget;
    const utilizationRate = effectiveBudget > 0 
      ? (formData.totalBudgetUtilized / effectiveBudget) * 100 
      : 0;
    const balance = effectiveBudget - formData.totalBudgetUtilized;

    setFormData(prev => ({
      ...prev,
      utilizationRate,
      balance,
    }));
  }, [formData.allocatedBudget, formData.revisedBudget, formData.totalBudgetUtilized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) =>
            setFormData({ ...formData, projectName: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Implementing Office
        </label>
        <input
          type="text"
          value={formData.implementingOffice}
          onChange={(e) =>
            setFormData({ ...formData, implementingOffice: e.target.value })
          }
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Allocated Budget
          </label>
          <input
            type="number"
            value={formData.allocatedBudget}
            onChange={(e) =>
              setFormData({
                ...formData,
                allocatedBudget: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Revised Budget
          </label>
          <input
            type="number"
            value={formData.revisedBudget}
            onChange={(e) =>
              setFormData({
                ...formData,
                revisedBudget: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Budget Utilized
          </label>
          <input
            type="number"
            value={formData.totalBudgetUtilized}
            onChange={(e) =>
              setFormData({
                ...formData,
                totalBudgetUtilized: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Date Started
          </label>
          <input
            type="date"
            value={formData.dateStarted}
            onChange={(e) =>
              setFormData({ ...formData, dateStarted: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Completion Date
          </label>
          <input
            type="date"
            value={formData.completionDate}
            onChange={(e) =>
              setFormData({ ...formData, completionDate: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Project Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                status: e.target.value as Project["status"]
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
          >
            <option value="on_track">On Track</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Auto-calculated fields - Display only */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Calculated Values
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Utilization Rate
            </label>
            <div
              className="text-sm font-semibold"
              style={{ color: accentColorValue }}
            >
              {formData.utilizationRate.toFixed(2)}%
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Balance
            </label>
            <div
              className="text-sm font-semibold"
              style={{ color: accentColorValue }}
            >
              {new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(formData.balance)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Project Accomplishment (%)
        </label>
        <input
          type="number"
          value={formData.projectAccomplishment}
          onChange={(e) =>
            setFormData({
              ...formData,
              projectAccomplishment: parseFloat(e.target.value) || 0,
            })
          }
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
          required
          min="0"
          max="100"
          step="0.1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Remarks
        </label>
        <textarea
          value={formData.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-0"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md text-white"
          style={{ backgroundColor: accentColorValue }}
        >
          {project ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}