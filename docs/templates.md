# Template System Documentation

The PDF TailwindCSS Forms library includes a powerful template system that provides pre-built, customizable templates for common use cases.

## Overview

Templates are functions that return `GenerateConfig` objects, eliminating the need to write HTML and field configurations manually. They include:

- Professional styling with TailwindCSS
- Responsive design patterns
- Pre-configured interactive form fields
- Customizable themes and branding
- Validation and error handling

## Available Templates

### Form Template

Creates modern, responsive forms with gradient styling and professional layout.

#### Import
```typescript
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';
```

#### Configuration
```typescript
interface FormTemplateOptions {
  title: string;                    // Form title displayed in header
  description?: string;             // Optional description below title
  theme?: 'blue' | 'green' | 'purple' | 'red';  // Color theme
  fields: Array<{
    label: string;                  // Field display label
    name: string;                   // Unique field identifier
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox';
    required?: boolean;             // Mark field as required
    options?: string[];             // Options for select fields
  }>;
  submitLabel?: string;             // Custom submit button text
}
```

#### Supported Field Types

**Text Input**
```typescript
{ label: 'Full Name', name: 'fullName', type: 'text', required: true }
```

**Email Input**  
```typescript
{ label: 'Email Address', name: 'email', type: 'email', required: true }
```

**Phone Input**
```typescript
{ label: 'Phone Number', name: 'phone', type: 'phone' }
```

**Textarea**
```typescript
{ label: 'Comments', name: 'comments', type: 'textarea' }
```

**Select Dropdown**
```typescript
{ 
  label: 'Country', 
  name: 'country', 
  type: 'select',
  options: ['United States', 'Canada', 'United Kingdom', 'Other'],
  required: true
}
```

**Checkbox**
```typescript
{ label: 'Subscribe to newsletter', name: 'newsletter', type: 'checkbox' }
```

#### Example Usage
```typescript
const config = createFormTemplate({
  title: 'Event Registration',
  description: 'Register for our upcoming conference',
  theme: 'purple',
  fields: [
    { label: 'Full Name', name: 'fullName', type: 'text', required: true },
    { label: 'Email', name: 'email', type: 'email', required: true },
    { label: 'Company', name: 'company', type: 'text' },
    { label: 'Job Title', name: 'jobTitle', type: 'text' },
    { 
      label: 'Session Track', 
      name: 'track', 
      type: 'select',
      options: ['Technical', 'Business', 'Design', 'Marketing'],
      required: true
    },
    { label: 'Dietary Restrictions', name: 'dietary', type: 'textarea' },
    { label: 'Agree to Terms', name: 'terms', type: 'checkbox', required: true }
  ],
  submitLabel: 'Complete Registration'
});

const generator = new PDFGenerator();
const result = await generator.generate(config);
```

### Invoice Template

Creates professional invoices with automatic calculations, tax handling, and payment tracking.

#### Import
```typescript
import { createInvoiceTemplate } from 'pdf-tailwind-forms/templates/invoice';
```

#### Configuration
```typescript
interface InvoiceData {
  // Company Information
  companyName: string;              // Your company name (required)
  companyAddress?: string;          // Your company address

  // Client Information  
  clientName: string;               // Client name (required)
  clientAddress?: string;           // Client billing address

  // Invoice Details
  invoiceNumber?: string;           // Invoice identifier
  date?: string;                    // Issue date (defaults to today)
  dueDate?: string;                 // Payment due date

  // Line Items
  items: Array<{
    description: string;            // Item/service description
    quantity: number;               // Quantity ordered
    price: number;                  // Unit price
  }>;

  // Financial
  tax?: number;                     // Tax percentage (e.g., 8.5 for 8.5%)
  currency?: string;                // Currency symbol (defaults to '€')
}
```

#### Features

**Automatic Calculations**
- Subtotal: Sum of all line items
- Tax: Calculated as percentage of subtotal
- Total: Subtotal + tax amount

**Interactive Fields**
- Editable invoice number
- Editable client information
- Payment method dropdown
- Digital signature area
- Payment status checkbox

**Professional Layout**
- Company branding header
- Organized client information section
- Professional itemized table
- Clear totals section
- Signature and payment status footer

#### Example Usage
```typescript
const invoiceConfig = createInvoiceTemplate({
  // Company Details
  companyName: 'Design Studio LLC',
  companyAddress: '789 Creative Boulevard\nSuite 500\nSan Francisco, CA 94105',

  // Client Details
  clientName: 'Startup Inc.',
  clientAddress: '321 Innovation Drive\nAustin, TX 73301',

  // Invoice Information
  invoiceNumber: 'DS-2024-0042',
  date: '2024-03-15',
  dueDate: '2024-04-15',

  // Services Provided
  items: [
    { description: 'UI/UX Design Consultation', quantity: 8, price: 175.00 },
    { description: 'Mobile App Design', quantity: 1, price: 2500.00 },
    { description: 'Design System Creation', quantity: 1, price: 1200.00 },
    { description: 'User Testing Session', quantity: 3, price: 300.00 }
  ],

  // Financial Details
  tax: 7.25,        // 7.25% sales tax
  currency: '$'     // US Dollars
});

const generator = new PDFGenerator();
const result = await generator.generate(invoiceConfig);
await generator.destroy();

console.log(`Invoice generated: ${result.fieldCount} interactive fields`);
// Output: Invoice generated: 6 interactive fields
```

## Customization

### Theme Customization

Both templates support theme customization through the `theme` parameter:

```typescript
// Available themes for forms
const themes = ['blue', 'green', 'purple', 'red'];

// Custom gradient classes applied:
// blue: 'from-blue-500 to-blue-700'
// green: 'from-green-500 to-green-700'  
// purple: 'from-purple-500 to-purple-700'
// red: 'from-red-500 to-red-700'
```

### Advanced Customization

For more control, you can modify the template functions or create custom templates:

```typescript
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';

// Extend existing template
function createCustomFormTemplate(options: FormTemplateOptions & { 
  logoUrl?: string;
  accentColor?: string;
}) {
  const baseConfig = createFormTemplate(options);
  
  // Add custom styling
  baseConfig.customCSS = `
    .custom-header {
      background: ${options.accentColor || '#3B82F6'};
    }
    .logo {
      background-image: url('${options.logoUrl || ''}');
    }
    ${baseConfig.customCSS || ''}
  `;
  
  // Modify content to include logo
  baseConfig.content = baseConfig.content.replace(
    '<div class="bg-gradient-to-r',
    '<div class="logo w-16 h-16 bg-contain bg-no-repeat mb-4"></div><div class="bg-gradient-to-r custom-header'
  );
  
  return baseConfig;
}
```

### Creating Custom Templates

You can create entirely custom templates by following the same pattern:

```typescript
import { FormField, GenerateConfig } from 'pdf-tailwind-forms';

export function createCustomTemplate(data: any): GenerateConfig {
  return {
    content: `
      <!-- Your custom HTML with TailwindCSS -->
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="field-container max-w-lg mx-auto bg-white rounded-lg p-6">
          <!-- Field positioning elements -->
        </div>
      </div>
    `,
    fields: [
      // Your custom field configurations
      {
        name: 'customField',
        type: 'text',
        selector: '.field-container',
        required: true
      }
    ],
    metadata: {
      title: 'Custom Template',
      creator: 'Your Application'
    }
  };
}
```

## Template Troubleshooting

### Common Issues

**Field Not Positioned Correctly**
```typescript
// Solution: Add offset adjustments
{
  name: 'field',
  type: 'text',
  selector: '.field-element',
  offsetX: 10,    // Move right 10 points
  offsetY: -5     // Move up 5 points
}
```

**Field Too Small/Large**
```typescript
// Solution: Override dimensions
{
  name: 'field',
  type: 'text',
  selector: '.field-element',
  width: 200,     // Override calculated width
  height: 25      // Override calculated height
}
```

**Styling Not Applied**
```typescript
// Solution: Ensure TailwindCSS loads properly
const config = createFormTemplate(options);

// Add loading delay if needed
config.customCSS = `
  body { opacity: 0; }
  body.loaded { opacity: 1; transition: opacity 0.3s; }
`;

// Or use specific TailwindCSS version
const generator = new PDFGenerator({
  tailwindCDN: 'https://cdn.tailwindcss.com/3.4.0'
});
```

### Field Positioning Debug

```typescript
// Add visual debugging to see field positions
const debugCSS = `
  .field-debug {
    border: 2px solid red !important;
    background: rgba(255, 0, 0, 0.1) !important;
  }
`;

// Apply debug class to your field selectors temporarily
```

## Migration Guide

### From v1.x to v2.x

Key changes in v2.0:
- New template system with `createFormTemplate()` and `createInvoiceTemplate()`
- Enhanced TypeScript types with comprehensive JSDoc
- Improved validation with `PDFValidator` class
- Better error handling and debugging support

```typescript
// v1.x approach
const generator = new PDFGenerator();
const config = {
  content: '...',  // Manual HTML
  fields: [...]    // Manual field configuration
};

// v2.x approach (recommended)
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';

const config = createFormTemplate({
  title: 'My Form',
  fields: [
    { label: 'Name', name: 'name', type: 'text' }
  ]
});
```

Both approaches are still supported for backward compatibility.