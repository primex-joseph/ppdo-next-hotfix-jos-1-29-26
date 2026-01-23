'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { loadGoogleFont, loadGoogleFonts } from '@/lib/fonts';
import { printAllPages } from '@/lib/print';
import Toolbar from './_components/editor/toolbar';
import Canvas from './_components/editor/canvas';
import PageNavigator from './_components/editor/page-navigator';
import PagePanel from './_components/editor/page-panel';
import BottomPageControls from './_components/editor/bottom-page-controls';

export interface TextElement {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  shadow: boolean;
  outline: boolean;
  width: number;
  height: number;
  locked?: boolean;
  visible?: boolean;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  imageId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
}

export type CanvasElement = TextElement | ImageElement;

export interface Page {
  id: string;
  size: 'A4' | 'Short' | 'Long';
  elements: CanvasElement[];
}

const createNewPage = (size: 'A4' | 'Short' | 'Long' = 'A4'): Page => ({
  id: Math.random().toString(36).substr(2, 9),
  size,
  elements: [],
});

const STORAGE_KEY = 'canvas-editor-state';

export default function Editor() {
  const [pages, setPages] = useState<Page[]>([createNewPage()]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditingElementId, setIsEditingElementId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const currentPage = pages[currentPageIndex];
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId);

  // Handle clipboard paste for images and element copy/paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isEditingElementId) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const src = event.target?.result as string;
              if (src) {
                addImage(src);
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isEditingElementId || !selectedElementId) return;
      
      e.preventDefault();
      const element = currentPage.elements.find(el => el.id === selectedElementId);
      if (element) {
        localStorage.setItem('canvas-clipboard', JSON.stringify(element));
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('copy', handleCopy);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isEditingElementId, selectedElementId, currentPage]);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingElementId) return;
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingElementId, selectedElementId]);

  // Initial hydration: Load state from localStorage and hydrate fonts
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { pages: savedPages, currentPageIndex: savedIndex } = JSON.parse(savedState);
        setPages(savedPages);
        setCurrentPageIndex(savedIndex);

        const usedFonts = new Set<string>();
        savedPages.forEach((page: Page) => {
          page.elements.forEach((element: CanvasElement) => {
            if (element.type === 'text') {
              usedFonts.add(element.fontFamily);
            }
          });
        });

        loadGoogleFonts(Array.from(usedFonts));
      } catch (error) {
        console.error('[v0] Failed to load editor state:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever pages change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages, currentPageIndex }));
    }
  }, [pages, currentPageIndex, isHydrated]);

  const updateCurrentPage = (updater: (page: Page) => Page) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = updater(newPages[currentPageIndex]);
      return newPages;
    });
  };

  const addPage = () => {
    const newPage = createNewPage(currentPage.size);
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page added');
  };

  const duplicatePage = () => {
    const newPage: Page = {
      id: Math.random().toString(36).substr(2, 9),
      size: currentPage.size,
      elements: currentPage.elements.map((el) => ({
        ...el,
        id: Math.random().toString(36).substr(2, 9),
      })),
    };
    const newPages = [...pages.slice(0, currentPageIndex + 1), newPage, ...pages.slice(currentPageIndex + 1)];
    setPages(newPages);
    setCurrentPageIndex(currentPageIndex + 1);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page duplicated');
  };

  const deletePage = () => {
    if (pages.length === 1) {
      const newPage = createNewPage(currentPage.size);
      setPages([newPage]);
      setCurrentPageIndex(0);
      setSelectedElementId(null);
      setIsEditingElementId(null);
      toast.success('Page deleted');
      return;
    }

    const newPages = pages.filter((_, i) => i !== currentPageIndex);
    const newIndex = currentPageIndex > 0 ? currentPageIndex - 1 : 0;
    setPages(newPages);
    setCurrentPageIndex(newIndex);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page deleted');
  };

  const reorderPages = (fromIndex: number, toIndex: number) => {
    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    setPages(newPages);

    if (currentPageIndex === fromIndex) {
      setCurrentPageIndex(toIndex);
    } else if (currentPageIndex > fromIndex && currentPageIndex <= toIndex) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (currentPageIndex < fromIndex && currentPageIndex >= toIndex) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const changePageSize = (size: 'A4' | 'Short' | 'Long') => {
    updateCurrentPage((page) => ({ ...page, size }));
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setSelectedElementId(null);
      setIsEditingElementId(null);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setSelectedElementId(null);
      setIsEditingElementId(null);
    }
  };

  const addText = () => {
    const PAGE_SIZES = {
      A4: { width: 595, height: 842 },
      Short: { width: 612, height: 792 },
      Long: { width: 612, height: 936 },
    };
    const size = PAGE_SIZES[currentPage.size];
    const elementWidth = 200;
    const elementHeight = 30;
    const centerX = Math.max(0, (size.width - elementWidth) / 2);
    const centerY = Math.max(0, (size.height - elementHeight) / 2);

    const newElement: TextElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      text: 'Edit text',
      x: centerX,
      y: centerY,
      fontSize: 16,
      fontFamily: 'font-sans',
      bold: false,
      italic: false,
      underline: false,
      color: '#000000',
      shadow: false,
      outline: false,
      width: elementWidth,
      height: elementHeight,
      locked: false,
      visible: true,
    };
    updateCurrentPage((page) => ({
      ...page,
      elements: [...page.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
  };

  const addImage = (src: string) => {
    const PAGE_SIZES = {
      A4: { width: 595, height: 842 },
      Short: { width: 612, height: 792 },
      Long: { width: 612, height: 936 },
    };
    const size = PAGE_SIZES[currentPage.size];

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxWidth = 300;
      const aspectRatio = img.height / img.width;
      const elementWidth = Math.min(maxWidth, size.width - 40);
      const elementHeight = elementWidth * aspectRatio;
      
      const centerX = Math.max(0, (size.width - elementWidth) / 2);
      const centerY = Math.max(0, (size.height - elementHeight) / 2);

      const newElement: ImageElement = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'image',
        src,
        x: centerX,
        y: centerY,
        width: elementWidth,
        height: elementHeight,
        locked: false,
        visible: true,
      };
      
      updateCurrentPage((page) => ({
        ...page,
        elements: [...page.elements, newElement],
      }));
      setSelectedElementId(newElement.id);
      setIsEditingElementId(null);
      toast.success('Image added');
    };
    img.src = src;
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    if ('fontFamily' in updates && updates.fontFamily) {
      loadGoogleFont(updates.fontFamily);
    }

    updateCurrentPage((page) => ({
      ...page,
      elements: page.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  };

  const deleteElement = (id: string) => {
    updateCurrentPage((page) => ({
      ...page,
      elements: page.elements.filter((el) => el.id !== id),
    }));
    setSelectedElementId(null);
  };

  const reorderElements = (fromIndex: number, toIndex: number) => {
    updateCurrentPage((page) => {
      const newElements = [...page.elements];
      const [movedElement] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, movedElement);
      return { ...page, elements: newElements };
    });
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      <Toolbar
        selectedElement={selectedElement}
        onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}
        onAddText={addText}
        pageSize={currentPage.size}
        onPageSizeChange={changePageSize}
        onPrint={() => printAllPages(pages)}
      />

      <div className="no-print">
        <PagePanel
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPageSelect={(index) => {
            setCurrentPageIndex(index);
            setSelectedElementId(null);
            setIsEditingElementId(null);
          }}
          onAddPage={addPage}
          onReorderPages={reorderPages}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-print" style={{ marginRight: '192px' }}>
        <div className="flex items-center justify-center pt-28 pb-40 px-8 min-h-full">
          <Canvas
            page={currentPage}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            isEditingElementId={isEditingElementId}
            onEditingChange={setIsEditingElementId}
          />
        </div>
      </div>

      <div className="no-print">
        <PageNavigator
          currentPageIndex={currentPageIndex}
          totalPages={pages.length}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
        />
      </div>

      <div className="no-print">
        <BottomPageControls
          currentPageIndex={currentPageIndex}
          totalPages={pages.length}
          onAddPage={addPage}
          onDuplicatePage={duplicatePage}
          onDeletePage={deletePage}
          elements={currentPage.elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={updateElement}
          onReorderElements={reorderElements}
        />
      </div>

      <Toaster position="bottom-center" />
    </div>
  );
}
