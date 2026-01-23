// app/dashboard/canvas/_components/editor/hooks/useEditorState.ts

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { loadGoogleFont } from '@/lib/fonts';
import { Page, CanvasElement, TextElement, ImageElement } from '../types';
import { createNewPage, generateId } from '../utils';
import { PAGE_SIZES } from '../constants';

export const useEditorState = (initialPages: Page[], initialIndex: number) => {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState(initialIndex);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditingElementId, setIsEditingElementId] = useState<string | null>(null);

  const currentPage = pages[currentPageIndex];
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedElementId);

  const updateCurrentPage = useCallback((updater: (page: Page) => Page) => {
    setPages((prevPages) => {
      const newPages = [...prevPages];
      newPages[currentPageIndex] = updater(newPages[currentPageIndex]);
      return newPages;
    });
  }, [currentPageIndex]);

  // Page operations
  const addPage = useCallback(() => {
    const newPage = createNewPage(currentPage.size);
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page added');
  }, [pages, currentPage, currentPageIndex]);

  const duplicatePage = useCallback(() => {
    const newPage: Page = {
      id: generateId(),
      size: currentPage.size,
      elements: currentPage.elements.map((el) => ({
        ...el,
        id: generateId(),
      })),
    };
    const newPages = [...pages.slice(0, currentPageIndex + 1), newPage, ...pages.slice(currentPageIndex + 1)];
    setPages(newPages);
    setCurrentPageIndex(currentPageIndex + 1);
    setSelectedElementId(null);
    setIsEditingElementId(null);
    toast.success('Page duplicated');
  }, [pages, currentPage, currentPageIndex]);

  const deletePage = useCallback(() => {
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
  }, [pages, currentPage, currentPageIndex]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
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
  }, [pages, currentPageIndex]);

  const changePageSize = useCallback((size: 'A4' | 'Short' | 'Long') => {
    updateCurrentPage((page) => ({ ...page, size }));
  }, [updateCurrentPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setSelectedElementId(null);
      setIsEditingElementId(null);
    }
  }, [currentPageIndex]);

  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setSelectedElementId(null);
      setIsEditingElementId(null);
    }
  }, [currentPageIndex, pages.length]);

  // Element operations
  const addText = useCallback(() => {
    const size = PAGE_SIZES[currentPage.size];
    const elementWidth = 200;
    const elementHeight = 30;
    const centerX = Math.max(0, (size.width - elementWidth) / 2);
    const centerY = Math.max(0, (size.height - elementHeight) / 2);

    const newElement: TextElement = {
      id: generateId(),
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
  }, [currentPage, updateCurrentPage]);

  const addImage = useCallback((src: string) => {
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
        id: generateId(),
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
  }, [currentPage, updateCurrentPage]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    if ('fontFamily' in updates && updates.fontFamily) {
      loadGoogleFont(updates.fontFamily);
    }

    updateCurrentPage((page) => ({
      ...page,
      elements: page.elements.map((el) => {
        if (el.id !== id) return el;
        
        // Type-safe merging based on element type
        if (el.type === 'text') {
          return { ...el, ...updates } as TextElement;
        } else {
          return { ...el, ...updates } as ImageElement;
        }
      }),
    }));
  }, [updateCurrentPage]);

  const deleteElement = useCallback((id: string) => {
    updateCurrentPage((page) => ({
      ...page,
      elements: page.elements.filter((el) => el.id !== id),
    }));
    setSelectedElementId(null);
  }, [updateCurrentPage]);

  const reorderElements = useCallback((fromIndex: number, toIndex: number) => {
    updateCurrentPage((page) => {
      const newElements = [...page.elements];
      const [movedElement] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, movedElement);
      return { ...page, elements: newElements };
    });
  }, [updateCurrentPage]);

  const selectPage = useCallback((index: number) => {
    setCurrentPageIndex(index);
    setSelectedElementId(null);
    setIsEditingElementId(null);
  }, []);

  return {
    pages,
    currentPageIndex,
    currentPage,
    selectedElementId,
    selectedElement,
    isEditingElementId,
    setSelectedElementId,
    setIsEditingElementId,
    addPage,
    duplicatePage,
    deletePage,
    reorderPages,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
    selectPage,
    addText,
    addImage,
    updateElement,
    deleteElement,
    reorderElements,
  };
};