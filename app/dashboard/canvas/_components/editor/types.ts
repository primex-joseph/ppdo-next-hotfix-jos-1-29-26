// app/dashboard/canvas/_components/editor/types.ts

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

export interface EditorState {
  pages: Page[];
  currentPageIndex: number;
  selectedElementId: string | null;
  isEditingElementId: string | null;
}