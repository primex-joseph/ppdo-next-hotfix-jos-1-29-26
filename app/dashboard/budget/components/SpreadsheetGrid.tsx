// components/SpreadsheetGrid.tsx
"use client"

import { SpreadsheetCell } from "./SpreadsheetCell"
import type { CellPosition, CellData } from "@/types/spreadsheet"

interface SpreadsheetGridProps {
  columns: string[]
  rows: number[]
  selectedCell: CellPosition
  cellData: CellData
  editingCell: string | null
  getCellKey: (row: number, col: number) => string
  onCellClick: (row: number, col: number) => void
  onCellDoubleClick: (row: number, col: number) => void
  onCellChange: (row: number, col: number, value: string) => void
  onEditingCellChange: (cell: string | null) => void
}

export function SpreadsheetGrid({
  columns,
  rows,
  selectedCell,
  cellData,
  editingCell,
  getCellKey,
  onCellClick,
  onCellDoubleClick,
  onCellChange,
  onEditingCellChange,
}: SpreadsheetGridProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Column Headers */}
        <div className="sticky top-0 z-20 flex bg-[#f8f9fa]">
          <div className="sticky left-0 z-30 h-[30px] w-[46px] border-b border-r border-gray-300 bg-[#f8f9fa]" />
          {columns.slice(0, 15).map((col) => (
            <div
              key={col}
              className="flex h-[30px] w-[100px] items-center justify-center border-b border-r border-gray-300 bg-[#f8f9fa] text-xs font-medium text-gray-700"
            >
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.slice(0, 25).map((row) => (
          <div key={row} className="flex">
            {/* Row Header */}
            <div className="sticky left-0 z-10 flex h-[21px] w-[46px] items-center justify-center border-b border-r border-gray-300 bg-[#f8f9fa] text-xs text-gray-700">
              {row}
            </div>

            {/* Cells */}
            {columns.slice(0, 15).map((col, colIndex) => {
              const cellKey = getCellKey(row, colIndex)
              const isSelected = selectedCell.row === row && selectedCell.col === colIndex
              const isEditing = editingCell === cellKey

              return (
                <SpreadsheetCell
                  key={cellKey}
                  cellKey={cellKey}
                  isSelected={isSelected}
                  isEditing={isEditing}
                  cellData={cellData}
                  onClick={() => onCellClick(row, colIndex)}
                  onDoubleClick={() => onCellDoubleClick(row, colIndex)}
                  onChange={(value) => onCellChange(row, colIndex, value)}
                  onBlur={() => onEditingCellChange(null)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}