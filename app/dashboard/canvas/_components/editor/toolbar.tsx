'use client';

import { CanvasElement, TextElement } from '../editor';
import { loadGoogleFont } from '@/lib/fonts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Plus, Printer } from 'lucide-react';

interface ToolbarProps {
  selectedElement?: CanvasElement;
  onUpdateElement?: (updates: Partial<CanvasElement>) => void;
  onAddText: () => void;
  pageSize?: 'A4' | 'Short' | 'Long';
  onPageSizeChange?: (size: 'A4' | 'Short' | 'Long') => void;
  onPrint?: () => void;
}

const FONT_FAMILIES = [
  { value: 'font-sans', label: 'System Sans' },
  { value: 'font-serif', label: 'System Serif' },
  { value: 'font-mono', label: 'System Mono' },
  { value: 'Inter', label: 'Inter', fontFamily: 'Inter' },
  { value: 'Roboto', label: 'Roboto', fontFamily: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans', fontFamily: 'Open Sans' },
  { value: 'Lato', label: 'Lato', fontFamily: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat', fontFamily: 'Montserrat' },
];

const FONT_SIZES = [
  { value: '12', label: '12px' },
  { value: '14', label: '14px' },
  { value: '16', label: '16px' },
  { value: '18', label: '18px' },
  { value: '20', label: '20px' },
  { value: '24', label: '24px' },
  { value: '28', label: '28px' },
  { value: '32', label: '32px' },
  { value: '36', label: '36px' },
  { value: '48', label: '48px' },
];

export default function Toolbar({ selectedElement, onUpdateElement, onAddText, pageSize = 'A4', onPageSizeChange, onPrint }: ToolbarProps) {
  const isDisabled = !selectedElement || !onUpdateElement;
  const isTextElement = selectedElement?.type === 'text';

  const handleFontFamilyChange = (value: string) => {
    loadGoogleFont(value);
    
    if (onUpdateElement) {
      onUpdateElement({ fontFamily: value });
    }
  };

  const handleFontSizeChange = (value: string) => {
    if (onUpdateElement) {
      onUpdateElement({ fontSize: parseInt(value) });
    }
  };

  const textElement = selectedElement?.type === 'text' ? selectedElement : null;

  const toggleBold = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ bold: !textElement.bold });
    }
  };

  const toggleItalic = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ italic: !textElement.italic });
    }
  };

  const toggleUnderline = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ underline: !textElement.underline });
    }
  };

  const toggleShadow = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ shadow: !textElement.shadow });
    }
  };

  const toggleOutline = () => {
    if (onUpdateElement && textElement) {
      onUpdateElement({ outline: !textElement.outline });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-50 no-print">
      <div className="flex items-center gap-3 px-6 py-3">
        <Button
          onClick={onAddText}
          size="sm"
          className="gap-2"
          variant="default"
        >
          <Plus className="w-4 h-4" />
          Add Text
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Select value={pageSize} onValueChange={onPageSizeChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="Short">Short (8.5 x 11")</SelectItem>
            <SelectItem value="Long">Long (8.5 x 13")</SelectItem>
          </SelectContent>
        </Select>

        {isTextElement && (
          <>
            <Separator orientation="vertical" className="h-6" />

            <Select value={textElement?.fontFamily || 'font-sans'} onValueChange={handleFontFamilyChange} disabled={isDisabled}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedElement?.fontSize.toString() || '16'} onValueChange={handleFontSizeChange} disabled={isDisabled}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            <Button
              onClick={toggleBold}
              size="sm"
              variant={selectedElement?.bold ? 'default' : 'outline'}
              disabled={isDisabled}
              className="w-10 p-0"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>

            <Button
              onClick={toggleItalic}
              size="sm"
              variant={selectedElement?.italic ? 'default' : 'outline'}
              disabled={isDisabled}
              className="w-10 p-0"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>

            <Button
              onClick={toggleUnderline}
              size="sm"
              variant={selectedElement?.underline ? 'default' : 'outline'}
              disabled={isDisabled}
              className="w-10 p-0"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-600">Color:</label>
              <input
                type="color"
                value={selectedElement?.color || '#000000'}
                onChange={(e) => onUpdateElement?.({ color: e.target.value })}
                disabled={isDisabled}
                className="w-8 h-8 border border-stone-200 rounded cursor-pointer"
              />
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              onClick={toggleShadow}
              size="sm"
              variant={selectedElement?.shadow ? 'default' : 'outline'}
              disabled={isDisabled}
              className="text-xs"
              title="Shadow"
            >
              Shadow
            </Button>

            <Button
              onClick={toggleOutline}
              size="sm"
              variant={selectedElement?.outline ? 'default' : 'outline'}
              disabled={isDisabled}
              className="text-xs"
              title="Outline"
            >
              Outline
            </Button>
          </>
        )}

        <Separator orientation="vertical" className="h-6 ml-auto" />

        <Button
          onClick={onPrint}
          size="sm"
          className="gap-2 bg-transparent"
          variant="outline"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>
    </div>
  );
}
