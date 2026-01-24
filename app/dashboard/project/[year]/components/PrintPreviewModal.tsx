// app/dashboard/project/[year]/components/PrintPreviewModal.tsx (REFACTORED)

'use client';

import { useCallback } from 'react';
import { PrintPreviewToolbar } from './PrintPreviewToolbar';
import { ConfirmationModal } from './ConfirmationModal';
import { TemplateSelector } from './TemplateSelector';
import { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';
import { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';

// Canvas components
import Toolbar from '@/app/(extra)/canvas/_components/editor/toolbar';
import Canvas from '@/app/(extra)/canvas/_components/editor/canvas';
import PagePanel from '@/app/(extra)/canvas/_components/editor/page-panel';
import BottomPageControls from '@/app/(extra)/canvas/_components/editor/bottom-page-controls';

// Custom hooks
import { usePrintPreviewState } from './hooks/usePrintPreviewState';
import { usePrintPreviewInitialization } from './hooks/usePrintPreviewInitialization';
import { usePrintPreviewActions } from './hooks/usePrintPreviewActions';
import { usePrintPreviewDraft } from './hooks/usePrintPreviewDraft';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetItems: BudgetItem[];
  totals: BudgetTotals;
  columns: ColumnDefinition[];
  hiddenColumns: Set<string>;
  filterState: {
    searchQuery: string;
    statusFilter: string[];
    yearFilter: number[];
    sortField: string | null;
    sortDirection: string | null;
  };
  year: number;
  particular?: string;
  existingDraft?: PrintDraft | null;
  onDraftSaved?: (draft: PrintDraft) => void;
  rowMarkers?: RowMarker[];
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  budgetItems,
  totals,
  columns,
  hiddenColumns,
  filterState,
  year,
  particular,
  existingDraft,
  onDraftSaved,
  rowMarkers,
}: PrintPreviewModalProps) {
  // State management
  const state = usePrintPreviewState();

  // Initialization
  const { initializeFromTableData } = usePrintPreviewInitialization({
    isOpen,
    existingDraft,
    hasInitialized: state.hasInitialized,
    appliedTemplate: state.appliedTemplate,
    budgetItems,
    totals,
    columns,
    hiddenColumns,
    year,
    particular,
    rowMarkers,
    setPages: state.setPages,
    setHeader: state.setHeader,
    setFooter: state.setFooter,
    setCurrentPageIndex: state.setCurrentPageIndex,
    setLastSavedTime: state.setLastSavedTime,
    setIsDirty: state.setIsDirty,
    setHasInitialized: state.setHasInitialized,
    setShowTemplateSelector: state.setShowTemplateSelector,
    setAppliedTemplate: state.setAppliedTemplate,
  });

  // Canvas actions
  const actions = usePrintPreviewActions({
    currentPageIndex: state.currentPageIndex,
    header: state.header,
    footer: state.footer,
    setPages: state.setPages,
    setHeader: state.setHeader,
    setFooter: state.setFooter,
    setSelectedElementId: state.setSelectedElementId,
    setIsDirty: state.setIsDirty,
  });

  // Draft management
  const { handleSaveDraft, handlePrint, handleClose } = usePrintPreviewDraft({
    pages: state.pages,
    header: state.header,
    footer: state.footer,
    currentPageIndex: state.currentPageIndex,
    budgetItems,
    totals,
    columns,
    hiddenColumns,
    filterState,
    year,
    particular,
    existingDraft,
    onDraftSaved,
    isDirty: state.isDirty,
    setIsDirty: state.setIsDirty,
    setIsSaving: state.setIsSaving,
    setLastSavedTime: state.setLastSavedTime,
    setShowCloseConfirm: state.setShowCloseConfirm,
    onClose,
  });

  // Template selection handler
  const handleTemplateSelect = useCallback(
    (template: CanvasTemplate | null) => {
      state.setAppliedTemplate(template);
      state.setHasInitialized(false); // Trigger re-initialization
    },
    [state]
  );

  const formattedLastSaved = state.lastSavedTime ? formatTimestamp(state.lastSavedTime) : '';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col">
        {/* Custom Toolbar */}
        <PrintPreviewToolbar
          isDirty={state.isDirty}
          isSaving={state.isSaving}
          lastSavedTime={formattedLastSaved}
          onBack={handleClose}
          onClose={handleClose}
          onSaveDraft={handleSaveDraft}
        />

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 min-w-0">
            {/* Canvas Toolbar */}
            <div className="sticky top-0 z-10 bg-stone-100 border-b border-stone-300 shadow-sm">
              <Toolbar
                selectedElement={state.selectedElement}
                onUpdateElement={
                  state.selectedElementId
                    ? (updates) => actions.updateElement(state.selectedElementId!, updates)
                    : undefined
                }
                onAddText={() => {}}
                pageSize={state.currentPage.size}
                orientation={state.currentPage.orientation}
                onPageSizeChange={actions.changePageSize}
                onOrientationChange={actions.changeOrientation}
                onPrint={handlePrint}
                activeSection={state.activeSection}
                headerBackgroundColor={state.header.backgroundColor || '#ffffff'}
                footerBackgroundColor={state.footer.backgroundColor || '#ffffff'}
                pageBackgroundColor={state.currentPage.backgroundColor || '#ffffff'}
                onHeaderBackgroundChange={actions.updateHeaderBackground}
                onFooterBackgroundChange={actions.updateFooterBackground}
                onPageBackgroundChange={actions.updatePageBackground}
                pages={state.pages}
                header={state.header}
                footer={state.footer}
              />
            </div>

            {/* Canvas Scroll Area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8">
              <Canvas
                page={state.currentPage}
                selectedElementId={state.selectedElementId}
                onSelectElement={state.setSelectedElementId}
                onUpdateElement={actions.updateElement}
                onDeleteElement={actions.deleteElement}
                isEditingElementId={state.isEditingElementId}
                onEditingChange={state.setIsEditingElementId}
                header={state.header}
                footer={state.footer}
                pageNumber={state.currentPageIndex + 1}
                totalPages={state.pages.length}
                activeSection={state.activeSection}
                onActiveSectionChange={state.setActiveSection}
              />
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-stone-200 bg-white flex-shrink-0">
              <BottomPageControls
                currentPageIndex={state.currentPageIndex}
                totalPages={state.pages.length}
                onAddPage={() => {}}
                onDuplicatePage={() => {}}
                onDeletePage={() => {}}
                elements={state.allElements}
                selectedElementId={state.selectedElementId}
                onSelectElement={state.setSelectedElementId}
                onUpdateElement={actions.updateElement}
                onReorderElements={actions.reorderElements}
                onPreviousPage={() =>
                  state.setCurrentPageIndex((prev) => Math.max(0, prev - 1))
                }
                onNextPage={() =>
                  state.setCurrentPageIndex((prev) =>
                    Math.min(state.pages.length - 1, prev + 1)
                  )
                }
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 border-l border-stone-200 bg-zinc-50 flex-shrink-0 overflow-y-auto">
            <PagePanel
              pages={state.pages}
              currentPageIndex={state.currentPageIndex}
              onPageSelect={state.setCurrentPageIndex}
              onAddPage={() => {}}
              onReorderPages={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <TemplateSelector
        isOpen={state.showTemplateSelector}
        onClose={() => {
          state.setShowTemplateSelector(false);
          if (!state.hasInitialized) {
            // User closed without selecting - initialize with no template
            handleTemplateSelect(null);
          }
        }}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Close Confirmation */}
      <ConfirmationModal
        isOpen={state.showCloseConfirm}
        onClose={() => state.setShowCloseConfirm(false)}
        onConfirm={() => {
          handleSaveDraft();
          setTimeout(() => onClose(), 100);
        }}
        title="Save Print Preview as Draft?"
        message="You have unsaved changes. Save them for later?"
        confirmText="Save & Close"
        cancelText="Discard & Close"
        variant="default"
      />
    </>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}