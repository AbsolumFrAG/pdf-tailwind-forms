# API Reference

Complete API reference for the PDF TailwindCSS Forms library.

## PDFGenerator Class

The main class for generating interactive PDFs with TailwindCSS styling.

### Constructor

```typescript
new PDFGenerator(options?: PDFGeneratorOptions)
```

Creates a new PDFGenerator instance with optional configuration.

**Parameters:**
- `options` (optional): Configuration options for the generator

**Example:**
```typescript
const generator = new PDFGenerator({
  tailwindCDN: 'https://cdn.tailwindcss.com',
  defaultFontSize: 14,
  defaultBorderWidth: 2
});
```

### Methods

#### generate()

```typescript
async generate(config: GenerateConfig): Promise<GenerationResult>
```

Generates a styled PDF with TailwindCSS and interactive AcroForms.

**Parameters:**
- `config`: Generation configuration object

**Returns:** Promise resolving to `GenerationResult`

**Throws:** Error if generation fails

**Example:**
```typescript
const result = await generator.generate({
  content: '<div class="p-8"><h1>Hello World</h1></div>',
  fields: [],
  outputPath: './output.pdf'
});
```

#### generateBatch()

```typescript
async generateBatch(configs: GenerateConfig[]): Promise<GenerationResult[]>
```

Generates multiple PDFs in batch processing mode.

**Parameters:**
- `configs`: Array of generation configurations

**Returns:** Promise resolving to array of `GenerationResult`

**Example:**
```typescript
const results = await generator.generateBatch([
  { content: '<div>Form 1</div>', fields: [] },
  { content: '<div>Form 2</div>', fields: [] }
]);
```

#### fillExistingPDF()

```typescript
async fillExistingPDF(
  pdfPath: string, 
  data: FillData, 
  outputPath?: string
): Promise<Uint8Array>
```

Loads and fills an existing PDF form with data.

**Parameters:**
- `pdfPath`: Path to existing PDF file
- `data`: Form data indexed by field names
- `outputPath` (optional): Path to save filled PDF

**Returns:** Promise resolving to filled PDF bytes

**Example:**
```typescript
const filledBytes = await generator.fillExistingPDF(
  './template.pdf',
  { name: 'John Doe', email: 'john@example.com' },
  './filled.pdf'
);
```

#### extractFormData()

```typescript
async extractFormData(pdfPath: string): Promise<FillData>
```

Extracts form data from an existing PDF.

**Parameters:**
- `pdfPath`: Path to PDF file

**Returns:** Promise resolving to extracted form data

**Example:**
```typescript
const data = await generator.extractFormData('./submitted-form.pdf');
console.log(data); // { name: 'John Doe', email: 'john@example.com' }
```

#### validateConfig()

```typescript
validateConfig(config: GenerateConfig): string[]
```

Validates configuration before PDF generation.

**Parameters:**
- `config`: Configuration to validate

**Returns:** Array of validation error messages

**Example:**
```typescript
const errors = generator.validateConfig(config);
if (errors.length > 0) {
  console.error('Validation failed:', errors);
}
```

#### destroy()

```typescript
async destroy(): Promise<void>
```

Closes the browser and cleans up resources. Must be called to prevent memory leaks.

**Example:**
```typescript
try {
  const result = await generator.generate(config);
} finally {
  await generator.destroy(); // Always clean up
}
```

## PDFValidator Class

Validator for PDF generation configurations.

### Constructor

```typescript
new PDFValidator()
```

Creates a new validator instance.

### Methods

#### validate()

```typescript
validate(config: GenerateConfig): { valid: boolean; errors: string[] }
```

Validates a complete PDF generation configuration.

**Parameters:**
- `config`: Configuration object to validate

**Returns:** Validation result with success status and error list

**Example:**
```typescript
const validator = new PDFValidator();
const result = validator.validate(config);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Template Functions

### createFormTemplate()

```typescript
createFormTemplate(options: FormTemplateOptions): GenerateConfig
```

Creates a styled form template with TailwindCSS.

**Parameters:**
- `options`: Form configuration options

**Returns:** `GenerateConfig` ready for PDF generation

**Example:**
```typescript
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';

const config = createFormTemplate({
  title: 'Contact Form',
  theme: 'blue',
  fields: [
    { label: 'Name', name: 'name', type: 'text', required: true }
  ]
});
```

### createInvoiceTemplate()

```typescript
createInvoiceTemplate(data: InvoiceData): GenerateConfig
```

Creates a professional invoice template with automatic calculations.

**Parameters:**
- `data`: Invoice data including company, client, and line items

**Returns:** `GenerateConfig` ready for PDF generation

**Example:**
```typescript
import { createInvoiceTemplate } from 'pdf-tailwind-forms/templates/invoice';

const config = createInvoiceTemplate({
  companyName: 'Acme Corp',
  clientName: 'Client Inc.',
  items: [
    { description: 'Service', quantity: 1, price: 100.00 }
  ]
});
```

## Constants

### Default Values

```typescript
const DEFAULT_VALUES = {
  TAILWIND_CDN: 'https://cdn.tailwindcss.com',
  FONT_SIZE: 12,
  BORDER_WIDTH: 1,
  CHECKBOX_SIZE: 16,
  RADIO_SIZE: 15,
  RADIO_SPACING: 25,
  SIGNATURE_HEIGHT: 60,
  PDF_SCALE: 72 / 96  // Pixels to PDF points conversion
};
```

### Supported PDF Formats

```typescript
const PDF_FORMATS = [
  'A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'
] as const;

type PDFFormat = typeof PDF_FORMATS[number];
```

### Field Types

```typescript
const FIELD_TYPES = [
  'text', 'checkbox', 'radio', 'dropdown', 'button', 'signature'
] as const;

type FieldType = typeof FIELD_TYPES[number];
```

### Theme Colors

```typescript
const FORM_THEMES = {
  blue: 'from-blue-500 to-blue-700',
  green: 'from-green-500 to-green-700',
  purple: 'from-purple-500 to-purple-700',
  red: 'from-red-500 to-red-700'
} as const;

type FormTheme = keyof typeof FORM_THEMES;
```

## Error Types

### Common Errors

```typescript
// Configuration errors
class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Validation failed: ${errors.join(', ')}`);
  }
}

// Generation errors
class GenerationError extends Error {
  constructor(message: string, public step: 'html' | 'pdf' | 'fields') {
    super(`Generation failed at ${step}: ${message}`);
  }
}

// Field positioning errors
class PositioningError extends Error {
  constructor(fieldName: string, selector: string) {
    super(`Could not position field "${fieldName}" with selector "${selector}"`);
  }
}
```

### Error Handling Patterns

```typescript
// Type-safe error handling
function handleGenerationError(error: unknown): void {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof GenerationError) {
    console.error(`Generation failed at ${error.step}:`, error.message);
  } else if (error instanceof PositioningError) {
    console.error('Field positioning failed:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// Usage
try {
  await generator.generate(config);
} catch (error) {
  handleGenerationError(error);
}
```

## Type Imports

### Main Exports

```typescript
// Primary exports
import PDFGenerator, {
  // Core types
  PDFGeneratorOptions,
  GenerateConfig,
  GenerationResult,
  PDFMetadata,
  FillData,
  Position,
  
  // Field types
  FormField,
  BaseField,
  TextField,
  CheckboxField,
  RadioField,
  RadioOption,
  DropdownField,
  ButtonField,
  SignatureField
} from 'pdf-tailwind-forms';

// Validator
import { PDFValidator } from 'pdf-tailwind-forms/validator';

// Templates
import { createFormTemplate, FormTemplateOptions } from 'pdf-tailwind-forms/templates/form';
import { createInvoiceTemplate, InvoiceData } from 'pdf-tailwind-forms/templates/invoice';
```

### Selective Imports

```typescript
// Import only what you need
import { PDFGenerator } from 'pdf-tailwind-forms';
import type { TextField, CheckboxField } from 'pdf-tailwind-forms';

// Template-only imports
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';
import type { FormTemplateOptions } from 'pdf-tailwind-forms/templates/form';
```

## Type Compatibility

### Node.js Compatibility

```typescript
// Works with Node.js ≥ 18.0.0
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, 'output', 'form.pdf');
```

### ESM/CommonJS

```typescript
// ESM (recommended)
import PDFGenerator from 'pdf-tailwind-forms';

// CommonJS
const PDFGenerator = require('pdf-tailwind-forms').default;
const { createFormTemplate } = require('pdf-tailwind-forms/templates/form');
```

This API reference provides complete type information for all library components. For usage examples, see the main README.md file.