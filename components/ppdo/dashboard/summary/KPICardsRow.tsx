// components/ppdo/dashboard/summary/KPICardsRow.tsx
"use client";

interface KPICardsRowProps {
  totalProjects: number;
  ongoing: number;
  completed: number;
  delayed: number;
  accentColor?: string;
}

export function KPICardsRow({
  totalProjects,
  ongoing,
  completed,
  delayed,
  accentColor = "#15803D",
}: KPICardsRowProps) {
  const kpiCards = [
    {
      label: "Total Projects",
      value: totalProjects,
      color: "text-zinc-900 dark:text-zinc-50",
    },
    {
      label: "Ongoing",
      value: ongoing,
      color: "text-blue-600 dark:text-blue-500",
    },
    {
      label: "Completed",
      value: completed,
      color: "text-emerald-600 dark:text-emerald-500",
    },
    {
      label: "Delayed",
      value: delayed,
      color: "text-red-600 dark:text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpiCards.map((card) => (
        <div
          key={card.label}
          className="group bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 uppercase font-semibold tracking-wide mb-2">
            {card.label}
          </p>
          <p className={`text-3xl sm:text-4xl font-bold ${card.color}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
