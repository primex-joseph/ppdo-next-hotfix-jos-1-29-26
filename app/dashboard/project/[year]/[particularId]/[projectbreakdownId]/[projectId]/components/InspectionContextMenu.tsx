"use client"

import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Edit2, Trash2 } from "lucide-react"
import { Inspection } from "../types/inspection"

interface InspectionContextMenuProps {
  x: number
  y: number
  inspection: Inspection
  onEdit?: (inspection: Inspection) => void
  onDelete?: (inspection: Inspection) => void
  onViewDetails: (inspection: Inspection) => void
  onClose: () => void
}

export function InspectionContextMenu({
  x,
  y,
  inspection,
  onEdit,
  onDelete,
  onViewDetails,
  onClose,
}: InspectionContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = () => onClose()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onViewDetails(inspection)
          onClose()
        }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
      >
        <Eye className="h-4 w-4" />
        View Details
      </button>

      {onEdit && (
        <button
          onClick={() => {
            onEdit(inspection)
            onClose()
          }}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          Edit
        </button>
      )}

      {onDelete && (
        <>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
          <button
            onClick={() => {
              onDelete(inspection)
              onClose()
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </>
      )}
    </div>
  )
}
