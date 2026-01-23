// app/dashboard/canvas/_components/editor/canvas.tsx

'use client';

import React from "react"
import { useRef, useState } from 'react';
import { Page, CanvasElement, ImageElement } from './types';
import { PAGE_SIZES } from './constants';
import TextElementComponent from './text-element';
import ImageElementComponent from './image-element';

interface CanvasProps {
  page: Page;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  isEditingElementId?: string | null;
  onEditingChange?: (id: string | null) => void;
}

export default function Canvas({
  page,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  isEditingElementId: externalIsEditingElementId = null,
  onEditingChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<{
    id: string;
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startElementX: number;
    startElementY: number;
    aspectRatio: number;
  } | null>(null);
  const [localIsEditingElementId, setLocalIsEditingElementId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string } | null>(null);
  const [croppingElementId, setCroppingElementId] = useState<string | null>(null);

  const isEditingElementId = externalIsEditingElementId ?? localIsEditingElementId;
  const size = PAGE_SIZES[page.size];

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();

    const element = page.elements.find((el) => el.id === elementId);
    
    // Check if element is locked or hidden
    if (element?.locked || element?.visible === false) {
      return;
    }

    // If already editing, don't drag
    if (isEditingElementId === elementId) {
      return;
    }

    // Start dragging
    onSelectElement(elementId);
    if (element && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
      setDraggedElementId(elementId);
    }
  };

  const handleImageResize = (elementId: string, handle: string, startX: number, startY: number) => {
    const element = page.elements.find((el) => el.id === elementId);
    if (element && element.type === 'image' && !element.locked) {
      setResizing({
        id: elementId,
        handle,
        startX,
        startY,
        startWidth: element.width,
        startHeight: element.height,
        startElementX: element.x,
        startElementY: element.y,
        aspectRatio: element.height / element.width,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handle dragging
    if (draggedElementId && canvasRef.current && isEditingElementId !== draggedElementId && !croppingElementId) {
      const element = page.elements.find((el) => el.id === draggedElementId);
      if (element?.locked) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      if (element) {
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, size.width - element.width));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, size.height - element.height));
        onUpdateElement(draggedElementId, { x: newX, y: newY });
      }
    }

    // Handle resizing
    if (resizing) {
      const deltaX = e.clientX - resizing.startX;
      const deltaY = e.clientY - resizing.startY;
      const element = page.elements.find((el) => el.id === resizing.id);

      if (!element || element.type !== 'image' || element.locked) return;

      let updates: Partial<ImageElement> = {};

      switch (resizing.handle) {
        case 'nw': {
          const newWidth = Math.max(40, resizing.startWidth - deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            x: resizing.startElementX + (resizing.startWidth - newWidth),
            y: resizing.startElementY + (resizing.startHeight - newHeight),
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'ne': {
          const newWidth = Math.max(40, resizing.startWidth + deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            y: resizing.startElementY + (resizing.startHeight - newHeight),
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'sw': {
          const newWidth = Math.max(40, resizing.startWidth - deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            x: resizing.startElementX + (resizing.startWidth - newWidth),
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'se': {
          const newWidth = Math.max(40, resizing.startWidth + deltaX);
          const newHeight = newWidth * resizing.aspectRatio;
          updates = {
            width: newWidth,
            height: newHeight,
          };
          break;
        }
        case 'n':
          updates = {
            y: Math.max(0, resizing.startElementY + deltaY),
            height: Math.max(40, resizing.startHeight - deltaY),
          };
          break;
        case 's':
          updates = {
            height: Math.max(40, resizing.startHeight + deltaY),
          };
          break;
        case 'w':
          updates = {
            x: Math.max(0, resizing.startElementX + deltaX),
            width: Math.max(40, resizing.startWidth - deltaX),
          };
          break;
        case 'e':
          updates = {
            width: Math.max(40, resizing.startWidth + deltaX),
          };
          break;
      }

      if (updates.x !== undefined && updates.width !== undefined) {
        if (updates.x + updates.width > size.width) {
          updates.x = size.width - updates.width;
        }
      }
      if (updates.y !== undefined && updates.height !== undefined) {
        if (updates.y + updates.height > size.height) {
          updates.y = size.height - updates.height;
        }
      }

      onUpdateElement(resizing.id, updates);
    }
  };

  const handleMouseUp = () => {
    setDraggedElementId(null);
    setResizing(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setContextMenu(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = page.elements.find((el) => el.id === elementId);
    if (element?.type === 'image' && !element.locked) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId,
      });
    }
  };

  const startCrop = () => {
    if (contextMenu) {
      setCroppingElementId(contextMenu.elementId);
      setContextMenu(null);
    }
  };

  const handleCrop = (elementId: string, croppedSrc: string, newWidth: number, newHeight: number) => {
    onUpdateElement(elementId, {
      src: croppedSrc,
      width: newWidth,
      height: newHeight,
    });
    setCroppingElementId(null);
  };

  const cancelCrop = () => {
    setCroppingElementId(null);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setCroppingElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  return (
    <>
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        className="relative bg-white shadow-lg transition-all duration-300 overflow-hidden"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        {page.elements.map((element) => {
          // Skip hidden elements
          if (element.visible === false) {
            return null;
          }
          
          if (element.type === 'text') {
            return (
              <TextElementComponent
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                isEditing={element.id === isEditingElementId}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDelete={() => onDeleteElement(element.id)}
                onUpdateText={(text) => onUpdateElement(element.id, { text })}
                onEditingChange={(isEditing) => {
                  if (onEditingChange) {
                    onEditingChange(isEditing ? element.id : null);
                  } else {
                    setLocalIsEditingElementId(isEditing ? element.id : null);
                  }
                }}
              />
            );
          } else if (element.type === 'image') {
            return (
              <ImageElementComponent
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId && !croppingElementId}
                onMouseDown={(e) => handleMouseDown(e, element.id)}
                onDelete={() => onDeleteElement(element.id)}
                onResize={(handle, startX, startY) => handleImageResize(element.id, handle, startX, startY)}
                onContextMenu={(e) => handleContextMenu(e, element.id)}
                isCropping={croppingElementId === element.id}
                onCrop={(croppedSrc, newWidth, newHeight) => handleCrop(element.id, croppedSrc, newWidth, newHeight)}
                onCancelCrop={cancelCrop}
              />
            );
          }
          return null;
        })}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={startCrop}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors text-sm"
          >
            Crop
          </button>
        </div>
      )}
    </>
  );
}