# TypeScript Type Reference

Complete reference for all TypeScript types and interfaces in the PDF TailwindCSS Forms library.

## Core Types

### PDFGeneratorOptions

Configuration options for the main PDFGenerator class.

```typescript
interface PDFGeneratorOptions {
  tailwindCDN?: string;           // Default: "https://cdn.tailwindcss.com"
  puppeteerOptions?: any;         // Puppeteer launch options
  defaultFontSize?: number;       // Default: 12 points
  defaultBorderWidth?: number;    // Default: 1 point
}
```

**Usage:**
```typescript
const generator = new PDFGenerator({
  tailwindCDN: 'https://cdn.tailwindcss.com/3.4.0',
  defaultFontSize: 14,
  defaultBorderWidth: 2,
  puppeteerOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-web-security']
  }
});
```

### Position

Coordinate position and dimensions for form field placement.

```typescript
interface Position {
  x: number;        // X coordinate in pixels or PDF points
  y: number;        // Y coordinate in pixels or PDF points  
  width: number;    // Width in pixels or PDF points
  height: number;   // Height in pixels or PDF points
  pdfY?: number;    // Y coordinate adjusted for PDF coordinate system
}
```

**Coordinate Systems:**
- **Browser**: Origin (0,0) at top-left, Y increases downward
- **PDF**: Origin (0,0) at bottom-left, Y increases upward
- **Conversion**: Library automatically handles coordinate system transformation

### GenerateConfig

Main configuration object for PDF generation.

```typescript
interface GenerateConfig {
  content: string;                // HTML content to render
  customCSS?: string;             // Additional CSS styles
  fields?: FormField[];           // Interactive form fields
  outputPath?: string;            // File path to save PDF
  pdfOptions?: PDFOptions;        // Puppeteer PDF options
  metadata?: PDFMetadata;         // PDF document metadata
}
```

**Complete Example:**
```typescript
const config: GenerateConfig = {
  content: `
    <div class="p-8 max-w-2xl mx-auto bg-white">
      <h1 class="text-3xl font-bold mb-6">Application Form</h1>
      <div class="name-input border rounded p-3 mb-4"></div>
      <div class="email-input border rounded p-3 mb-4"></div>
      <div class="submit-area bg-blue-500 text-white p-3 rounded text-center"></div>
    </div>
  `,
  customCSS: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    body { font-family: 'Inter', sans-serif; }
  `,
  fields: [
    {
      name: 'fullName',
      type: 'text',
      selector: '.name-input',
      required: true,
      fontSize: 14
    },
    {
      name: 'email', 
      type: 'text',
      selector: '.email-input',
      required: true
    },
    {
      name: 'submit',
      type: 'button',
      selector: '.submit-area',
      label: 'Submit Application',
      action: 'submit'
    }
  ],
  outputPath: './application.pdf',
  pdfOptions: {
    format: 'A4',
    margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
  },
  metadata: {
    title: 'Application Form',
    author: 'Your Company',
    subject: 'Job Application'
  }
};
```

### PDFMetadata

PDF document metadata configuration.

```typescript
interface PDFMetadata {
  title?: string;           // Document title
  author?: string;          // Document author
  subject?: string;         // Document subject
  keywords?: string[];      // Keywords for indexing
  creator?: string;         // Creating application
  producer?: string;        // PDF producer
  creationDate?: Date;      // Creation timestamp
  modificationDate?: Date;  // Last modified timestamp
}
```

**Best Practices:**
```typescript
const metadata: PDFMetadata = {
  title: 'Customer Registration Form',
  author: 'Acme Corporation',
  subject: 'Customer Registration',
  keywords: ['form', 'registration', 'customer', 'onboarding'],
  creator: 'Acme CRM System v2.1',
  producer: 'PDF TailwindCSS Forms Library',
  creationDate: new Date(),
  modificationDate: new Date()
};
```

## Form Field Types

### BaseField

Base interface inherited by all field types.

```typescript
interface BaseField {
  name: string;                           // Unique field identifier
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'button' | 'signature';
  selector?: string;                      // CSS selector for positioning
  position?: Position;                    // Absolute position (alternative to selector)
  offsetX?: number;                       // Horizontal offset in points
  offsetY?: number;                       // Vertical offset in points
  width?: number;                         // Field width override
  height?: number;                        // Field height override
  borderWidth?: number;                   // Border thickness
  backgroundColor?: [number, number, number];  // RGB background color
  borderColor?: [number, number, number];      // RGB border color
  fontSize?: number;                      // Font size in points
  fontColor?: [number, number, number];   // RGB font color
  required?: boolean;                     // Required field flag
}
```

### TextField

Text input field with rich configuration options.

```typescript
interface TextField extends BaseField {
  type: 'text';
  defaultValue?: string;                  // Pre-filled text
  multiline?: boolean;                    // Enable textarea behavior
  maxLength?: number;                     // Character limit
  password?: boolean;                     // Hide input text
  alignment?: 'left' | 'center' | 'right';  // Text alignment
}
```

**Examples:**
```typescript
// Single-line text input
const nameField: TextField = {
  name: 'fullName',
  type: 'text',
  selector: '.name-input',
  defaultValue: '',
  maxLength: 100,
  required: true,
  fontSize: 12,
  alignment: 'left'
};

// Multiline textarea
const commentsField: TextField = {
  name: 'comments',
  type: 'text',
  selector: '.comments-area',
  multiline: true,
  height: 100,
  maxLength: 1000
};

// Password field
const passwordField: TextField = {
  name: 'password',
  type: 'text',
  selector: '.password-input',
  password: true,
  required: true,
  maxLength: 50
};
```

### CheckboxField

Checkbox input with configurable size and default state.

```typescript
interface CheckboxField extends BaseField {
  type: 'checkbox';
  defaultValue?: boolean;      // Default checked state
  size?: number;               // Checkbox size in points
}
```

**Example:**
```typescript
const agreeTerms: CheckboxField = {
  name: 'agreeToTerms',
  type: 'checkbox',
  selector: '.terms-checkbox',
  defaultValue: false,
  size: 16,
  required: true
};
```

### RadioField & RadioOption

Radio button groups with multiple options.

```typescript
interface RadioOption {
  value: string;      // Submitted value
  label?: string;     // Display label
}

interface RadioField extends BaseField {
  type: 'radio';
  options: RadioOption[];     // Array of radio options
  defaultValue?: string;      // Default selected value
  spacing?: number;           // Vertical spacing between options
  size?: number;              // Radio button size
}
```

**Example:**
```typescript
const priorityField: RadioField = {
  name: 'priority',
  type: 'radio',
  selector: '.priority-group',
  options: [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ],
  defaultValue: 'medium',
  spacing: 30,
  size: 14,
  required: true
};
```

### DropdownField

Select dropdown with configurable options.

```typescript
interface DropdownField extends BaseField {
  type: 'dropdown';
  options: string[];          // Selectable options
  defaultValue?: string;      // Default selection
  editable?: boolean;         // Allow custom input
}
```

**Examples:**
```typescript
// Standard dropdown
const countryField: DropdownField = {
  name: 'country',
  type: 'dropdown',
  selector: '.country-select',
  options: ['United States', 'Canada', 'United Kingdom', 'Australia'],
  defaultValue: 'United States',
  editable: false,
  required: true
};

// Editable dropdown (combo box)
const cityField: DropdownField = {
  name: 'city',
  type: 'dropdown',
  selector: '.city-select',
  options: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  editable: true,  // Users can type custom cities
  fontSize: 11
};
```

### ButtonField

Interactive buttons with configurable actions.

```typescript
interface ButtonField extends BaseField {
  type: 'button';
  label: string;                          // Button display text
  action?: 'submit' | 'reset' | 'javascript';  // Button action
  javascript?: string;                    // Custom JavaScript code
}
```

**Examples:**
```typescript
// Submit button
const submitBtn: ButtonField = {
  name: 'submitForm',
  type: 'button',
  selector: '.submit-button',
  label: 'Submit Form',
  action: 'submit',
  fontSize: 14,
  backgroundColor: [34, 197, 94],  // Green background
  fontColor: [255, 255, 255]      // White text
};

// Reset button
const resetBtn: ButtonField = {
  name: 'resetForm',
  type: 'button',
  selector: '.reset-button',
  label: 'Clear Form',
  action: 'reset'
};

// Custom JavaScript button
const calculateBtn: ButtonField = {
  name: 'calculate',
  type: 'button',
  selector: '.calc-button',
  label: 'Calculate Total',
  action: 'javascript',
  javascript: 'this.getField("total").value = this.getField("price").value * this.getField("quantity").value;'
};
```

### SignatureField

Digital signature capture areas.

```typescript
interface SignatureField extends BaseField {
  type: 'signature';
  // Inherits all BaseField properties
  // Typically uses larger height (60-100 points)
}
```

**Example:**
```typescript
const signatureField: SignatureField = {
  name: 'clientSignature',
  type: 'signature',
  selector: '.signature-area',
  height: 80,
  borderWidth: 2,
  borderColor: [100, 100, 100],
  backgroundColor: [250, 250, 250]
};
```

### FormField Union Type

Union type representing all possible form field types.

```typescript
type FormField = 
  | TextField 
  | CheckboxField 
  | RadioField 
  | DropdownField 
  | ButtonField 
  | SignatureField;
```

**Type Guards:**
```typescript
function isTextField(field: FormField): field is TextField {
  return field.type === 'text';
}

function processField(field: FormField) {
  switch (field.type) {
    case 'text':
      // TypeScript knows this is TextField
      console.log(field.multiline);
      break;
    case 'checkbox':
      // TypeScript knows this is CheckboxField
      console.log(field.defaultValue);
      break;
    // ... other cases
  }
}
```

## Utility Types

### FillData

Data structure for filling existing PDF forms.

```typescript
interface FillData {
  [fieldName: string]: string | boolean | number;
}
```

**Usage:**
```typescript
const formData: FillData = {
  'fullName': 'John Doe',
  'email': 'john@example.com',
  'age': 30,
  'agreeTerms': true,
  'priority': 'high'
};

await generator.fillExistingPDF('./template.pdf', formData);
```

### GenerationResult

Result object returned after successful PDF generation.

```typescript
interface GenerationResult {
  bytes: Uint8Array;    // PDF content as bytes
  path?: string;        // File path if saved to disk
  fieldCount: number;   // Number of interactive fields added
  pageCount: number;    // Number of pages in PDF
}
```

**Usage:**
```typescript
const result: GenerationResult = await generator.generate(config);

console.log(`Generated ${result.pageCount} pages with ${result.fieldCount} fields`);

// Save to different location
if (result.bytes) {
  await fs.writeFile('./backup.pdf', result.bytes);
}

// Check if saved to disk
if (result.path) {
  console.log(`PDF saved to: ${result.path}`);
}
```

## Template Types

### FormTemplateOptions

Configuration for the generic form template.

```typescript
interface FormTemplateOptions {
  title: string;
  description?: string;
  theme?: 'blue' | 'green' | 'purple' | 'red';
  fields: Array<{
    label: string;
    name: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox';
    required?: boolean;
    options?: string[];
  }>;
  submitLabel?: string;
}
```

### InvoiceData

Data structure for invoice template generation.

```typescript
interface InvoiceData {
  // Required fields
  companyName: string;
  clientName: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;

  // Optional fields
  invoiceNumber?: string;
  date?: string;
  dueDate?: string;
  companyAddress?: string;
  clientAddress?: string;
  tax?: number;
  currency?: string;
}
```

## Color Values

All color properties accept RGB values in two formats:

```typescript
type RGBColor = [number, number, number];

// Format 1: 0-255 range (standard RGB)
const redColor: RGBColor = [255, 0, 0];
const blueColor: RGBColor = [0, 123, 255];

// Format 2: 0-1 range (PDF standard)
const redColor: RGBColor = [1.0, 0.0, 0.0];
const blueColor: RGBColor = [0.0, 0.48, 1.0];

// Library automatically normalizes both formats
```

## Validation Types

### Validation Result

```typescript
interface ValidationResult {
  valid: boolean;       // Whether configuration is valid
  errors: string[];     // Array of error messages
}
```

**Usage:**
```typescript
const validator = new PDFValidator();
const result: ValidationResult = validator.validate(config);

if (!result.valid) {
  console.error('Validation failed:');
  result.errors.forEach(error => console.error(`- ${error}`));
  return;
}
```

## Type Utilities

### Type-Safe Field Creation

Helper functions for creating type-safe form fields:

```typescript
// Text field factory
function createTextField(
  name: string, 
  selector: string, 
  options?: Partial<TextField>
): TextField {
  return {
    name,
    type: 'text',
    selector,
    fontSize: 12,
    borderWidth: 1,
    ...options
  };
}

// Checkbox field factory
function createCheckboxField(
  name: string,
  selector: string,
  options?: Partial<CheckboxField>
): CheckboxField {
  return {
    name,
    type: 'checkbox',
    selector,
    size: 16,
    defaultValue: false,
    ...options
  };
}

// Usage
const fields: FormField[] = [
  createTextField('userName', '.name-input', { required: true }),
  createCheckboxField('newsletter', '.newsletter-checkbox', { defaultValue: true })
];
```

### Type Guards

Utility functions for runtime type checking:

```typescript
function isTextField(field: FormField): field is TextField {
  return field.type === 'text';
}

function isCheckboxField(field: FormField): field is CheckboxField {
  return field.type === 'checkbox';
}

function isRadioField(field: FormField): field is RadioField {
  return field.type === 'radio';
}

function isDropdownField(field: FormField): field is DropdownField {
  return field.type === 'dropdown';
}

function isButtonField(field: FormField): field is ButtonField {
  return field.type === 'button';
}

function isSignatureField(field: FormField): field is SignatureField {
  return field.type === 'signature';
}
```

### Field Validation Helpers

```typescript
// Validate field has required properties
function validateField(field: FormField): string[] {
  const errors: string[] = [];
  
  if (!field.name) {
    errors.push('Field must have a name');
  }
  
  if (!field.selector && !field.position) {
    errors.push('Field must have selector or position');
  }
  
  // Type-specific validation
  if (isRadioField(field) && field.options.length === 0) {
    errors.push('Radio field must have options');
  }
  
  if (isDropdownField(field) && field.options.length === 0) {
    errors.push('Dropdown field must have options');
  }
  
  if (isButtonField(field) && !field.label) {
    errors.push('Button field must have label');
  }
  
  return errors;
}

// Validate field positioning
function validatePosition(position: Position): string[] {
  const errors: string[] = [];
  
  if (position.x < 0 || position.y < 0) {
    errors.push('Position coordinates must be non-negative');
  }
  
  if (position.width <= 0 || position.height <= 0) {
    errors.push('Position dimensions must be positive');
  }
  
  return errors;
}
```

## Advanced Types

### Puppeteer Integration

The library integrates with Puppeteer's type system:

```typescript
import { PDFOptions } from 'puppeteer';

// Common PDF options
const pdfOptions: PDFOptions = {
  format: 'A4' | 'A3' | 'A5' | 'Legal' | 'Letter' | 'Tabloid',
  landscape: boolean,
  margin: {
    top?: string | number,
    right?: string | number,
    bottom?: string | number,
    left?: string | number
  },
  displayHeaderFooter: boolean,
  headerTemplate: string,
  footerTemplate: string,
  printBackground: boolean,
  scale: number,
  pageRanges: string,
  width: string | number,
  height: string | number,
  preferCSSPageSize: boolean,
  omitBackground: boolean,
  timeout: number,
  tagged: boolean
};
```

### PDF-lib Integration

Core types from pdf-lib that the library uses:

```typescript
// From pdf-lib
import { 
  PDFDocument,
  PDFForm,
  PDFPage,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFButton,
  rgb,
  RGB
} from 'pdf-lib';

// RGB color utility
const blue: RGB = rgb(0.2, 0.4, 0.8);
const green: RGB = rgb(0.1, 0.7, 0.3);
```

## Type Assertion Utilities

Safe type assertions for runtime validation:

```typescript
// Assert field type safely
function assertTextField(field: FormField): TextField {
  if (!isTextField(field)) {
    throw new Error(`Expected TextField, got ${field.type}`);
  }
  return field;
}

// Assert valid configuration
function assertValidConfig(config: any): GenerateConfig {
  if (!config.content) {
    throw new Error('Configuration must have content');
  }
  
  if (config.fields && !Array.isArray(config.fields)) {
    throw new Error('Fields must be an array');
  }
  
  return config as GenerateConfig;
}
```

## Migration from JavaScript

When migrating from JavaScript to TypeScript:

```typescript
// JavaScript (untyped)
const config = {
  content: '<div>...</div>',
  fields: [
    { name: 'test', type: 'text', selector: '.test' }
  ]
};

// TypeScript (typed)
const config: GenerateConfig = {
  content: '<div>...</div>',
  fields: [
    {
      name: 'test',
      type: 'text',
      selector: '.test'
    } as TextField
  ]
};

// Or with explicit typing
const fields: FormField[] = [
  {
    name: 'test',
    type: 'text',
    selector: '.test',
    required: true,
    fontSize: 12
  } satisfies TextField
];
```

## Common Type Patterns

### Builder Pattern
```typescript
class FormConfigBuilder {
  private config: Partial<GenerateConfig> = {};
  
  content(html: string): this {
    this.config.content = html;
    return this;
  }
  
  addField(field: FormField): this {
    this.config.fields = [...(this.config.fields || []), field];
    return this;
  }
  
  metadata(meta: PDFMetadata): this {
    this.config.metadata = meta;
    return this;
  }
  
  build(): GenerateConfig {
    if (!this.config.content) {
      throw new Error('Content is required');
    }
    return this.config as GenerateConfig;
  }
}

// Usage
const config = new FormConfigBuilder()
  .content('<div class="p-8">Form Content</div>')
  .addField({ name: 'name', type: 'text', selector: '.name' })
  .metadata({ title: 'My Form' })
  .build();
```

### Factory Pattern
```typescript
class FieldFactory {
  static textField(name: string, selector: string, required = false): TextField {
    return {
      name,
      type: 'text',
      selector,
      required,
      fontSize: 12,
      borderWidth: 1
    };
  }
  
  static checkboxField(name: string, selector: string, defaultChecked = false): CheckboxField {
    return {
      name,
      type: 'checkbox',
      selector,
      defaultValue: defaultChecked,
      size: 16
    };
  }
}

// Usage
const fields: FormField[] = [
  FieldFactory.textField('name', '.name-input', true),
  FieldFactory.checkboxField('terms', '.terms-checkbox', false)
];
```