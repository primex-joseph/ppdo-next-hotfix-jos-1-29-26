// app/dashboard/project/[year]/components/hooks/usePrintPreviewInitialization.ts (NEW FILE)

import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { convertTableToCanvas } from '@/lib/print-canvas/tableToCanvas';
import { applyTemplateToPages } from '@/lib/canvas-utils';
import { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';
import { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';
import { Page, HeaderFooter } from '@/app/(extra)/canvas/_components/editor/types';

interface UseInitializationProps {
  isOpen: boolean;
  existingDraft?: PrintDraft | null;
  hasInitialized: boolean;
  appliedTemplate: CanvasTemplate | null;
  budgetItems: BudgetItem[];
  totals: BudgetTotals;
  columns: ColumnDefinition[];
  hiddenColumns: Set<string>;
  year: number;
  particular?: string;
  rowMarkers?: RowMarker[];
  setPages: (pages: Page[]) => void;
  setHeader: (header: HeaderFooter) => void;
  setFooter: (footer: HeaderFooter) => void;
  setCurrentPageIndex: (index: number) => void;
  setLastSavedTime: (time: number | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setHasInitialized: (initialized: boolean) => void;
  setShowTemplateSelector: (show: boolean) => void;
  setAppliedTemplate: (template: CanvasTemplate | null) => void;
}

export function usePrintPreviewInitialization({
  isOpen,
  existingDraft,
  hasInitialized,
  appliedTemplate,
  budgetItems,
  totals,
  columns,
  hiddenColumns,
  year,
  particular,
  rowMarkers,
  setPages,
  setHeader,
  setFooter,
  setCurrentPageIndex,
  setLastSavedTime,
  setIsDirty,
  setHasInitialized,
  setShowTemplateSelector,
  setAppliedTemplate,
}: UseInitializationProps) {
  
  const initializeFromTableData = useCallback(
    (template?: CanvasTemplate) => {
      try {
        const result = convertTableToCanvas({
          items: budgetItems,
          totals,
          columns,
          hiddenColumns,
          pageSize: template?.page.size || 'A4',
          orientation: template?.page.orientation || 'portrait',
          includeHeaders: true,
          includeTotals: true,
          title: `Budget Tracking ${year}`,
          subtitle: particular ? `Particular: ${particular}` : undefined,
          rowMarkers,
        });

        // Apply template if selected
        let finalPages = result.pages;
        let finalHeader = result.header;
        let finalFooter = result.footer;

        if (template) {
          finalPages = applyTemplateToPages(result.pages, template);
          finalHeader = template.header;
          finalFooter = template.footer;
          setAppliedTemplate(template);
          toast.success(
            `Applied template "${template.name}" to ${finalPages.length} page(s)`
          );
        } else {
          toast.success(
            `Generated ${result.metadata.totalPages} page(s) from ${result.metadata.totalRows} row(s)`
          );
        }

        setPages(finalPages);
        setHeader(finalHeader);
        setFooter(finalFooter);
        setCurrentPageIndex(0);
        setIsDirty(false);
        setHasInitialized(true);
      } catch (error) {
        console.error('Failed to convert table to canvas:', error);
        toast.error('Failed to convert table to canvas');
      }
    },
    [
      budgetItems,
      totals,
      columns,
      hiddenColumns,
      year,
      particular,
      rowMarkers,
      setPages,
      setHeader,
      setFooter,
      setCurrentPageIndex,
      setIsDirty,
      setHasInitialized,
      setAppliedTemplate,
    ]
  );

  // Initialize canvas from table data or existing draft
  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      return;
    }

    // Show template selector on first open (if no existing draft and not initialized)
    if (!existingDraft && !hasInitialized && !appliedTemplate) {
      setShowTemplateSelector(true);
      return;
    }

    // Initialize from existing draft
    if (existingDraft && !hasInitialized) {
      setPages(existingDraft.canvasState.pages);
      setHeader(existingDraft.canvasState.header);
      setFooter(existingDraft.canvasState.footer);
      setCurrentPageIndex(existingDraft.canvasState.currentPageIndex);
      setLastSavedTime(existingDraft.timestamp);
      setIsDirty(false);
      setHasInitialized(true);
      return;
    }

    // Initialize from table data (without template or after template selection)
    if (!hasInitialized && (appliedTemplate !== undefined || existingDraft)) {
      initializeFromTableData(appliedTemplate || undefined);
    }
  }, [
    isOpen,
    existingDraft,
    appliedTemplate,
    hasInitialized,
    initializeFromTableData,
    setPages,
    setHeader,
    setFooter,
    setCurrentPageIndex,
    setLastSavedTime,
    setIsDirty,
    setHasInitialized,
    setShowTemplateSelector,
  ]);

  return { initializeFromTableData };
}