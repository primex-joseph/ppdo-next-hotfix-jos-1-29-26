"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Project } from "../../types";
import { useAccentColor } from "../../../contexts/AccentColorContext";
import { Modal } from "../../components/Modal";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { ProjectForm } from "./ProjectForm";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pin,
  PinOff,
  Edit,
  Trash2,
  Filter,
  X,
  FileText,
  History,
  FolderOpen,
  Printer,
  MoreHorizontal,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ActivityLogSheet } from "@/app/dashboard/components/ActivityLogSheet";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjectCategoryCombobox } from "./ProjectCategoryCombobox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Shadcn Navigation Menu Imports
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface ProjectsTableProps {
  projects: Project[];
  particularId: string;
  budgetItemId?: string;
  onAdd?: (project: Omit<Project, "id" | "utilizationRate" | "projectCompleted" | "projectDelayed" | "projectsOngoing">) => void;
  onEdit?: (id: string, project: Omit<Project, "id" | "utilizationRate" | "projectCompleted" | "projectDelayed" | "projectsOngoing">) => void;
  onDelete?: (id: string) => void;
  onOpenTrash?: () => void;
}

type SortDirection = "asc" | "desc" | null;
type SortField = keyof Project | null;

export function ProjectsTable({
  projects,
  particularId,
  budgetItemId,
  onAdd,
  onEdit,
  onDelete,
  onOpenTrash,
}: ProjectsTableProps) {
  const { accentColorValue } = useAccentColor();
  const router = useRouter();
  
  // Queries & Mutations
  const currentUser = useQuery(api.users.current);
  const togglePinProject = useMutation(api.projects.togglePin);
  const allCategories = useQuery(api.projectCategories.list, {});
  
  const bulkMoveToTrash = useMutation(api.projects.bulkMoveToTrash);
  const bulkUpdateCategory = useMutation(api.projects.bulkUpdateCategory);
  const updateProject = useMutation(api.projects.update);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Bulk & Context Category Modal States
  const [showBulkCategoryConfirmModal, setShowBulkCategoryConfirmModal] = useState(false);
  const [pendingBulkCategoryId, setPendingBulkCategoryId] = useState<Id<"projectCategories"> | undefined>(undefined);
  
  const [showSingleCategoryModal, setShowSingleCategoryModal] = useState(false);
  const [selectedCategoryProject, setSelectedCategoryProject] = useState<Project | null>(null);
  const [singleCategoryId, setSingleCategoryId] = useState<Id<"projectCategories"> | undefined>(undefined);

  // Selection & Data States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [officeFilter, setOfficeFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<number[]>([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  
  // UI States
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; project: Project } | null>(null);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [selectedLogProject, setSelectedLogProject] = useState<Project | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---

  const canManageBulkActions = useMemo(() => {
    return currentUser?.role === "admin" || currentUser?.role === "super_admin";
  }, [currentUser]);

  const getCategoryHeaderStyle = (category?: any) => {
    if (category?.colorCode) {
      return { backgroundColor: category.colorCode, color: "white" };
    }
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
    const id = category?._id || "uncategorized";
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bg = id === "uncategorized" ? "#71717a" : colors[Math.abs(hash) % colors.length];
    return { backgroundColor: bg, color: "white" };
  };

  // --- Effects ---

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setActiveFilterColumn(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Filter & Sort Logic ---

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => {
        return (
          project.particulars.toLowerCase().includes(query) ||
          project.implementingOffice.toLowerCase().includes(query) ||
          project.status?.toLowerCase().includes(query)
        );
      });
    }
    
    if (statusFilter.length > 0) filtered = filtered.filter(p => p.status && statusFilter.includes(p.status));
    if (officeFilter.length > 0) filtered = filtered.filter(p => officeFilter.includes(p.implementingOffice));
    if (yearFilter.length > 0) filtered = filtered.filter(p => p.year && yearFilter.includes(p.year));

    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return filtered.sort((a, b) => {
      const aIsPinned = 'isPinned' in a ? (a as any).isPinned : false;
      const bIsPinned = 'isPinned' in b ? (b as any).isPinned : false;
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  }, [projects, searchQuery, statusFilter, officeFilter, yearFilter, sortField, sortDirection]);

  // --- Grouping Logic ---

  const groupedProjects = useMemo(() => {
    const groups: Record<string, { category: any, projects: Project[] }> = {};
    groups["uncategorized"] = { category: null, projects: [] };

    filteredAndSortedProjects.forEach(project => {
      if (project.categoryId) {
        if (!groups[project.categoryId]) {
          const cat = allCategories?.find(c => c._id === project.categoryId);
          groups[project.categoryId] = { category: cat, projects: [] };
        }
        groups[project.categoryId].projects.push(project);
      } else {
        groups["uncategorized"].projects.push(project);
      }
    });

    return Object.entries(groups)
      .filter(([_, group]) => group.projects.length > 0)
      .sort((a, b) => {
        if (a[0] === "uncategorized") return 1;
        if (b[0] === "uncategorized") return -1;
        const orderA = a[1].category?.displayOrder || 999;
        const orderB = b[1].category?.displayOrder || 999;
        return orderA - orderB;
      });
  }, [filteredAndSortedProjects, allCategories]);

  // --- Selection Logic ---

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAndSortedProjects.map(p => p.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected = filteredAndSortedProjects.length > 0 && selectedIds.size === filteredAndSortedProjects.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredAndSortedProjects.length;

  // --- Bulk Actions ---

  const handleBulkTrash = async () => {
    try {
      await bulkMoveToTrash({ ids: Array.from(selectedIds) as Id<"projects">[] });
      toast.success(`${selectedIds.size} projects moved to trash`);
      setSelectedIds(new Set());
    } catch (error) {
      toast.error("Failed to move projects to trash");
    }
  };

  const handleBulkCategoryChange = (categoryId: Id<"projectCategories"> | undefined) => {
    if (!categoryId) return;
    setPendingBulkCategoryId(categoryId);
    setShowBulkCategoryConfirmModal(true);
  };

  const confirmBulkCategoryUpdate = async () => {
    if (!pendingBulkCategoryId) return;
    try {
      await bulkUpdateCategory({
        ids: Array.from(selectedIds) as Id<"projects">[],
        categoryId: pendingBulkCategoryId
      });
      toast.success(`Category updated for ${selectedIds.size} projects`);
      setSelectedIds(new Set());
      setPendingBulkCategoryId(undefined);
      setShowBulkCategoryConfirmModal(false);
    } catch (error) {
      toast.error("Failed to update categories.");
      setShowBulkCategoryConfirmModal(false);
    }
  };

  // --- Standard Actions ---

  const handleContextChangeCategory = (project: Project) => {
    setSelectedCategoryProject(project);
    setSingleCategoryId(project.categoryId as Id<"projectCategories"> | undefined);
    setShowSingleCategoryModal(true);
    setContextMenu(null);
  };

  const saveSingleCategoryChange = async () => {
    if (!selectedCategoryProject) return;
    try {
        await updateProject({
            id: selectedCategoryProject.id as Id<"projects">,
            categoryId: singleCategoryId,
            particulars: selectedCategoryProject.particulars,
            implementingOffice: selectedCategoryProject.implementingOffice,
            totalBudgetAllocated: selectedCategoryProject.totalBudgetAllocated,
            totalBudgetUtilized: selectedCategoryProject.totalBudgetUtilized,
            budgetItemId: selectedCategoryProject.budgetItemId as Id<"budgetItems">,
            remarks: selectedCategoryProject.remarks,
            year: selectedCategoryProject.year,
            projectManagerId: selectedCategoryProject.projectManagerId as Id<"users">,
            reason: "Category updated via context menu"
        });
        toast.success(`Category updated`);
        setShowSingleCategoryModal(false);
        setSelectedCategoryProject(null);
    } catch (error) {
        toast.error("Failed to update project category.");
    }
  };

  const handleRowClick = (project: Project, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='checkbox']") || (e.target as HTMLElement).closest(".no-click")) return;
    const projectSlug = `${project.particulars.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${project.id}`;
    router.push(`/dashboard/budget/${encodeURIComponent(particularId)}/${projectSlug}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
      if (sortDirection === "desc") setSortField(null);
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // --- Formatting Helpers ---
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0 }).format(amount);
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
    return sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
  };
  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return "text-red-600 dark:text-red-400";
    if (rate >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };
  const getStatusColor = (status?: string) => {
    if (!status) return "text-zinc-600 dark:text-zinc-400";
    if (status === "completed") return "text-green-600 dark:text-green-400";
    if (status === "ongoing") return "text-blue-600 dark:text-blue-400";
    if (status === "delayed") return "text-red-600 dark:text-red-400";
    return "text-zinc-600 dark:text-zinc-400";
  };

  // Calculate totals
  const totals = filteredAndSortedProjects.reduce(
    (acc, project) => ({
      totalBudgetAllocated: acc.totalBudgetAllocated + project.totalBudgetAllocated,
      obligatedBudget: acc.obligatedBudget + (project.obligatedBudget || 0),
      totalBudgetUtilized: acc.totalBudgetUtilized + project.totalBudgetUtilized,
      utilizationRate: acc.utilizationRate + project.utilizationRate / (filteredAndSortedProjects.length || 1),
      projectCompleted: acc.projectCompleted + project.projectCompleted,
      projectDelayed: acc.projectDelayed + (project.projectDelayed || 0),
      projectsOngoing: acc.projectsOngoing + project.projectsOngoing,
    }),
    { totalBudgetAllocated: 0, obligatedBudget: 0, totalBudgetUtilized: 0, 
      utilizationRate: 0, projectCompleted: 0, projectDelayed: 0, projectsOngoing: 0 }
  );

  return (
    <>
      <div className="print-area bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-visible transition-all duration-300 shadow-sm">
        
        {/* ========================================================= */}
        {/* MODERN TOOLBAR */}
        {/* ========================================================= */}
        <div className="h-16 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between no-print gap-4">
          
          {/* Left Side: Title OR Selection Context */}
          <div className="flex items-center gap-3 min-w-[200px]">
            {selectedIds.size > 0 ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 h-7">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {selectedIds.size} Selected
                    </Badge>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedIds(new Set())}
                        className="text-zinc-500 text-xs h-7 hover:text-zinc-900"
                    >
                        Clear
                    </Button>
                </div>
            ) : (
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Projects</h3>
            )}
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            
            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-9 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bulk Category Change - Only shown when items are selected */}
            {selectedIds.size > 0 && canManageBulkActions && (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-9 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 data-[state=open]:bg-blue-100 border border-blue-200 dark:border-blue-800">
                      <Layers className="w-4 h-4 mr-2" />
                      Move {selectedIds.size} to Category
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[300px] p-4 gap-4 flex flex-col bg-white dark:bg-zinc-950">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">
                            Selected Projects by Category
                          </h4>
                          
                          {/* Category Summary */}
                          <div className="space-y-2 text-xs">
                            {(() => {
                              const categoryCounts = new Map<string, { name: string; color?: string; count: number }>();
                              
                              Array.from(selectedIds).forEach(id => {
                                const project = projects.find(p => p.id === id);
                                if (project) {
                                  const catId = project.categoryId || "uncategorized";
                                  const existing = categoryCounts.get(catId);
                                  
                                  if (existing) {
                                    existing.count++;
                                  } else {
                                    const cat = allCategories?.find(c => c._id === catId);
                                    categoryCounts.set(catId, {
                                      name: cat?.fullName || "Uncategorized",
                                      color: cat?.colorCode,
                                      count: 1
                                    });
                                  }
                                }
                              });
                              
                              return Array.from(categoryCounts.entries()).map(([key, data]) => (
                                <div key={key} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                  {data.color && (
                                    <div 
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: data.color }}
                                    />
                                  )}
                                  <span>{data.count} selected in "{data.name}"</span>
                                </div>
                              ));
                            })()}
                          </div>
                          
                          <Separator className="my-2" />
                          
                          <p className="text-xs text-zinc-500">Select a new category to move all selected projects:</p>
                          <div className="no-click relative z-50"> 
                            <ProjectCategoryCombobox 
                              value={undefined}
                              onChange={(val) => handleBulkCategoryChange(val as Id<"projectCategories">)}
                              hideInfoText={true}
                            />
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Trash Button - Dynamic text based on selection */}
            <Button 
              onClick={selectedIds.size > 0 ? handleBulkTrash : onOpenTrash}
              variant={selectedIds.size > 0 ? "destructive" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {selectedIds.size > 0 ? `Move ${selectedIds.size} to Trash` : 'Recycle Bin'}
            </Button>

            {/* Print Button */}
            <Button 
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Add Project Button */}
            {onAdd && (
              <Button 
                onClick={() => setShowAddModal(true)} 
                size="sm"
                className="gap-2 text-white shadow-sm"
                style={{ backgroundColor: accentColorValue }}
              >
                <span className="text-lg leading-none mb-0.5">+</span> 
                Add Project
              </Button>
            )}
          </div>
        </div>
        
        {/* ========================================================= */}
        {/* END TOOLBAR */}
        {/* ========================================================= */}


        {/* TABLE */}
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                {/* Checkbox Column */}
                {canManageBulkActions && (
                    <th className="w-10 px-3 py-3 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-20">
                        <Checkbox 
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            className={isIndeterminate ? "opacity-50" : ""}
                        />
                    </th>
                )}
                
                <th className="px-3 py-3 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button onClick={() => handleSort("particulars")} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">Particulars <SortIcon field="particulars" /></button>
                </th>
                <th className="px-3 py-3 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button onClick={() => setActiveFilterColumn(activeFilterColumn === "office" ? null : "office")} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">Implementing Office <Filter className="w-3.5 h-3.5 opacity-50" /></button>
                </th>
                <th className="px-3 py-3 text-center sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button onClick={() => setActiveFilterColumn(activeFilterColumn === "year" ? null : "year")} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">Year <Filter className="w-3.5 h-3.5 opacity-50" /></button>
                </th>
                <th className="px-3 py-3 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10">
                    <button onClick={() => setActiveFilterColumn(activeFilterColumn === "status" ? null : "status")} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">Status <Filter className="w-3.5 h-3.5 opacity-50" /></button>
                </th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("totalBudgetAllocated")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Budget Allocated <SortIcon field="totalBudgetAllocated" /></button></th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("obligatedBudget")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Obligated Budget <SortIcon field="obligatedBudget" /></button></th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("totalBudgetUtilized")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Budget Utilized <SortIcon field="totalBudgetUtilized" /></button></th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("utilizationRate")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Utilization Rate (%) <SortIcon field="utilizationRate" /></button></th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("projectCompleted")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Completed <SortIcon field="projectCompleted" /></button></th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("projectDelayed")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Delayed <SortIcon field="projectDelayed" /></button></th>
                <th className="px-3 py-3 text-right sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10"><button onClick={() => handleSort("projectsOngoing")} className="flex items-center gap-2 ml-auto text-xs font-semibold uppercase tracking-wide">Ongoing <SortIcon field="projectsOngoing" /></button></th>
                <th className="px-3 py-3 text-left sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 text-xs font-semibold uppercase tracking-wide">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredAndSortedProjects.length === 0 ?
                (
                <tr><td colSpan={canManageBulkActions ? 13 : 12} className="px-4 py-12 text-center text-sm text-zinc-500">No projects found matching your criteria.</td></tr>
              ) : (
                <>
                   {groupedProjects.map(([key, group]) => (
                    <React.Fragment key={key}>
                        {/* Category Header Row */}
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-100 dark:border-zinc-800">
                           <td 
                             colSpan={canManageBulkActions ? 13 : 12} 
                             className="px-4 py-2 text-sm font-bold uppercase tracking-wider"
                             style={getCategoryHeaderStyle(group.category)}
                           >
                              {group.category ? group.category.fullName : "Uncategorized"} 
                               <span className="opacity-80 ml-2 font-normal normal-case">
                                ({group.projects.length} projects)
                              </span>
                           </td>
                        </tr>

                        {group.projects.map((project) => (
                            <tr
                            key={project.id}
                            onContextMenu={(e) => { e.preventDefault();
                            setContextMenu({ x: e.clientX, y: e.clientY, project }); }}
                            onClick={(e) => handleRowClick(project, e)}
                            className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${
                                'isPinned' in project && (project as any).isPinned ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                            } ${selectedIds.has(project.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                            >
                            {/* Checkbox Cell */}
                            {canManageBulkActions && (
                                <td className="px-3 py-3 text-center">
                                    <Checkbox 
                                        checked={selectedIds.has(project.id)}
                                        onCheckedChange={(checked) => handleSelectRow(project.id, checked as boolean)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                            )}
                            <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                {('isPinned' in project && (project as any).isPinned) && <Pin className="w-3.5 h-3.5 text-amber-600" />}
                                    <span className="text-sm font-medium">{project.particulars}</span>
                                </div>
                            </td>
                            <td className="px-3 py-3 text-sm text-zinc-600">{project.implementingOffice}</td>
                            <td className="px-3 py-3 text-sm text-center">{project.year || "-"}</td>
                            <td className="px-3 py-3 text-sm">
                                <span className={`font-medium ${getStatusColor(project.status)}`}>
                                {project.status ?
                                project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ') : '-'}
                                </span>
                            </td>
                            <td className="px-3 py-3 text-right text-sm font-medium">{formatCurrency(project.totalBudgetAllocated)}</td>
                            <td className="px-3 py-3 text-right text-sm">{project.obligatedBudget ? formatCurrency(project.obligatedBudget) : "-"}</td>
                            <td className="px-3 py-3 text-right text-sm font-medium">{formatCurrency(project.totalBudgetUtilized)}</td>
                            <td className="px-3 py-3 text-right text-sm font-semibold">
                                <span className={getUtilizationColor(project.utilizationRate)}>{formatPercentage(project.utilizationRate)}</span>
                            </td>
                            <td className="px-3 py-3 text-right text-sm"><span className={project.projectCompleted >= 80 ? "text-green-600" : "text-zinc-600"}>{Math.round(project.projectCompleted)}</span></td>
                            <td className="px-3 py-3 text-right text-sm">{Math.round(project.projectDelayed)}</td>
                            <td className="px-3 py-3 text-right text-sm">{Math.round(project.projectsOngoing)}</td>
                            <td className="px-3 py-3 text-sm text-zinc-500 truncate max-w-[150px]">{project.remarks || "-"}</td>
                            </tr>
                        ))}
                    </React.Fragment>
                  ))}

                  {/* Totals Row */}
                  <tr className="border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 font-semibold sticky bottom-0 z-10">
                    {canManageBulkActions && <td></td>}
                    <td className="px-3 py-3" colSpan={4}><span className="text-sm text-zinc-900">TOTAL</span></td>
                    <td className="px-3 py-3 text-right text-sm" style={{ color: accentColorValue }}>{formatCurrency(totals.totalBudgetAllocated)}</td>
                    <td className="px-3 py-3 text-right text-sm" style={{ color: accentColorValue }}>{formatCurrency(totals.obligatedBudget)}</td>
                    <td className="px-3 py-3 text-right text-sm" style={{ color: accentColorValue }}>{formatCurrency(totals.totalBudgetUtilized)}</td>
                    <td className="px-3 py-3 text-right text-sm"><span className={getUtilizationColor(totals.utilizationRate)}>{formatPercentage(totals.utilizationRate)}</span></td>
                    <td className="px-3 py-3 text-right text-sm" style={{ color: accentColorValue }}>{Math.round(totals.projectCompleted)}</td>
                    <td className="px-3 py-3 text-right text-sm" style={{ color: accentColorValue }}>{totals.projectDelayed}</td>
                    <td className="px-3 py-3 text-right text-sm" style={{ color: accentColorValue }}>{Math.round(totals.projectsOngoing)}</td>
                    <td className="px-3 py-3 text-sm text-zinc-400 text-center">-</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div ref={contextMenuRef} className="fixed bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 py-1 z-50 min-w-[180px]" style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}>
          <button onClick={() => { togglePinProject({ id: contextMenu.project.id as Id<"projects"> }); setContextMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 flex items-center gap-3">
            {('isPinned' in contextMenu.project && (contextMenu.project as any).isPinned) ? <><PinOff className="w-4 h-4" />Unpin</> : <><Pin className="w-4 h-4" />Pin to top</>}
          </button>
          <button onClick={() => { setSelectedLogProject(contextMenu.project); setLogSheetOpen(true); setContextMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
            <History className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /> Activity Log
          </button>
          <button onClick={() => handleContextChangeCategory(contextMenu.project)} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
            <FolderOpen className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /> Move to Category
          </button>
          {onEdit && <button onClick={() => { setSelectedProject(contextMenu.project); setShowEditModal(true); setContextMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 flex items-center gap-3"><Edit className="w-4 h-4" />Edit</button>}
          {onDelete && (
            <button onClick={() => { setSelectedProject(contextMenu.project); setShowDeleteModal(true); setContextMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-red-600 dark:text-red-400 whitespace-nowrap">
              <Trash2 className="w-4 h-4" /> Move to Trash
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedLogProject && (
        <ActivityLogSheet type="project" entityId={selectedLogProject.id} title={`Project History: ${selectedLogProject.particulars}`} isOpen={logSheetOpen} onOpenChange={(open) => { setLogSheetOpen(open); if (!open) setSelectedLogProject(null); }} />
      )}
      {showAddModal && <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Project" size="xl"><ProjectForm budgetItemId={budgetItemId} onSave={(d) => { if (onAdd) onAdd(d); setShowAddModal(false); }} onCancel={() => setShowAddModal(false)} /></Modal>}
      {showEditModal && selectedProject && <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedProject(null); }} title="Edit Project" size="xl"><ProjectForm project={selectedProject} budgetItemId={budgetItemId} onSave={(d) => { if (onEdit) onEdit(selectedProject.id, d); setShowEditModal(false); setSelectedProject(null); }} onCancel={() => { setShowEditModal(false); setSelectedProject(null); }} /></Modal>}
      {showDeleteModal && selectedProject && <ConfirmationModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedProject(null); }} onConfirm={() => { if (onDelete) onDelete(selectedProject.id); setSelectedProject(null); }} title="Move to Trash" message={`Are you sure you want to move "${selectedProject.particulars}" to trash? Associated breakdowns will also be moved.`} confirmText="Move to Trash" variant="danger" />}
      
      {/* 🆕 Bulk Category Confirmation Modal */}
      {showBulkCategoryConfirmModal && pendingBulkCategoryId && (
        <ConfirmationModal
            isOpen={showBulkCategoryConfirmModal}
            onClose={() => { setShowBulkCategoryConfirmModal(false); setPendingBulkCategoryId(undefined); }}
            onConfirm={confirmBulkCategoryUpdate}
            title="Confirm Bulk Category Update"
            message={`Are you sure you want to move ${selectedIds.size} selected projects to this category? This will update their classification.`}
            confirmText="Yes, Update Projects"
            variant="default"
        />
      )}

      {/* 🆕 Single Category Change Modal */}
      {showSingleCategoryModal && selectedCategoryProject && (
         <Modal 
            isOpen={showSingleCategoryModal} 
            onClose={() => { setShowSingleCategoryModal(false); setSelectedCategoryProject(null); }} 
            title="Move Project to Category"
            size="sm"
         >
            <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <p className="text-sm font-medium">{selectedCategoryProject.particulars}</p>
                    <p className="text-xs text-zinc-500 mt-1">Current Category: {selectedCategoryProject.categoryId ? allCategories?.find(c => c._id === selectedCategoryProject.categoryId)?.fullName : "Uncategorized"}</p>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select New Category</label>
                    <ProjectCategoryCombobox
                        value={singleCategoryId}
                        onChange={(val) => setSingleCategoryId(val)}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={() => setShowSingleCategoryModal(false)}>Cancel</Button>
                    <Button onClick={saveSingleCategoryChange} style={{ backgroundColor: accentColorValue }} className="text-white">Update Category</Button>
                </div>
            </div>
         </Modal>
      )}
    </>
  );
}