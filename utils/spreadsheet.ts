// utils/spreadsheet.ts
export const getCellKey = (row: number, col: number, columns: string[]): string => 
  `${columns[col]}${row}`