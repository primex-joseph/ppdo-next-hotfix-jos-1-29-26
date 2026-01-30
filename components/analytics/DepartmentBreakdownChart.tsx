"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { DashboardChartCard } from "@/components/ppdo/dashboard/charts/DashboardChartCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DepartmentBreakdownChartProps {
    data: any[];
    officeData?: any[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export function DepartmentBreakdownChart({ data, officeData = [] }: DepartmentBreakdownChartProps) {
    const [activeTab, setActiveTab] = useState("office");

    const currentData = activeTab === "department" ? data : officeData;

    // Prepare data for the pie chart
    const chartData = currentData.map((item) => ({
        name: item.code || item.name,
        fullName: item.name,
        value: item.allocated,
    })).filter(item => item.value > 0).slice(0, 10); // Ensure top 10

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            notation: "compact",
            maximumFractionDigits: 2
        }).format(value);

    // Custom label for permanent percentages
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill="#71717a"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-[10px] font-black"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <DashboardChartCard
            title="Allocation Breakdown"
            subtitle={`Budget distribution by top ${activeTab === "department" ? "departments" : "offices"}`}
            height={440}
        >
            <div className="flex justify-between items-start mb-6">
                <div />
                <div className="flex items-center space-x-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2 h-9 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 p-1">
                            <TabsTrigger value="office" className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Office</TabsTrigger>
                            <TabsTrigger value="department" className="text-xs font-bold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Department</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="h-[320px]"
            >
                <div className="flex flex-col sm:flex-row items-center h-full gap-8">
                    {/* Donut Chart */}
                    <div className="relative flex-shrink-0" style={{ width: 220, height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            className="focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                                        borderRadius: "12px",
                                        border: "1px solid #e4e4e7",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                        fontSize: "12px",
                                        backdropFilter: "blur(4px)"
                                    }}
                                    itemStyle={{ color: "#18181b", fontWeight: 700 }}
                                    formatter={(value: any) => formatCurrency(Number(value))}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-black">Top {chartData.length}</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                                Allocated
                            </span>
                        </div>
                    </div>

                    {/* Enhanced Legend */}
                    <div className="flex-1 w-full grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                        {chartData.map((item, idx) => {
                            const totalVal = chartData.reduce((acc, curr) => acc + curr.value, 0);
                            const percentage = totalVal > 0 ? (item.value / totalVal) * 100 : 0;

                            return (
                                <div key={idx} className="flex items-center group p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div
                                        className="w-1.5 h-6 rounded-full mr-3 flex-shrink-0 transition-all group-hover:h-8"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider truncate mr-2" title={item.fullName}>
                                                {item.name}
                                            </span>
                                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                                                {formatCurrency(item.value)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full rounded-full"
                                                style={{
                                                    backgroundColor: COLORS[idx % COLORS.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </DashboardChartCard>
    );
}
