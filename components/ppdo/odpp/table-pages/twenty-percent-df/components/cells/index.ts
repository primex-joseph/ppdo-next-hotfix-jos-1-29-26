/**
 * @deprecated These cells have been moved to @/components/ppdo/data-tables/cells
 * Please update your imports to use the new centralized location.
 * 
 * Before: import { ... } from "@/components/ppdo/twenty-percent-df/components/cells";
 * After:  import { ... } from "@/components/ppdo/data-tables";
 */

// Re-export from new centralized location for backward compatibility
export {
    TwentyPercentDFNameCell,
    TwentyPercentDFStatusCell,
    TwentyPercentDFAmountCell,
} from "@/components/ppdo/odpp/utilities/data-tables/cells";
