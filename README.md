# PDF TailwindCSS Forms

A powerful TypeScript library for generating interactive PDF documents with TailwindCSS styling and AcroForm fields.

## Features

- <¨ **TailwindCSS Integration** - Style your PDFs with modern CSS framework
- =Ý **Interactive Forms** - Add text fields, checkboxes, dropdowns, and more
- =' **TypeScript Support** - Full type safety and IntelliSense
- =Ä **Template System** - Pre-built templates for common use cases
- ¡ **Dual Positioning** - CSS selectors or absolute coordinates
- = **Form Validation** - Built-in validation for configurations
- =Ê **Batch Processing** - Generate multiple PDFs efficiently
- =¾ **Data Extraction** - Extract data from existing PDF forms

## Installation

```bash
npm install pdf-tailwind-forms
# or
pnpm add pdf-tailwind-forms
# or
yarn add pdf-tailwind-forms
```

## Quick Start

```typescript
import PDFGenerator from 'pdf-tailwind-forms';

const generator = new PDFGenerator();

// Simple example
const config = {
  content: `
    <div class="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h1 class="text-2xl font-bold mb-4">Contact Form</h1>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Name</label>
        <div class="name-field border p-2 rounded w-full h-10"></div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">Email</label>
        <div class="email-field border p-2 rounded w-full h-10"></div>
      </div>
    </div>
  `,
  fields: [
    {
      name: 'fullName',
      type: 'text',
      selector: '.name-field',
      required: true
    },
    {
      name: 'email',
      type: 'text',
      selector: '.email-field',
      required: true
    }
  ],
  outputPath: './contact-form.pdf'
};

const result = await generator.generate(config);
console.log(`Generated PDF with ${result.fieldCount} fields`);

// Clean up
await generator.destroy();
```

## Core Concepts

### Two-Step Generation Process

This library uses a unique two-step approach:

1. **Visual Layer**: Puppeteer renders your HTML content with TailwindCSS to create a styled PDF
2. **Interactive Layer**: pdf-lib adds AcroForm fields at calculated positions

This separation allows you to focus on design with TailwindCSS while getting fully interactive forms.

### Field Positioning

Fields can be positioned using two methods:

#### CSS Selectors (Recommended)
```typescript
{
  name: 'userName',
  type: 'text',
  selector: '.user-input-field',  // Automatically calculates position
  offsetX: 5,  // Fine-tune position
  offsetY: -2
}
```

#### Absolute Positioning
```typescript
{
  name: 'userName',
  type: 'text',
  position: { x: 100, y: 200, width: 200, height: 30 }
}
```

## Field Types

### Text Fields
```typescript
{
  name: 'description',
  type: 'text',
  selector: '.description-field',
  multiline: true,
  maxLength: 500,
  defaultValue: 'Enter description...',
  required: true
}
```

### Checkboxes
```typescript
{
  name: 'agreeTerms',
  type: 'checkbox',
  selector: '.terms-checkbox',
  defaultValue: false,
  size: 16,
  required: true
}
```

### Radio Buttons
```typescript
{
  name: 'priority',
  type: 'radio',
  selector: '.priority-group',
  options: [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ],
  defaultValue: 'medium',
  spacing: 25
}
```

### Dropdowns
```typescript
{
  name: 'country',
  type: 'dropdown',
  selector: '.country-select',
  options: ['United States', 'Canada', 'Mexico'],
  defaultValue: 'United States',
  editable: false
}
```

### Buttons
```typescript
{
  name: 'submitForm',
  type: 'button',
  selector: '.submit-btn',
  label: 'Submit Form',
  action: 'submit'
}
```

### Signature Fields
```typescript
{
  name: 'clientSignature',
  type: 'signature',
  selector: '.signature-area',
  height: 60
}
```

## Template System

### Form Template
```typescript
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';

const formConfig = createFormTemplate({
  title: 'Customer Registration',
  description: 'Please fill out all required fields',
  theme: 'blue',
  fields: [
    { label: 'Full Name', name: 'fullName', type: 'text', required: true },
    { label: 'Email Address', name: 'email', type: 'email', required: true },
    { label: 'Phone Number', name: 'phone', type: 'phone' },
    { label: 'Country', name: 'country', type: 'select', 
      options: ['US', 'CA', 'UK', 'DE', 'FR'] },
    { label: 'Comments', name: 'comments', type: 'textarea' },
    { label: 'Subscribe to newsletter', name: 'newsletter', type: 'checkbox' }
  ],
  submitLabel: 'Register Now'
});

const generator = new PDFGenerator();
const result = await generator.generate(formConfig);
```

### Invoice Template
```typescript
import { createInvoiceTemplate } from 'pdf-tailwind-forms/templates/invoice';

const invoiceConfig = createInvoiceTemplate({
  companyName: 'Acme Corporation',
  companyAddress: '123 Business Street\nSuite 100\nNew York, NY 10001',
  clientName: 'Client Company Inc.',
  clientAddress: '456 Client Avenue\nSuite 200\nBoston, MA 02101',
  invoiceNumber: 'INV-2024-001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  items: [
    { description: 'Web Development Services', quantity: 40, price: 125.00 },
    { description: 'Domain Registration', quantity: 1, price: 15.99 },
    { description: 'SSL Certificate', quantity: 1, price: 89.00 }
  ],
  tax: 8.5,
  currency: '$'
});

const generator = new PDFGenerator();
const result = await generator.generate(invoiceConfig);
```

## Advanced Features

### Custom Styling
```typescript
const config = {
  content: '<div class="custom-form">...</div>',
  customCSS: `
    .custom-form {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', sans-serif;
    }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  `,
  fields: [...],
  pdfOptions: {
    format: 'A4',
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div class="text-xs text-center w-full">Company Name</div>',
    footerTemplate: '<div class="text-xs text-center w-full">Page <span class="pageNumber"></span></div>'
  }
};
```

### Configuration Validation
```typescript
import { PDFValidator } from 'pdf-tailwind-forms/validator';

const validator = new PDFValidator();
const validation = validator.validate(config);

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
  return;
}
```

### Working with Existing PDFs
```typescript
// Fill an existing PDF form
const filledPDF = await generator.fillExistingPDF(
  './template.pdf',
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    agreeTerms: true
  },
  './filled-form.pdf'
);

// Extract data from a PDF
const formData = await generator.extractFormData('./submitted-form.pdf');
console.log(formData); // { fullName: 'John Doe', email: 'john@example.com', ... }
```

### Batch Processing
```typescript
const configs = [
  { content: '<div>Form 1</div>', fields: [], outputPath: './form1.pdf' },
  { content: '<div>Form 2</div>', fields: [], outputPath: './form2.pdf' },
  { content: '<div>Form 3</div>', fields: [], outputPath: './form3.pdf' }
];

const results = await generator.generateBatch(configs);
console.log(`Generated ${results.length} PDFs`);
```

## Configuration Options

### PDFGeneratorOptions
```typescript
const generator = new PDFGenerator({
  tailwindCDN: 'https://cdn.tailwindcss.com',  // Custom TailwindCSS CDN
  defaultFontSize: 12,                         // Default field font size
  defaultBorderWidth: 1,                       // Default field border width
  puppeteerOptions: {                          // Puppeteer configuration
    headless: true,
    args: ['--no-sandbox']
  }
});
```

### PDF Metadata
```typescript
const config = {
  content: '...',
  fields: [...],
  metadata: {
    title: 'Customer Registration Form',
    author: 'Your Company',
    subject: 'Registration',
    keywords: ['form', 'registration', 'customer'],
    creator: 'PDF TailwindCSS Forms Library'
  }
};
```

## Error Handling

The library provides comprehensive error handling:

```typescript
try {
  const result = await generator.generate(config);
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('selector not found')) {
    console.error('CSS selector invalid:', error);
  } else if (error.message.includes('validation')) {
    console.error('Configuration error:', error);
  } else {
    console.error('Generation failed:', error);
  }
}
```

## Best Practices

### 1. Resource Management
```typescript
// Always clean up resources
const generator = new PDFGenerator();
try {
  const result = await generator.generate(config);
  // Process result
} finally {
  await generator.destroy(); // Important: prevents memory leaks
}
```

### 2. Field Positioning
```typescript
// Use descriptive CSS classes
const content = `
  <div class="form-container p-8">
    <div class="user-name-input border rounded p-2"></div>
    <div class="user-email-input border rounded p-2 mt-4"></div>
  </div>
`;

const fields = [
  { name: 'userName', type: 'text', selector: '.user-name-input' },
  { name: 'userEmail', type: 'text', selector: '.user-email-input' }
];
```

### 3. Responsive Design
```typescript
// Use TailwindCSS responsive utilities
const content = `
  <div class="p-4 md:p-8 max-w-2xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="name-field h-10 border rounded"></div>
      <div class="email-field h-10 border rounded"></div>
    </div>
  </div>
`;
```

### 4. Validation
```typescript
// Always validate before generation
const validator = new PDFValidator();
const validation = validator.validate(config);

if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}
```

## Performance Considerations

- **Reuse Generator Instances**: Create one generator and reuse it for multiple PDFs
- **Batch Operations**: Use `generateBatch()` for multiple PDFs instead of individual calls
- **Resource Cleanup**: Always call `destroy()` when done to prevent memory leaks
- **Selector Efficiency**: Use specific CSS selectors to improve positioning accuracy

## Browser Compatibility

The library uses Puppeteer which supports:
- Chrome/Chromium (recommended)
- All modern CSS features including Flexbox and Grid
- TailwindCSS responsive utilities
- Custom fonts via CSS imports

## TypeScript Support

The library is written in TypeScript and provides complete type definitions:

```typescript
import PDFGenerator, { 
  GenerateConfig, 
  FormField, 
  TextField,
  CheckboxField,
  PDFMetadata,
  GenerationResult 
} from 'pdf-tailwind-forms';

// Full type safety
const config: GenerateConfig = {
  content: '...',
  fields: [] as FormField[],
  metadata: {} as PDFMetadata
};
```

## Examples

See the `/examples` directory for complete working examples:

- **Simple Form**: Basic contact form with validation
- **Multi-page Form**: Complex form spanning multiple pages
- **Invoice Generation**: Professional invoice with calculations
- **Spacing Demo**: Field positioning and spacing examples

## Requirements

- Node.js e 18.0.0
- Dependencies automatically installed:
  - `pdf-lib` ^1.17.1
  - `puppeteer` ^24.18.0

## Development

```bash
# Install dependencies
pnpm install

# Build the library
pnpm run build

# Run tests
pnpm run test

# Watch mode development
pnpm run dev
```

## License

ISC

## Contributing

Issues and pull requests welcome on [GitHub](https://github.com/AbsolumFrAG/pdf-tailwind-forms).