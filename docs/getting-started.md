# Getting Started Guide

Welcome to PDF TailwindCSS Forms! This guide will help you get up and running with creating interactive PDF documents styled with TailwindCSS.

## What is PDF TailwindCSS Forms?

PDF TailwindCSS Forms is a TypeScript library that lets you create beautiful, interactive PDF documents by combining:

- **TailwindCSS** for modern, responsive styling
- **Interactive Forms** with AcroForm fields (text inputs, checkboxes, dropdowns, etc.)
- **TypeScript** for type safety and better development experience

## Installation

Install the library using your preferred package manager:

```bash
# npm
npm install pdf-tailwind-forms

# pnpm (recommended)
pnpm add pdf-tailwind-forms

# yarn
yarn add pdf-tailwind-forms
```

## System Requirements

- **Node.js** ≥ 18.0.0
- **TypeScript** (recommended for type safety)
- Internet connection (for TailwindCSS CDN)

## Your First PDF

Let's create a simple contact form PDF:

### Step 1: Import the Library

```typescript
import PDFGenerator from 'pdf-tailwind-forms';
```

### Step 2: Create HTML Content with TailwindCSS

```typescript
const htmlContent = `
  <div class="p-8 max-w-md mx-auto bg-white">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Contact Form</h1>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
      <div class="name-input border-2 border-gray-300 rounded p-2 w-full h-10"></div>
    </div>
    
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
      <div class="email-input border-2 border-gray-300 rounded p-2 w-full h-10"></div>
    </div>
    
    <div class="submit-btn bg-blue-500 text-white p-3 rounded text-center cursor-pointer">
      Submit
    </div>
  </div>
`;
```

### Step 3: Define Interactive Fields

```typescript
const fields = [
  {
    name: 'userName',
    type: 'text',
    selector: '.name-input',  // CSS selector to position field
    required: true,
    fontSize: 12
  },
  {
    name: 'userEmail',
    type: 'text',
    selector: '.email-input',
    required: true,
    fontSize: 12
  },
  {
    name: 'submitButton',
    type: 'button',
    selector: '.submit-btn',
    label: 'Submit Form',
    action: 'submit'
  }
];
```

### Step 4: Generate the PDF

```typescript
async function createContactForm() {
  const generator = new PDFGenerator();
  
  try {
    const result = await generator.generate({
      content: htmlContent,
      fields: fields,
      outputPath: './contact-form.pdf'
    });
    
    console.log(`PDF created with ${result.fieldCount} interactive fields!`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Always clean up resources
    await generator.destroy();
  }
}

createContactForm();
```

## Complete Example

Here's the full code for your first PDF:

```typescript
import PDFGenerator, { GenerateConfig, FormField } from 'pdf-tailwind-forms';

async function main() {
  const generator = new PDFGenerator();

  const config: GenerateConfig = {
    content: `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div class="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="bg-blue-600 text-white p-6">
            <h1 class="text-2xl font-bold">Get In Touch</h1>
            <p class="mt-2 opacity-90">We'd love to hear from you</p>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div class="name-field w-full h-10 border-2 border-gray-300 rounded-md"></div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div class="email-field w-full h-10 border-2 border-gray-300 rounded-md"></div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div class="message-field w-full h-24 border-2 border-gray-300 rounded-md"></div>
            </div>
            
            <div class="newsletter-opt flex items-center">
              <div class="w-4 h-4 border-2 border-gray-300 rounded mr-3"></div>
              <label class="text-sm text-gray-700">Email me updates</label>
            </div>
            
            <div class="submit-area bg-blue-600 text-white py-3 rounded-md text-center font-medium">
              Send Message
            </div>
          </div>
        </div>
      </div>
    `,

    fields: [
      {
        name: 'fullName',
        type: 'text',
        selector: '.name-field',
        required: true,
        offsetX: 8,
        offsetY: -3
      },
      {
        name: 'email',
        type: 'text',
        selector: '.email-field', 
        required: true,
        offsetX: 8,
        offsetY: -3
      },
      {
        name: 'message',
        type: 'text',
        selector: '.message-field',
        multiline: true,
        offsetX: 8,
        offsetY: -5
      },
      {
        name: 'newsletter',
        type: 'checkbox',
        selector: '.newsletter-opt',
        defaultValue: false,
        size: 14,
        offsetX: 2,
        offsetY: 2
      },
      {
        name: 'submit',
        type: 'button',
        selector: '.submit-area',
        label: 'SEND MESSAGE',
        action: 'submit'
      }
    ] as FormField[],

    outputPath: './my-first-form.pdf',
    
    metadata: {
      title: 'Contact Form',
      author: 'Your Name',
      subject: 'Customer Contact'
    }
  };

  try {
    console.log('Generating your first PDF...');
    const result = await generator.generate(config);
    
    console.log('🎉 Success!');
    console.log(`📄 Generated: ${result.path}`);
    console.log(`📝 Fields: ${result.fieldCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await generator.destroy();
  }
}

main().catch(console.error);
```

## Key Concepts

### 1. Two-Step Process

The library works in two steps:
1. **Visual Layer**: Puppeteer renders your HTML + TailwindCSS into a PDF
2. **Interactive Layer**: pdf-lib adds form fields at calculated positions

This separation lets you focus on design while getting fully functional forms.

### 2. Field Positioning

You can position fields two ways:

**CSS Selectors (Recommended)**
```typescript
{
  name: 'email',
  type: 'text',
  selector: '.email-input',  // Finds element and calculates position
  offsetX: 5,                // Fine-tune with offsets
  offsetY: -2
}
```

**Absolute Coordinates**
```typescript
{
  name: 'email',
  type: 'text',
  position: { x: 100, y: 200, width: 200, height: 30 }
}
```

### 3. Field Types

The library supports 6 field types:

- **text**: Single/multi-line text inputs
- **checkbox**: Boolean checkboxes  
- **radio**: Radio button groups
- **dropdown**: Select dropdowns
- **button**: Action buttons
- **signature**: Signature areas

### 4. TailwindCSS Integration

Use any TailwindCSS classes in your HTML:

```html
<div class="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-lg">
  <div class="field1 border-2 border-blue-300 rounded-md p-3"></div>
  <div class="field2 border-2 border-green-300 rounded-md p-3"></div>
</div>
```

## Using Templates

For common use cases, use the built-in templates:

### Form Template

```typescript
import { createFormTemplate } from 'pdf-tailwind-forms/templates/form';

const config = createFormTemplate({
  title: 'Registration Form',
  theme: 'blue',
  fields: [
    { label: 'Name', name: 'name', type: 'text', required: true },
    { label: 'Email', name: 'email', type: 'email', required: true }
  ]
});

const generator = new PDFGenerator();
const result = await generator.generate(config);
```

### Invoice Template

```typescript
import { createInvoiceTemplate } from 'pdf-tailwind-forms/templates/invoice';

const config = createInvoiceTemplate({
  companyName: 'My Company',
  clientName: 'Client Name',
  items: [
    { description: 'Service', quantity: 1, price: 100.00 }
  ]
});

const generator = new PDFGenerator();
const result = await generator.generate(config);
```

## Best Practices

### 1. Always Clean Up

```typescript
const generator = new PDFGenerator();
try {
  // Your PDF operations
} finally {
  await generator.destroy(); // Prevents memory leaks
}
```

### 2. Validate Configurations

```typescript
import { PDFValidator } from 'pdf-tailwind-forms/validator';

const validator = new PDFValidator();
const validation = validator.validate(config);

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
  return;
}
```

### 3. Use Descriptive CSS Classes

```html
<!-- Good: Descriptive class names -->
<div class="user-email-input border rounded p-2"></div>
<div class="submit-button bg-blue-500 text-white p-3"></div>

<!-- Avoid: Generic class names -->
<div class="input1 border"></div>
<div class="btn blue"></div>
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = await generator.generate(config);
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('selector')) {
    console.error('CSS selector not found:', error);
  } else {
    console.error('Generation failed:', error);
  }
}
```

## Common Patterns

### Contact Forms
```typescript
const contactFields = [
  { name: 'name', type: 'text', required: true },
  { name: 'email', type: 'text', required: true },
  { name: 'phone', type: 'text' },
  { name: 'message', type: 'textarea' },
  { name: 'newsletter', type: 'checkbox' }
];
```

### Registration Forms
```typescript
const registrationFields = [
  { name: 'firstName', type: 'text', required: true },
  { name: 'lastName', type: 'text', required: true },
  { name: 'email', type: 'email', required: true },
  { name: 'password', type: 'text', password: true, required: true },
  { name: 'country', type: 'select', options: countries, required: true },
  { name: 'agreeTerms', type: 'checkbox', required: true }
];
```

### Survey Forms
```typescript
const surveyFields = [
  { name: 'satisfaction', type: 'radio', 
    options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'] },
  { name: 'recommendation', type: 'radio',
    options: ['Definitely', 'Probably', 'Maybe', 'No'] },
  { name: 'improvements', type: 'textarea' }
];
```

## Next Steps

1. **Explore Templates**: Try the built-in form and invoice templates
2. **Read API Reference**: Check `docs/api.md` for complete method documentation
3. **Review Examples**: Look at `examples/` directory for more complex use cases
4. **Learn Types**: Study `docs/types.md` for complete TypeScript reference

## Troubleshooting

### Field Not Appearing?
- Check that your CSS selector matches an element in the HTML
- Verify the element has dimensions (width/height > 0)
- Try adding offset values to fine-tune positioning

### Styling Not Applied?
- Ensure TailwindCSS CDN is accessible
- Check for CSS syntax errors in customCSS
- Verify TailwindCSS classes are spelled correctly

### Generation Taking Too Long?
- Reduce HTML complexity
- Minimize external resources (fonts, images)
- Use batch processing for multiple PDFs

### Memory Issues?
- Always call `generator.destroy()` when done
- Use try/finally blocks to ensure cleanup
- Consider creating new generator instances for large batch operations

Ready to create your first interactive PDF? Copy the complete example above and start customizing!