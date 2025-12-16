// types/spreadsheet.ts
export interface CellPosition {
  row: number
  col: number
}

export interface CellData {
  [key: string]: string
}