export { PDFGenerator as default } from "./pdf-generator";
export * from "./pdf-generator";

// Re-export pour faciliter l'importation
export {
  PDFGenerator,
  type PDFGeneratorOptions,
  type Position,
  type BaseField,
  type TextField,
  type CheckboxField,
  type RadioField,
  type RadioOption,
  type DropdownField,
  type ButtonField,
  type SignatureField,
  type FormField,
  type GenerateConfig,
  type PDFMetadata,
  type FillData,
  type GenerationResult,
} from "./pdf-generator";
