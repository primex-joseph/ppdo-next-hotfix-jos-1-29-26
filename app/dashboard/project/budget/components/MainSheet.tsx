// app/dashboard/project/budget/components/MainSheet.tsx

"use client";

import { Spreadsheet } from "@/components/spreadsheet";
import { BUDGET_SPREADSHEET_CONFIG } from "../config/budgetSpreadsheetConfig";

export default function MainSheet() {
  return (
    <Spreadsheet 
      config={BUDGET_SPREADSHEET_CONFIG}
    />
  );
}