// Core classes
export { PDFTailwindGenerator } from "./core/pdf-generator.js";
export {
  TailwindToPDFConverter,
  type StyleProperties,
} from "./styles/tailwind-converter.js";
export { FormHelpers } from "./utils/form-helpers.js";

// Types
export type {
  AccessibilityOptions,
  BarcodeFieldOptions,
  BaseFieldOptions,
  ButtonAction,
  ButtonOptions,
  CheckBoxOptions,
  ComboBoxOptions,
  ConditionalLogic,
  DateFieldOptions,
  DropdownOptions,
  FieldValidation,
  FormSection,
  FormTheme,
  ImageFieldOptions,
  ListBoxOptions,
  NumberFieldOptions,
  PageOptions,
  PDFGeneratorConfig,
  RadioGroupOptions,
  RadioOption,
  SignatureFieldOptions,
  TableFieldOptions,
  TailwindStyles,
  TextFieldOptions,
  ValidationRule,
} from "./types/index.js";

// Re-export commonly used PDF-lib types for convenience
export { cmyk, degrees, grayscale, rgb, StandardFonts } from "pdf-lib";

// Version
export const version = "1.0.0";
