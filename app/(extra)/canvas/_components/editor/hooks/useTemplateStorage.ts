// app/(extra)/canvas/_components/editor/hooks/useTemplateStorage.ts (NEW FILE)

import { useState, useEffect, useCallback } from 'react';
import { CanvasTemplate } from '../types/template';
import { generateId } from '../utils';

const STORAGE_KEY = 'canvas-templates';
const DEFAULT_TEMPLATES_KEY = 'canvas-default-templates-loaded';

/**
 * Hook for managing template storage in localStorage
 * Provides CRUD operations for canvas templates
 */
export const useTemplateStorage = () => {
  const [templates, setTemplates] = useState<CanvasTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedTemplates = JSON.parse(stored);
        setTemplates(loadedTemplates);
      } else {
        // Initialize with default blank template
        const defaultTemplates = getDefaultTemplates();
        setTemplates(defaultTemplates);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTemplates));
        localStorage.setItem(DEFAULT_TEMPLATES_KEY, 'true');
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback to default templates
      const defaultTemplates = getDefaultTemplates();
      setTemplates(defaultTemplates);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = useCallback((newTemplates: CanvasTemplate[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
      setTemplates(newTemplates);
    } catch (error) {
      console.error('Failed to save templates:', error);
      throw new Error('Failed to save templates to storage');
    }
  }, []);

  // Add new template
  const addTemplate = useCallback((template: CanvasTemplate) => {
    const newTemplates = [...templates, template];
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  // Update existing template
  const updateTemplate = useCallback((id: string, updates: Partial<CanvasTemplate>) => {
    const newTemplates = templates.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  // Delete template
  const deleteTemplate = useCallback((id: string) => {
    // Prevent deleting default templates
    const template = templates.find(t => t.id === id);
    if (template?.isDefault) {
      throw new Error('Cannot delete default templates');
    }
    const newTemplates = templates.filter(t => t.id !== id);
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  // Get single template by ID
  const getTemplate = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  // Duplicate template
  const duplicateTemplate = useCallback((id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }

    const duplicated: CanvasTemplate = {
      ...template,
      id: `template-${generateId()}`,
      name: `${template.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
    };

    addTemplate(duplicated);
    return duplicated;
  }, [templates, addTemplate]);

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    duplicateTemplate,
  };
};

/**
 * Create default blank template
 */
function createBlankTemplate(): CanvasTemplate {
  return {
    id: 'blank-template',
    name: 'Blank Template',
    description: 'Start from scratch with a clean canvas',
    thumbnail: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    header: { elements: [], backgroundColor: '#ffffff' },
    footer: { elements: [], backgroundColor: '#ffffff' },
    page: {
      size: 'A4',
      orientation: 'portrait',
      backgroundColor: '#ffffff',
      elements: [],
    },
    category: 'custom',
    isDefault: true,
  };
}

/**
 * Get default templates
 */
function getDefaultTemplates(): CanvasTemplate[] {
  return [
    createBlankTemplate(),
    // Add more default templates here as needed
  ];
}