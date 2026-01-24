// app/(extra)/canvas/page.tsx (FIXED - Mode reset on discard)

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Editor from './_components/editor';
import TemplateCreator from './_components/TemplateCreator';
import { CanvasModeModal } from './_components/CanvasModeModal';
import { CloseConfirmationModal } from './_components/CloseConfirmationModal';

type CanvasMode = 'template' | 'editor' | null;

const CANVAS_MODE_KEY = 'canvas-preferred-mode';
const CANVAS_MODE_SELECTED_KEY = 'canvas-mode-has-been-selected';

export default function CanvasPage() {
  const router = useRouter();
  const [mode, setMode] = useState<CanvasMode>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadTemplateId, setLoadTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const hasSelectedMode = localStorage.getItem(CANVAS_MODE_SELECTED_KEY);
    const savedMode = localStorage.getItem(CANVAS_MODE_KEY);
    
    if (hasSelectedMode === 'true' && (savedMode === 'template' || savedMode === 'editor')) {
      setMode(savedMode as CanvasMode);
    } else {
      setShowModeModal(true);
    }
    
    setIsHydrated(true);
  }, []);

  const handleModeSelect = (selectedMode: 'template' | 'editor') => {
    setMode(selectedMode);
    localStorage.setItem(CANVAS_MODE_KEY, selectedMode);
    localStorage.setItem(CANVAS_MODE_SELECTED_KEY, 'true');
    setShowModeModal(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    setLoadTemplateId(templateId);
    setMode('template');
    localStorage.setItem(CANVAS_MODE_KEY, 'template');
    localStorage.setItem(CANVAS_MODE_SELECTED_KEY, 'true');
  };

  const handleBackToModeSelection = () => {
    setMode(null);
    setLoadTemplateId(null);
    setShowModeModal(true);
  };

  const handleCloseClick = () => {
    setShowCloseModal(true);
  };

  const handleSaveAndClose = () => {
    setShowCloseModal(false);
    router.push('/dashboard');
  };

  const handleDiscardAndClose = () => {
    // FIXED: Clear ALL canvas-related localStorage items
    localStorage.removeItem('canvas-editor-state');
    localStorage.removeItem('canvas-templates');
    localStorage.removeItem(CANVAS_MODE_KEY);
    localStorage.removeItem(CANVAS_MODE_SELECTED_KEY);
    
    setShowCloseModal(false);
    router.push('/dashboard');
  };

  const handleCancelClose = () => {
    setShowCloseModal(false);
  };

  const handleModeModalClose = () => {
    if (!mode) {
      setMode('editor');
      localStorage.setItem(CANVAS_MODE_KEY, 'editor');
      localStorage.setItem(CANVAS_MODE_SELECTED_KEY, 'true');
    }
    setShowModeModal(false);
  };

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto"></div>
          </div>
          <p className="text-stone-600 dark:text-stone-400">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (mode === 'template') {
    return (
      <>
        <TemplateCreator 
          onBack={handleBackToModeSelection}
          onClose={handleCloseClick}
          existingTemplateId={loadTemplateId || undefined}
        />
        <CloseConfirmationModal
          isOpen={showCloseModal}
          onSave={handleSaveAndClose}
          onDiscard={handleDiscardAndClose}
          onCancel={handleCancelClose}
        />
      </>
    );
  }

  if (mode === 'editor') {
    return (
      <>
        <Editor onClose={handleCloseClick} />
        <CloseConfirmationModal
          isOpen={showCloseModal}
          onSave={handleSaveAndClose}
          onDiscard={handleDiscardAndClose}
          onCancel={handleCancelClose}
        />
      </>
    );
  }

  return (
    <>
      <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Choose a mode to get started
          </p>
        </div>
      </div>

      <CanvasModeModal
        isOpen={showModeModal}
        onClose={handleModeModalClose}
        onSelectMode={handleModeSelect}
        onLoadTemplate={handleLoadTemplate}
      />
    </>
  );
}