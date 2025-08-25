# PDF-TailwindForms

A powerful TypeScript Node.js library for generating PDFs with complete AcroForms fields and TailwindCSS support.

## 🚀 Features

- **Complete AcroForms Support**: All field types (text, checkboxes, radio buttons, dropdowns, etc.)
- **TailwindCSS Integration**: Style your forms with Tailwind CSS classes
- **TypeScript Types**: Full TypeScript support with strict typing
- **Field Validation**: Built-in validation system with customizable rules
- **Conditional Logic**: Dynamic fields with show/hide conditions
- **Utility Helpers**: Tools for creating layouts, tables, signatures, etc.
- **Custom Themes**: Theme system with customizable colors and styles

## 📦 Installation

```bash
npm install pdf-tailwind-forms
# or
pnpm add pdf-tailwind-forms
# or
yarn add pdf-tailwind-forms
```

## 🎯 Quick Start

```typescript
import { PDFTailwindGenerator, FormHelpers } from 'pdf-tailwind-forms';

async function createForm() {
  // Initialize PDF generator
  const pdfGenerator = new PDFTailwindGenerator();
  await pdfGenerator.initialize({
    title: 'My Form',
    author: 'Your Name'
  });

  // Add a page
  pdfGenerator.addPage();

  // Create a text field with TailwindCSS styling
  await pdfGenerator.addTextField({
    name: 'full_name',
    x: 50,
    y: 700,
    width: 200,
    height: 30,
    defaultValue: '',
    tailwind: { 
      classes: 'bg-white border-2 border-blue-300 text-gray-900 text-sm rounded-md p-2' 
    }
  });

  // Save the PDF
  const pdfBytes = await pdfGenerator.save();
  // Use pdfBytes to save or send the PDF
}
```

## 🛠️ Supported Field Types

### Basic Fields

#### Text Field
```typescript
await pdfGenerator.addTextField({
  name: 'email',
  x: 50,
  y: 650,
  width: 250,
  height: 25,
  multiline: false,
  maxLength: 100,
  tailwind: { classes: 'bg-white border border-gray-300 rounded p-2' }
});
```

#### Checkbox
```typescript
await pdfGenerator.addCheckBox({
  name: 'newsletter',
  x: 50,
  y: 600,
  width: 15,
  height: 15,
  checked: false,
  tailwind: { classes: 'border-2 border-green-400' }
});
```

#### Radio Group
```typescript
await pdfGenerator.addRadioGroup({
  name: 'title',
  options: [
    { value: 'mr', x: 50, y: 550, width: 15, height: 15 },
    { value: 'mrs', x: 100, y: 550, width: 15, height: 15 },
    { value: 'ms', x: 150, y: 550, width: 15, height: 15 }
  ],
  defaultValue: 'mr',
  tailwind: { classes: 'border-2 border-blue-400' }
});
```

#### Dropdown
```typescript
await pdfGenerator.addDropdown({
  name: 'country',
  x: 50,
  y: 500,
  width: 150,
  height: 25,
  options: ['France', 'Belgium', 'Switzerland', 'Canada'],
  defaultValue: 'France',
  tailwind: { classes: 'bg-white border border-gray-300 rounded p-1' }
});
```

### Advanced Fields with FormHelpers

#### Date Field with Validation
```typescript
const formHelpers = new FormHelpers(pdfGenerator);

await formHelpers.createDateField({
  name: 'birth_date',
  x: 50,
  y: 450,
  width: 120,
  height: 25,
  format: 'DD/MM/YYYY',
  maxDate: new Date(), // Don't allow future dates
  tailwind: { classes: 'bg-white border border-gray-300 rounded p-2' }
});
```

#### Number Field with Validation
```typescript
await formHelpers.createNumberField({
  name: 'salary',
  x: 50,
  y: 400,
  width: 120,
  height: 25,
  min: 20000,
  max: 200000,
  tailwind: { classes: 'bg-white border border-gray-300 rounded p-2 text-right' }
});
```

#### Signature Field
```typescript
await formHelpers.createSignatureField({
  name: 'signature',
  x: 50,
  y: 350,
  width: 200,
  height: 50,
  required: true,
  tailwind: { classes: 'border-2 border-gray-400 bg-gray-50' }
});
```

## 🎨 TailwindCSS Styles

The library automatically converts TailwindCSS classes to PDF styles:

### Supported Colors
- Base colors: `bg-white`, `bg-black`, `text-red-500`, `border-blue-300`
- Full Tailwind color range (50-900) for: red, blue, green, yellow, purple, gray

### Sizes and Spacing
- Text sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.
- Borders: `border`, `border-2`, `border-4`, `border-8`
- Border radius: `rounded`, `rounded-md`, `rounded-lg`, `rounded-full`
- Padding/Margin: `p-2`, `px-4`, `py-2`, `m-4`, etc.

### Text Styles
- Alignment: `text-left`, `text-center`, `text-right`
- Weight: `font-normal`, `font-bold`
- Style: `italic`, `not-italic`
- Decoration: `underline`, `line-through`, `no-underline`

### Complete Example with Styles
```typescript
await pdfGenerator.addTextField({
  name: 'styled_field',
  x: 50,
  y: 300,
  width: 200,
  height: 30,
  tailwind: { 
    classes: 'bg-blue-50 border-2 border-blue-300 text-blue-800 text-lg rounded-lg p-3 font-bold' 
  }
});
```

## 🔧 Advanced Utilities

### Multi-column Layout
```typescript
const formHelpers = new FormHelpers(pdfGenerator);

// Calculate column positions
const { columnWidth, columnPositions } = formHelpers.calculateColumnLayout(595.28, 2, 50);

// Use calculated positions
await pdfGenerator.addTextField({
  name: 'first_name',
  x: columnPositions[0],
  y: 250,
  width: columnWidth,
  height: 25
});
```

### Form Sections
```typescript
formHelpers.createFormSection(
  'Personal Information', 
  'Please fill in your personal details',
  50,   // x
  200,  // y  
  500   // width
);
```

### Dynamic Tables
```typescript
await formHelpers.createTable({
  x: 50,
  y: 150,
  rows: 4,
  columns: 3,
  cellWidth: 100,
  cellHeight: 30,
  headers: ['Name', 'First Name', 'Email'],
  data: [
    ['Doe', 'John', 'john@email.com'],
    ['Smith', 'Jane', 'jane@email.com']
  ],
  borderColor: rgb(0.5, 0.5, 0.5),
  borderWidth: 1
});
```

## 🔐 Field Validation

### Supported Validation Rules
```typescript
// Required validation
pdfGenerator.setFieldValidation('name', {
  rules: [{ type: 'required', message: 'Name is required' }],
  validateOnBlur: true
});

// Pattern validation with regex
pdfGenerator.setFieldValidation('email', {
  rules: [{
    type: 'pattern',
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  }]
});

// Custom validation
pdfGenerator.setFieldValidation('age', {
  rules: [{
    type: 'custom',
    message: 'Age must be between 18 and 65',
    customValidator: (value) => {
      const age = parseInt(value);
      return age >= 18 && age <= 65;
    }
  }]
});
```

## 🎭 Themes and Customization

### Define a Custom Theme
```typescript
import { rgb } from 'pdf-tailwind-forms';

pdfGenerator.setTheme({
  primaryColor: rgb(0.2, 0.4, 0.8),
  secondaryColor: rgb(0.5, 0.5, 0.5),
  fontSize: 12,
  borderRadius: 4,
  fieldSpacing: 10,
  errorColor: rgb(0.8, 0.2, 0.2),
  successColor: rgb(0.2, 0.8, 0.2)
});
```

### Custom Colors
```typescript
// Add a custom color
const styleConverter = new TailwindToPDFConverter();
styleConverter.addCustomColor('brand-primary', 51, 102, 204); // RGB
```

## 📚 Complete Examples

### Simple Contact Form
```typescript
import { PDFTailwindGenerator, FormHelpers } from 'pdf-tailwind-forms';
import * as fs from 'fs';

async function createContactForm() {
  const pdfGenerator = new PDFTailwindGenerator();
  await pdfGenerator.initialize({
    title: 'Contact Form',
    author: 'My Application'
  });

  const formHelpers = new FormHelpers(pdfGenerator);
  pdfGenerator.addPage();

  let y = 750;

  // Header
  pdfGenerator.drawText('Contact Form', 50, y, {
    size: 20,
    tailwind: 'font-bold text-blue-600'
  });

  y -= 50;

  // Full name
  formHelpers.addFieldLabel('Full Name', 50, y, 'name', true);
  await pdfGenerator.addTextField({
    name: 'name',
    x: 50,
    y: y - 25,
    width: 200,
    height: 25,
    tailwind: { classes: 'bg-white border-2 border-blue-300 text-gray-900 text-sm rounded p-2' }
  });

  y -= 70;

  // Email
  formHelpers.addFieldLabel('Email', 50, y, 'email', true);
  await pdfGenerator.addTextField({
    name: 'email',
    x: 50,
    y: y - 25,
    width: 250,
    height: 25,
    tailwind: { classes: 'bg-white border-2 border-blue-300 text-gray-900 text-sm rounded p-2' }
  });

  y -= 70;

  // Message
  formHelpers.addFieldLabel('Message', 50, y, 'message');
  await pdfGenerator.addTextField({
    name: 'message',
    x: 50,
    y: y - 80,
    width: 300,
    height: 60,
    multiline: true,
    tailwind: { classes: 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  y -= 120;

  // Submit button
  await pdfGenerator.addButton({
    name: 'submit',
    label: 'Submit',
    x: 50,
    y: y,
    width: 100,
    height: 30,
    tailwind: { classes: 'bg-green-600 text-white font-bold rounded border-2 border-green-700' }
  });

  // Validation
  pdfGenerator.setFieldValidation('name', {
    rules: [{ type: 'required', message: 'Name is required' }]
  });

  pdfGenerator.setFieldValidation('email', {
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    ]
  });

  // Save
  const pdfBytes = await pdfGenerator.save();
  fs.writeFileSync('contact-form.pdf', pdfBytes);
  
  console.log('Form created successfully!');
}

createContactForm().catch(console.error);
```

## 🔧 API Reference

### PDFTailwindGenerator

#### Main Methods
- `initialize(config?: PDFGeneratorConfig)` - Initialize the generator
- `addPage(options?: PageOptions)` - Add a new page
- `addTextField(options: TextFieldOptions)` - Add a text field
- `addCheckBox(options: CheckBoxOptions)` - Add a checkbox
- `addRadioGroup(options: RadioGroupOptions)` - Add a radio group
- `addDropdown(options: DropdownOptions)` - Add a dropdown
- `addOptionList(options: ListBoxOptions)` - Add a list box
- `addButton(options: ButtonOptions)` - Add a button
- `setTheme(theme: Partial<FormTheme>)` - Set the theme
- `save()` - Save the PDF and return bytes

### FormHelpers

#### Utility Methods
- `createDateField(options: DateFieldOptions)` - Create a date field with validation
- `createNumberField(options: NumberFieldOptions)` - Create a number field with validation
- `createSignatureField(options: SignatureFieldOptions)` - Create a signature field
- `createTable(options: TableFieldOptions)` - Create a table
- `createFormSection(title, description, x, y, width)` - Create a form section
- `calculateColumnLayout(pageWidth, columns, margin)` - Calculate multi-column layout
- `addFieldLabel(text, x, y, fieldName, required)` - Add a field label

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add: AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [pdf-lib](https://pdf-lib.js.org/) - The underlying PDF library
- [TailwindCSS](https://tailwindcss.com/) - The utility-first CSS framework
- Open source community for inspiration and feedback

## 📞 Support

If you have questions or need help:

1. Check the [documentation](README.md)
2. Search through [existing issues](https://github.com/AbsolumFrAG/pdf-tailwind-forms/issues)
3. Create a [new issue](https://github.com/AbsolumFrAG/pdf-tailwind-forms/issues/new) if needed

---

**PDF-TailwindForms** - Create beautiful PDF forms with the power of TailwindCSS! 🚀