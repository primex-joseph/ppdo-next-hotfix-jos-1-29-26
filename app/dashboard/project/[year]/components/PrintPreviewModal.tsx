// ========================================================================================
// UPDATED PRINT PREVIEW MODAL - SIMPLIFIED APPROACH
// ========================================================================================
// app/dashboard/project/[year]/components/PrintPreviewModal.tsx

'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { PrintPreviewToolbar } from './PrintPreviewToolbar';
import { ConfirmationModal } from './ConfirmationModal';
import { TemplateSelector } from './TemplateSelector';
import { PageOrientationModal } from './PageOrientationModal';
import { TemplateApplicationModal } from './TemplateApplicationModal';
import { PrintDraft, ColumnDefinition, BudgetTotals, RowMarker } from '@/lib/print-canvas/types';
import { BudgetItem } from '@/app/dashboard/project/[year]/types';
import { CanvasTemplate } from '@/app/(extra)/canvas/_components/editor/types/template';

// Canvas components
import Toolbar from '@/app/(extra)/canvas/_components/editor/toolbar';
import Canvas from '@/app/(extra)/canvas/_components/editor/canvas';
import PagePanel from '@/app/(extra)/canvas/_components/editor/page-panel';
import BottomPageControls from '@/app/(extra)/canvas/_components/editor/bottom-page-controls';
import { HorizontalRuler, VerticalRuler } from '@/app/(extra)/canvas/_components/editor/ruler';
import { useRulerState } from '@/app/(extra)/canvas/_components/editor/hooks/useRulerState';
import { getPageDimensions, RULER_WIDTH, RULER_HEIGHT } from '@/app/(extra)/canvas/_components/editor/constants';

// Custom hooks
import { usePrintPreviewState } from './hooks/usePrintPreviewState';
import { usePrintPreviewActions } from './hooks/usePrintPreviewActions';
import { usePrintPreviewDraft } from './hooks/usePrintPreviewDraft';
import { convertTableToCanvas } from '@/lib/print-canvas/tableToCanvas';
import { mergeTemplateWithCanvas } from '@/lib/canvas-utils/mergeTemplate';
import { toast } from 'sonner';

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

  // Ruler state
  const {
    rulerState,
    toggleRulerVisibility,
    updateMargin,
    updateIndent,
    addTabStop,
    updateTabStop,
    removeTabStop,
  } = useRulerState();

  // Scroll tracking for rulers
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const canvasScrollRef = useRef<HTMLDivElement>(null);

  // Viewer/Editor mode state
  const [isEditorMode, setIsEditorMode] = useState(false);

  // Loading state
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Template application confirmation
  const [showTemplateApplicationModal, setShowTemplateApplicationModal] = useState(false);
  const [savedTemplate, setSavedTemplate] = useState<CanvasTemplate | null>(null);

  // Live template application (from toolbar button)
  const [showLiveTemplateSelector, setShowLiveTemplateSelector] = useState(false);

  // ⭐ SIMPLIFIED: Just two boolean states - no complex state machine
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null | undefined>(undefined);

  // Initialize from table data with template and orientation
  const initializeFromTableData = useCallback(
    (template?: CanvasTemplate, orientation: 'portrait' | 'landscape' = 'portrait') => {
      console.group('🎨 INITIALIZING PRINT PREVIEW');
      console.log('Template:', template?.name || 'none');
      console.log('Orientation:', orientation);

      try {
        const result = convertTableToCanvas({
          items: budgetItems,
          totals,
          columns,
          hiddenColumns,
          pageSize: template?.page.size || 'A4',
          orientation: orientation,
          includeHeaders: true,
          includeTotals: true,
          title: `Budget Tracking ${year}`,
          subtitle: particular ? `Particular: ${particular}` : undefined,
          rowMarkers,
        });

        let finalPages = result.pages;
        let finalHeader = result.header;
        let finalFooter = result.footer;

        if (template) {
          const merged = mergeTemplateWithCanvas(
            result.pages,
            result.header,
            result.footer,
            template
          );

          finalPages = merged.pages;
          finalHeader = merged.header;
          finalFooter = merged.footer;

          state.setAppliedTemplate(template);
          toast.success(`Applied template "${template.name}" to ${finalPages.length} page(s)`);
        } else {
          toast.success(`Generated ${result.metadata.totalPages} page(s) in ${orientation} orientation`);
        }

        state.setPages(finalPages);
        state.setHeader(finalHeader);
        state.setFooter(finalFooter);
        state.setCurrentPageIndex(0);
        state.setIsDirty(false);
        state.setHasInitialized(true);

        console.log('✅ Initialization complete');
        console.groupEnd();
      } catch (error) {
        console.error('❌ Failed to convert table to canvas:', error);
        console.groupEnd();
        toast.error('Failed to convert table to canvas');
      }
    },
    [budgetItems, totals, columns, hiddenColumns, year, particular, rowMarkers, state]
  );

  // ⭐ SIMPLIFIED: Handle template selection
  const handleTemplateSelect = useCallback(
    (template: CanvasTemplate | null) => {
      console.log('✅ Template selected:', template?.name || 'blank');
      
      // Store the template
      setPendingTemplate(template);
      
      // Close template selector first
      setShowTemplateSelector(false);
      
      // Open orientation modal after template selector closes
      // Use a longer delay to ensure clean transition
      setTimeout(() => {
        console.log('🔄 Opening orientation modal');
        setShowOrientationModal(true);
      }, 350);
    },
    []
  );

  // ⭐ SIMPLIFIED: Handle orientation selection
  const handleOrientationSelect = useCallback(
    (orientation: 'portrait' | 'landscape') => {
      console.log('✅ Orientation selected:', orientation);
      
      // Close orientation modal
      setShowOrientationModal(false);
      
      // Initialize with both template and orientation
      if (pendingTemplate) {
        const templateWithOrientation = {
          ...pendingTemplate,
          page: {
            ...pendingTemplate.page,
            orientation: orientation,
          },
        };
        initializeFromTableData(templateWithOrientation, orientation);
      } else {
        initializeFromTableData(undefined, orientation);
      }
      
      // Mark as initialized and cleanup
      state.setHasInitialized(true);
      setPendingTemplate(undefined);
    },
    [pendingTemplate, initializeFromTableData, state]
  );

  // Handle applying saved template to fresh data
  const handleApplySavedTemplate = useCallback(() => {
    if (!savedTemplate) return;

    console.log('🎯 Applying saved template to fresh data:', savedTemplate.name);
    setIsLoadingTemplate(true);

    setTimeout(() => {
      initializeFromTableData(savedTemplate, savedTemplate.page.orientation);

      if (existingDraft) {
        state.setLastSavedTime(existingDraft.timestamp);
      }

      setIsLoadingTemplate(false);
      setSavedTemplate(null);
    }, 500);
  }, [savedTemplate, initializeFromTableData, existingDraft, state]);

  // Handle skipping template application
  const handleSkipTemplate = useCallback(() => {
    if (!existingDraft) return;

    console.log('📄 Skipping template - loading saved canvas state...');
    state.setPages(existingDraft.canvasState.pages);
    state.setHeader(existingDraft.canvasState.header);
    state.setFooter(existingDraft.canvasState.footer);
    state.setCurrentPageIndex(existingDraft.canvasState.currentPageIndex);
    state.setLastSavedTime(existingDraft.timestamp);

    if (existingDraft.appliedTemplate) {
      state.setAppliedTemplate(existingDraft.appliedTemplate);
    }

    state.setIsDirty(false);
    setSavedTemplate(null);
  }, [existingDraft, state]);

  // Handle applying template to live canvas (from toolbar button)
  const handleApplyLiveTemplate = useCallback(
    (template: CanvasTemplate | null) => {
      if (!template) return;

      console.log('🎨 Applying template to live canvas:', template.name);

      const merged = mergeTemplateWithCanvas(
        state.pages,
        state.header,
        state.footer,
        template
      );

      state.setPages(merged.pages);
      state.setHeader(merged.header);
      state.setFooter(merged.footer);
      state.setAppliedTemplate(template);
      state.setIsDirty(true);

      toast.success(`Applied template "${template.name}" to canvas`);
      setShowLiveTemplateSelector(false);
    },
    [state]
  );

  // Keyboard shortcut for ruler toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        toggleRulerVisibility();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, toggleRulerVisibility]);

  // Initialize when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      state.setHasInitialized(false);
      state.setDocumentTitle('');
      setPendingTemplate(undefined);
      setSavedTemplate(null);
      setShowTemplateApplicationModal(false);
      setShowLiveTemplateSelector(false);
      setShowTemplateSelector(false);
      setShowOrientationModal(false);
      return;
    }

    console.log('📄 Modal opened - checking initialization');

    // Initialize from existing draft
    if (existingDraft && !state.hasInitialized) {
      console.log('📂 Loading from existing draft...');

      const draftTitle = existingDraft.documentTitle ||
        (particular ? `Budget ${year} - ${particular}` : `Budget ${year}`);
      state.setDocumentTitle(draftTitle);

      if (existingDraft.appliedTemplate) {
        console.log('🎨 Draft has saved template:', existingDraft.appliedTemplate.name);
        setSavedTemplate(existingDraft.appliedTemplate);
        setShowTemplateApplicationModal(true);
        state.setHasInitialized(true);
        return;
      }

      console.log('📄 Loading saved canvas state without template...');
      state.setPages(existingDraft.canvasState.pages);
      state.setHeader(existingDraft.canvasState.header);
      state.setFooter(existingDraft.canvasState.footer);
      state.setCurrentPageIndex(existingDraft.canvasState.currentPageIndex);
      state.setLastSavedTime(existingDraft.timestamp);
      state.setIsDirty(false);
      state.setHasInitialized(true);
      return;
    }

    // Initialize from table data - show template selector first
    if (!existingDraft && !state.hasInitialized) {
      console.log('📊 New print preview - showing template selector');

      const defaultTitle = particular
        ? `Budget ${year} - ${particular}`
        : `Budget ${year}`;
      state.setDocumentTitle(defaultTitle);

      // Show template selector
      setShowTemplateSelector(true);
    }
  }, [isOpen, existingDraft, state.hasInitialized, particular, year, state]);

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
    documentTitle: state.documentTitle,
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
    appliedTemplate: state.appliedTemplate,
  });

  const formattedLastSaved = state.lastSavedTime ? formatTimestamp(state.lastSavedTime) : '';

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      state.setDocumentTitle(newTitle);
      state.setIsDirty(true);
    },
    [state]
  );

  if (!isOpen) return null;

  // Show loading screen
  if (isLoadingTemplate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <div className="mb-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-stone-200 dark:border-stone-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-3 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Applying Template
          </p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Preparing your pages...
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col">
        {/* Toolbar */}
        <PrintPreviewToolbar
          documentTitle={state.documentTitle}
          onTitleChange={handleTitleChange}
          isDirty={state.isDirty}
          isSaving={state.isSaving}
          lastSavedTime={formattedLastSaved}
          onBack={handleClose}
          onClose={handleClose}
          onSaveDraft={handleSaveDraft}
          onApplyTemplate={() => setShowLiveTemplateSelector(true)}
          isEditorMode={isEditorMode}
          onEditorModeChange={setIsEditorMode}
          rulerVisible={rulerState.visible}
          onToggleRuler={toggleRulerVisibility}
          pageOrientation={state.currentPage.orientation}
          pageSize={state.currentPage.size}
        />

        {/* Horizontal Ruler */}
        {rulerState.visible && (
          <div className="sticky top-0 z-30 bg-stone-200 border-b border-stone-300 flex">
            {rulerState.showVertical && (
              <div
                className="flex-shrink-0 bg-stone-200 border-r border-stone-300"
                style={{ width: RULER_WIDTH, height: RULER_HEIGHT }}
              />
            )}
            <div className="flex-1 overflow-hidden flex justify-center" style={{ height: RULER_HEIGHT }}>
              <div style={{ transform: `translateX(${-scrollLeft}px)` }}>
                <HorizontalRuler
                  width={getPageDimensions(state.currentPage.size, state.currentPage.orientation).width}
                  rulerState={rulerState}
                  onMarginChange={updateMargin}
                  onIndentChange={updateIndent}
                  onTabStopAdd={addTabStop}
                  onTabStopUpdate={updateTabStop}
                  onTabStopRemove={removeTabStop}
                  scrollLeft={0}
                />
              </div>
            </div>
            <div className="w-64 flex-shrink-0 bg-stone-200" style={{ height: RULER_HEIGHT }} />
          </div>
        )}

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical Ruler */}
          {rulerState.visible && rulerState.showVertical && (
            <div className="flex-shrink-0 bg-stone-100 border-r border-stone-300 overflow-hidden" style={{ width: RULER_WIDTH }}>
              <div style={{ transform: `translateY(${-scrollTop}px)`, marginTop: 16 }}>
                <VerticalRuler
                  height={getPageDimensions(state.currentPage.size, state.currentPage.orientation).height}
                  rulerState={rulerState}
                  onMarginChange={updateMargin}
                  scrollTop={0}
                  showHeaderFooter={true}
                />
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 min-w-0">
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
                isEditorMode={isEditorMode}
              />
            </div>

            <div
              ref={canvasScrollRef}
              className="flex-1 overflow-y-auto overflow-x-auto flex items-start justify-center pt-4 pb-16 px-8"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                setScrollLeft(target.scrollLeft);
                setScrollTop(target.scrollTop);
              }}
            >
              <Canvas
                page={state.currentPage}
                selectedElementId={isEditorMode ? state.selectedElementId : null}
                onSelectElement={isEditorMode ? state.setSelectedElementId : () => {}}
                onUpdateElement={isEditorMode ? actions.updateElement : () => {}}
                onDeleteElement={isEditorMode ? actions.deleteElement : () => {}}
                isEditingElementId={isEditorMode ? state.isEditingElementId : null}
                onEditingChange={isEditorMode ? state.setIsEditingElementId : () => {}}
                header={state.header}
                footer={state.footer}
                pageNumber={state.currentPageIndex + 1}
                totalPages={state.pages.length}
                activeSection={state.activeSection}
                onActiveSectionChange={isEditorMode ? state.setActiveSection : () => {}}
                selectedGroupId={state.selectedGroupId}
                isEditorMode={isEditorMode}
                onSetDirty={state.setIsDirty}
              />
            </div>

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
                onPreviousPage={() => state.setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                onNextPage={() => state.setCurrentPageIndex((prev) => Math.min(state.pages.length - 1, prev + 1))}
                isEditorMode={isEditorMode}
                selectedGroupId={state.selectedGroupId}
                onSelectGroup={state.setSelectedGroupId}
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
              header={state.header}
              footer={state.footer}
            />
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          isOpen={true}
          onClose={() => {
            console.log('⏩ Skip clicked - moving to orientation');
            handleTemplateSelect(null);
          }}
          onCloseAll={onClose}
          onSelectTemplate={handleTemplateSelect}
        />
      )}

      {/* Orientation Modal */}
      {showOrientationModal && (
        <PageOrientationModal
          isOpen={true}
          onClose={() => {
            console.log('⬅️ Back clicked - returning to template');
            setShowOrientationModal(false);
            if (!state.hasInitialized) {
              setTimeout(() => {
                setShowTemplateSelector(true);
              }, 350);
            }
          }}
          onSelectOrientation={handleOrientationSelect}
          defaultOrientation="portrait"
        />
      )}

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

      {/* Template Application Confirmation */}
      <TemplateApplicationModal
        isOpen={showTemplateApplicationModal}
        onClose={() => {
          setShowTemplateApplicationModal(false);
          handleSkipTemplate();
        }}
        onProceed={handleApplySavedTemplate}
        template={savedTemplate}
      />

      {/* Live Template Selector (from toolbar button) */}
      <TemplateSelector
        isOpen={showLiveTemplateSelector}
        onClose={() => setShowLiveTemplateSelector(false)}
        onSelectTemplate={handleApplyLiveTemplate}
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