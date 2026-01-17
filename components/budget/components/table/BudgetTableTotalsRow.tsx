// app/dashboard/project/budget/components/table/BudgetTableTotalsRow.tsx

"use client";

import { BudgetTotals } from "@/app/dashboard/project/budget/types";
import { getUtilizationColor } from "@/app/dashboard/project/budget/utils";

interface BudgetTableTotalsRowProps {
  totals: BudgetTotals;
  totalUtilizationRate: number;
}

export function BudgetTableTotalsRow({
  totals,
  totalUtilizationRate,
}: BudgetTableTotalsRowProps) {
  return (
    <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-semibold">
      <td></td>
      <td className="px-4 sm:px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
        TOTAL
      </td>
      <td className="px-4 sm:px-6 py-4"></td>
      <td className="px-4 sm:px-6 py-4"></td>
      <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
        ₱{totals.totalBudgetAllocated.toLocaleString()}
      </td>
      <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
        ₱{totals.obligatedBudget.toLocaleString()}
      </td>
      <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
        ₱{totals.totalBudgetUtilized.toLocaleString()}
      </td>
      <td className="px-4 sm:px-6 py-4 text-right">
        <span
          className={`text-sm font-semibold ${getUtilizationColor(
            totalUtilizationRate
          )}`}
        >
          {totalUtilizationRate.toFixed(1)}%
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
        {Math.round(totals.projectCompleted)}
      </td>
      <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
        {Math.round(totals.projectDelayed)}
      </td>
      <td className="px-4 sm:px-6 py-4 text-right text-sm text-zinc-900 dark:text-zinc-100">
        {Math.round(totals.projectsOnTrack)}
      </td>
    </tr>
  );
}