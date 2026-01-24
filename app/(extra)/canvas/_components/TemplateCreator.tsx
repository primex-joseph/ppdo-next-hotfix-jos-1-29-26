// app/(extra)/canvas/_components/TemplateCreator.tsx (UPDATED)

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, X } from 'lucide-react';
import { useTemplateStorage } from './editor/hooks/useTemplateStorage';
import { CanvasTemplate } from './editor/types/template';
import { generateId } from './editor/utils';
import { captureCanvasAsThumbnail, validateTemplate } from '@/lib/canvas-utils';

// Import editor components
import Toolbar from './editor/toolbar';
import Canvas from './editor/canvas';
import { Page, HeaderFooter, CanvasElement, ImageElement } from './editor/types';
import { useEditorState } from './editor/hooks/useEditorState';
import { useClipboard } from './editor/hooks/useClipboard';
import { useKeyboard } from './editor/hooks/useKeyboard';

interface TemplateCreatorProps {
  onBack: () => void;
  onClose?: () => void;
  existingTemplateId?: string;
}

type ActiveSection = 'header' | 'page' | 'footer';

export default function TemplateCreator({ onBack, onClose, existingTemplateId }: TemplateCreatorProps) {
  const { templates, addTemplate, updateTemplate, getTemplate } = useTemplateStorage();
  const existingTemplate = existingTemplateId ? getTemplate(existingTemplateId) : undefined;
  
  const [templateName, setTemplateName] = useState(existingTemplate?.name || 'Untitled Template');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Initialize with single page
  const initialPages: Page[] = existingTemplate 
    ? [{ 
        id: 'template-page', 
        size: existingTemplate.page.size,
        orientation: existingTemplate.page.orientation,
        backgroundColor: existingTemplate.page.backgroundColor,
        elements: existingTemplate.page.elements 
      }]
    : [{ 
        id: 'template-page', 
        size: 'A4', 
        orientation: 'portrait', 
        elements: [],
        backgroundColor: '#ffffff'
      }];

  const {
    pages,
    currentPage,
    selectedElementId,
    selectedElement,
    isEditingElementId,
    header,
    footer,
    setSelectedElementId,
    setIsEditingElementId,
    addText,
    addImage,
    updateElement,
    deleteElement,
    changePageSize,
    changeOrientation,
    updateHeaderBackground,
    updateFooterBackground,
    updatePageBackground,
  } = useEditorState(
    initialPages, 
    0,
    existingTemplate?.header || { elements: [] },
    existingTemplate?.footer || { elements: [] }
  );

  const [activeSection, setActiveSection] = useState<ActiveSection>('page');

  // Clipboard support
  useClipboard({
    currentPage,
    selectedElementId,
    isEditingElementId,
    onAddImage: (src) => addImage(src, activeSection),
    activeSection,
    header,
    footer,
  });

  // Keyboard shortcuts
  useKeyboard({
    selectedElementId,
    isEditingElementId,
    onDeleteElement: deleteElement,
  });

  const handleSaveTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setIsSaving(true);

    try {
      console.group('💾 SAVE TEMPLATE');
      console.log('Template Name:', templateName.trim());
      console.log('Template ID:', existingTemplate?.id || `template-${generateId()}`);
      console.log('Is Update:', !!existingTemplate);
      console.log('Page Size:', currentPage.size);
      console.log('Page Orientation:', currentPage.orientation);
      console.log('Page Background:', currentPage.backgroundColor);
      console.log('Page Elements:', currentPage.elements.length);
      console.log('Header Elements:', header.elements.length);
      console.log('Footer Elements:', footer.elements.length);
      console.log('Header Background:', header.backgroundColor);
      console.log('Footer Background:', footer.backgroundColor);
      
      // Log detailed elements
      console.group('📄 Page Elements Details');
      currentPage.elements.forEach((el, idx) => {
        console.log(`Element ${idx + 1}:`, {
          type: el.type,
          id: el.id,
          ...(el.type === 'text' && { text: el.text, fontSize: el.fontSize }),
          ...(el.type === 'image' && { src: el.src?.substring(0, 50) + '...', width: el.width, height: el.height }),
          x: el.x,
          y: el.y,
        });
      });
      console.groupEnd();

      console.group('📋 Header Elements Details');
      header.elements.forEach((el, idx) => {
        console.log(`Header Element ${idx + 1}:`, {
          type: el.type,
          id: el.id,
          ...(el.type === 'text' && { text: el.text, fontSize: el.fontSize }),
          ...(el.type === 'image' && { src: el.src?.substring(0, 50) + '...', width: el.width, height: el.height }),
          x: el.x,
          y: el.y,
        });
      });
      console.groupEnd();

      console.group('📋 Footer Elements Details');
      footer.elements.forEach((el, idx) => {
        console.log(`Footer Element ${idx + 1}:`, {
          type: el.type,
          id: el.id,
          ...(el.type === 'text' && { text: el.text, fontSize: el.fontSize }),
          ...(el.type === 'image' && { src: el.src?.substring(0, 50) + '...', width: el.width, height: el.height }),
          x: el.x,
          y: el.y,
        });
      });
      console.groupEnd();

      // Capture thumbnail
      console.log('📸 Capturing thumbnail...');
      const thumbnail = await captureCanvasAsThumbnail('template-canvas-container', 300, 400);
      console.log('✅ Thumbnail captured, size:', thumbnail.length, 'characters');
      
      const template: CanvasTemplate = {
        id: existingTemplate?.id || `template-${generateId()}`,
        name: templateName.trim(),
        thumbnail,
        createdAt: existingTemplate?.createdAt || Date.now(),
        updatedAt: Date.now(),
        header,
        footer,
        page: {
          size: currentPage.size,
          orientation: currentPage.orientation,
          backgroundColor: currentPage.backgroundColor,
          elements: currentPage.elements,
        },
        category: 'custom',
      };

      // Validate template
      console.log('🔍 Validating template...');
      const validation = validateTemplate(template);
      console.log('Validation result:', validation);
      
      if (!validation.valid) {
        console.error('❌ Validation failed:', validation.errors);
        toast.error(validation.errors[0]);
        console.groupEnd();
        return;
      }

      console.log('✅ Template validated successfully');
      console.log('💾 Saving to localStorage...');

      if (existingTemplate) {
        updateTemplate(template.id, template);
        console.log('✅ Template updated in localStorage');
        toast.success('Template updated successfully');
      } else {
        addTemplate(template);
        console.log('✅ Template added to localStorage');
        toast.success('Template saved successfully');
      }

      console.log('📦 Final Template Object:', template);
      console.groupEnd();

      // Small delay before navigating back
      setTimeout(() => {
        onBack();
      }, 500);
    } catch (error) {
      console.error('❌ Failed to save template:', error);
      console.groupEnd();
      toast.error('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [templateName, header, footer, currentPage, existingTemplate, addTemplate, updateTemplate, onBack]);

  const handleImageDropped = useCallback((image: any) => {
    if (image.dataUrl) {
      addImage(image.dataUrl, activeSection);
    }
  }, [addImage, activeSection]);

  return (
    <div className="h-screen bg-stone-50 dark:bg-stone-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            disabled={isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="border-l border-stone-300 dark:border-stone-600 pl-4">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-stone-900 dark:text-stone-100 w-64"
              placeholder="Template Name"
              maxLength={50}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            disabled={isSaving}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            size="sm"
            disabled={isSaving}
            className="bg-[#4FBA76] hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : existingTemplate ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      {!showPreview && (
        <div className="sticky top-0 z-10 flex-shrink-0">
          <Toolbar
            selectedElement={selectedElement}
            onUpdateElement={selectedElement ? (updates) => updateElement(selectedElement.id, updates) : undefined}
            onAddText={() => addText(activeSection)}
            pageSize={currentPage.size}
            orientation={currentPage.orientation}
            onPageSizeChange={changePageSize}
            onOrientationChange={changeOrientation}
            activeSection={activeSection}
            headerBackgroundColor={header.backgroundColor || '#ffffff'}
            footerBackgroundColor={footer.backgroundColor || '#ffffff'}
            pageBackgroundColor={currentPage.backgroundColor || '#ffffff'}
            onHeaderBackgroundChange={updateHeaderBackground}
            onFooterBackgroundChange={updateFooterBackground}
            onPageBackgroundChange={updatePageBackground}
            pages={pages}
            header={header}
            footer={footer}
          />
        </div>
      )}

      {/* Canvas Area */}
      <div 
        className="flex-1 overflow-y-auto flex items-start justify-center pt-8 pb-16 px-8" 
        id="template-canvas-container"
      >
        <div className={showPreview ? 'pointer-events-none' : ''}>
          <Canvas
            page={currentPage}
            selectedElementId={showPreview ? null : selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            isEditingElementId={isEditingElementId}
            onEditingChange={setIsEditingElementId}
            header={header}
            footer={footer}
            pageNumber={1}
            totalPages={1}
            activeSection={activeSection}
            onActiveSectionChange={setActiveSection}
            onImageDropped={handleImageDropped}
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border-t border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span>
              <strong>Template Mode:</strong> Design header, footer, and background elements. This template can be applied to multiple pages.
            </span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {currentPage.elements.length} element(s) | {header.elements.length} header | {footer.elements.length} footer
          </div>
        </div>
      </div>
    </div>
  );
}