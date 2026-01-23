'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '../editor';
import { X, Eye, EyeOff, Lock, Unlock, GripVertical, Type, ImageIcon } from 'lucide-react';

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onReorderElements: (fromIndex: number, toIndex: number) => void;
}

export default function LayerPanel({
  isOpen,
  onClose,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onReorderElements,
}: LayerPanelProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);
  const [dragOverLayerIndex, setDragOverLayerIndex] = useState<number | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Set initial position on mount (client-side only)
  useEffect(() => {
    if (isOpen && !isPositioned && typeof window !== 'undefined') {
      setPosition({
        x: Math.max(20, window.innerWidth - 300),
        y: Math.max(100, window.innerHeight - 420),
      });
      setIsPositioned(true);
    }
  }, [isOpen, isPositioned]);

  // Reverse the elements array so top of list = topmost element (last in array)
  const reversedElements = [...elements].reverse();

  // Handle panel dragging
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 260));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Handle layer drag and drop reordering
  const handleLayerDragStart = (e: React.DragEvent, reversedIndex: number) => {
    setDraggedLayerIndex(reversedIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', reversedIndex.toString());
  };

  const handleLayerDragOver = (e: React.DragEvent, reversedIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedLayerIndex !== null && draggedLayerIndex !== reversedIndex) {
      setDragOverLayerIndex(reversedIndex);
    }
  };

  const handleLayerDragLeave = () => {
    setDragOverLayerIndex(null);
  };

  const handleLayerDrop = (e: React.DragEvent, toReversedIndex: number) => {
    e.preventDefault();
    if (draggedLayerIndex !== null && draggedLayerIndex !== toReversedIndex) {
      // Convert reversed indices back to original indices
      const fromOriginalIndex = elements.length - 1 - draggedLayerIndex;
      const toOriginalIndex = elements.length - 1 - toReversedIndex;
      onReorderElements(fromOriginalIndex, toOriginalIndex);
    }
    setDraggedLayerIndex(null);
    setDragOverLayerIndex(null);
  };

  const handleLayerDragEnd = () => {
    setDraggedLayerIndex(null);
    setDragOverLayerIndex(null);
  };

  const toggleVisibility = (e: React.MouseEvent, elementId: string, currentVisible: boolean | undefined) => {
    e.stopPropagation();
    onUpdateElement(elementId, { visible: currentVisible === false ? true : false });
  };

  const toggleLock = (e: React.MouseEvent, elementId: string, currentLocked: boolean | undefined) => {
    e.stopPropagation();
    onUpdateElement(elementId, { locked: !currentLocked });
  };

  const handleLayerClick = (elementId: string, element: CanvasElement) => {
    // Don't select if hidden
    if (element.visible === false) return;
    onSelectElement(elementId);
  };

  const getElementLabel = (element: CanvasElement, index: number): string => {
    if (element.type === 'text') {
      const text = element.text;
      return text.length > 15 ? text.substring(0, 15) + '...' : text;
    } else if (element.type === 'image') {
      return element.name || `Image ${index + 1}`;
    }
    return `Element ${index + 1}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bg-white border border-stone-200 rounded-lg shadow-lg z-50 w-64 max-h-80 flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-stone-200 cursor-move select-none bg-stone-50 rounded-t-lg"
        onMouseDown={handleHeaderMouseDown}
      >
        <span className="text-sm font-medium text-stone-700">Layers</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-stone-200 rounded transition-colors"
          title="Close"
        >
          <X className="w-4 h-4 text-stone-500" />
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-1">
        {reversedElements.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-4">
            No elements on this page
          </div>
        ) : (
          <div className="space-y-1">
            {reversedElements.map((element, reversedIndex) => {
              const isSelected = element.id === selectedElementId;
              const isHidden = element.visible === false;
              const isLocked = element.locked === true;
              const isDraggingThis = draggedLayerIndex === reversedIndex;
              const isDropTarget = dragOverLayerIndex === reversedIndex;
              const originalIndex = elements.length - 1 - reversedIndex;

              return (
                <div
                  key={element.id}
                  draggable
                  onDragStart={(e) => handleLayerDragStart(e, reversedIndex)}
                  onDragOver={(e) => handleLayerDragOver(e, reversedIndex)}
                  onDragLeave={handleLayerDragLeave}
                  onDrop={(e) => handleLayerDrop(e, reversedIndex)}
                  onDragEnd={handleLayerDragEnd}
                  onClick={() => handleLayerClick(element.id, element)}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-all
                    ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-stone-100 border border-transparent'}
                    ${isDraggingThis ? 'opacity-50' : ''}
                    ${isDropTarget ? 'ring-2 ring-blue-400' : ''}
                    ${isHidden ? 'opacity-50' : ''}
                    ${isLocked && !isHidden ? 'bg-stone-50' : ''}
                  `}
                >
                  {/* Drag Handle */}
                  <GripVertical className="w-3 h-3 text-stone-400 cursor-grab flex-shrink-0" />

                  {/* Element Type Icon */}
                  {element.type === 'text' ? (
                    <Type className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  )}

                  {/* Element Label */}
                  <span className={`flex-1 truncate ${isHidden ? 'text-stone-400' : 'text-stone-700'}`}>
                    {getElementLabel(element, originalIndex)}
                  </span>

                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => toggleVisibility(e, element.id, element.visible)}
                    className="p-1 hover:bg-stone-200 rounded transition-colors flex-shrink-0"
                    title={isHidden ? 'Show' : 'Hide'}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => toggleLock(e, element.id, element.locked)}
                    className="p-1 hover:bg-stone-200 rounded transition-colors flex-shrink-0"
                    title={isLocked ? 'Unlock' : 'Lock'}
                  >
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
