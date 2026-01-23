import { Page, CanvasElement } from '@/components/editor';

const PAGE_SIZES: Record<string, { width: number; height: number; widthInch: number; heightInch: number }> = {
  A4: { width: 595, height: 842, widthInch: 8.27, heightInch: 11.69 },
  Short: { width: 612, height: 792, widthInch: 8.5, heightInch: 11 },
  Long: { width: 612, height: 936, widthInch: 8.5, heightInch: 13 },
};

export function printAllPages(pages: Page[]) {
  // Create a print container
  const printContainer = document.createElement('div');
  printContainer.id = '__print-container';
  printContainer.className = 'print-only';
  printContainer.style.position = 'absolute';
  printContainer.style.left = '-9999px';
  printContainer.style.top = '0';
  printContainer.style.width = '100%';

  // Render all pages
  pages.forEach((page, pageIndex) => {
    const pageSize = PAGE_SIZES[page.size] || PAGE_SIZES.A4;

    // Create page wrapper
    const pageDiv = document.createElement('div');
    pageDiv.className = 'print-page';
    pageDiv.style.width = `${pageSize.width}px`;
    pageDiv.style.height = `${pageSize.height}px`;
    pageDiv.style.position = 'relative';
    pageDiv.style.backgroundColor = '#ffffff';
    pageDiv.style.marginBottom = '0';
    pageDiv.style.boxSizing = 'border-box';

    // Add page break (except for last page)
    if (pageIndex < pages.length - 1) {
      pageDiv.style.pageBreakAfter = 'always';
    }

    // Render all elements (text and images) - skip hidden elements
    page.elements.forEach((element: CanvasElement) => {
      // Skip hidden elements when printing
      if (element.visible === false) return;
      
      if (element.type === 'text') {
        const textDiv = document.createElement('div');
        textDiv.style.position = 'absolute';
        textDiv.style.left = `${element.x}px`;
        textDiv.style.top = `${element.y}px`;
        textDiv.style.width = `${element.width}px`;
        textDiv.style.height = `${element.height}px`;
        textDiv.style.fontSize = `${element.fontSize}px`;
        textDiv.style.fontWeight = element.bold ? '700' : '400';
        textDiv.style.fontStyle = element.italic ? 'italic' : 'normal';
        textDiv.style.textDecoration = element.underline ? 'underline' : 'none';
        textDiv.style.color = element.color;
        textDiv.style.overflow = 'hidden';
        textDiv.style.wordWrap = 'break-word';
        textDiv.style.whiteSpace = 'pre-wrap';

        // Handle Google Fonts
        const googleFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
        if (googleFonts.includes(element.fontFamily)) {
          textDiv.style.fontFamily = `'${element.fontFamily}', sans-serif`;
        } else if (element.fontFamily === 'font-serif') {
          textDiv.style.fontFamily = 'Georgia, serif';
        } else if (element.fontFamily === 'font-mono') {
          textDiv.style.fontFamily = 'monospace';
        } else {
          textDiv.style.fontFamily = 'sans-serif';
        }

        textDiv.textContent = element.text;
        pageDiv.appendChild(textDiv);
      } else if (element.type === 'image') {
        const imgDiv = document.createElement('img');
        imgDiv.src = element.src;
        imgDiv.style.position = 'absolute';
        imgDiv.style.left = `${element.x}px`;
        imgDiv.style.top = `${element.y}px`;
        imgDiv.style.width = `${element.width}px`;
        imgDiv.style.height = `${element.height}px`;
        imgDiv.style.objectFit = 'contain';
        pageDiv.appendChild(imgDiv);
      }
    });

    printContainer.appendChild(pageDiv);
  });

  document.body.appendChild(printContainer);

  // Wait for fonts to load, then print
  setTimeout(() => {
    window.print();
    // Clean up
    document.body.removeChild(printContainer);
  }, 100);
}
