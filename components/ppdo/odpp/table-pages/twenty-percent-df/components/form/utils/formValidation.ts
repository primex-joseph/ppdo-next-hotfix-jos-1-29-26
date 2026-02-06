
/**
 * @deprecated These utilities have been moved to @/components/ppdo/odpp/common/utils
 * Please update your imports to use the new centralized location.
 * 
 * Before: import { twentyPercentDFSchema, TwentyPercentDFFormValues } from "./utils/formValidation";
 * After:  import { baseProjectSchema, BaseProjectFormValues } from "@/components/ppdo/odpp/common/utils";
 */

export {
    baseProjectSchema as twentyPercentDFSchema,
    type BaseProjectFormValues as TwentyPercentDFFormValues,
} from "@/components/ppdo/odpp/utilities/common/utils/formValidation";
