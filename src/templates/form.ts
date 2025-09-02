import { FormField, GenerateConfig } from "../pdf-generator";

/**
 * Options for creating a generic form template
 */
export interface FormTemplateOptions {
  /** Form title displayed in header */
  title: string;
  /** Optional description text below title */
  description?: string;
  /** Color theme for form styling */
  theme?: "blue" | "green" | "purple" | "red";
  /** Array of form fields to include */
  fields: Array<{
    /** Display label for the field */
    label: string;
    /** Unique field identifier */
    name: string;
    /** Field input type */
    type: "text" | "email" | "phone" | "select" | "textarea" | "checkbox";
    /** Whether field is required */
    required?: boolean;
    /** Options for select fields */
    options?: string[];
  }>;
  /** Custom text for submit button */
  submitLabel?: string;
}

/**
 * Creates a styled form template with TailwindCSS
 * 
 * Generates a responsive form layout with gradient styling,
 * proper field positioning, and interactive form fields.
 * 
 * @param options Form configuration options
 * @returns GenerateConfig ready for PDF generation
 * 
 * @example
 * ```typescript
 * const formConfig = createFormTemplate({
 *   title: 'Contact Form',
 *   description: 'Get in touch with us',
 *   theme: 'blue',
 *   fields: [
 *     { label: 'Full Name', name: 'fullName', type: 'text', required: true },
 *     { label: 'Email', name: 'email', type: 'email', required: true },
 *     { label: 'Message', name: 'message', type: 'textarea' }
 *   ]
 * });
 * 
 * const generator = new PDFGenerator();
 * const result = await generator.generate(formConfig);
 * ```
 */
export function createFormTemplate(
  options: FormTemplateOptions
): GenerateConfig {
  const themeColors = {
    blue: "from-blue-500 to-blue-700",
    green: "from-green-500 to-green-700",
    purple: "from-purple-500 to-purple-700",
    red: "from-red-500 to-red-700",
  };

  const theme = themeColors[options.theme || "blue"];

  const fieldsHTML = options.fields
    .map((field) => {
      const fieldClass = `field-${field.name}`;

      switch (field.type) {
        case "textarea":
          return `
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${field.label} ${
            field.required ? '<span class="text-red-500">*</span>' : ""
          }
            </label>
            <div class="${fieldClass} w-full h-24 border-2 border-gray-300 rounded-lg"></div>
          </div>
        `;
        case "checkbox":
          return `
          <div class="mb-6 ${fieldClass} flex items-center">
            <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3"></div>
            <label class="text-sm text-gray-700">${field.label}</label>
          </div>
        `;
        case "select":
          return `
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${field.label} ${
            field.required ? '<span class="text-red-500">*</span>' : ""
          }
            </label>
            <div class="${fieldClass} w-full h-10 border-2 border-gray-300 rounded-lg"></div>
          </div>
        `;
        default:
          return `
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${field.label} ${
            field.required ? '<span class="text-red-500">*</span>' : ""
          }
            </label>
            <div class="${fieldClass} w-full h-10 border-2 border-gray-300 rounded-lg"></div>
          </div>
        `;
      }
    })
    .join("");

  const formFields: FormField[] = options.fields.map((field) => {
    const baseField = {
      name: field.name,
      selector: `.field-${field.name}`,
      required: field.required,
      fontSize: 12,
      borderWidth: 0,
    };

    switch (field.type) {
      case "textarea":
        return {
          ...baseField,
          type: "text" as const,
          multiline: true,
          height: 80,
          offsetX: 10,
          offsetY: -5,
        };
      case "checkbox":
        return {
          ...baseField,
          type: "checkbox" as const,
          size: 16,
          offsetX: 1,
          offsetY: 1,
        };
      case "select":
        return {
          ...baseField,
          type: "dropdown" as const,
          options: field.options || [],
          offsetX: 10,
          offsetY: -5,
        };
      default:
        return {
          ...baseField,
          type: "text" as const,
          offsetX: 10,
          offsetY: -5,
        };
    }
  });

  // Add submit button
  formFields.push({
    name: "submitBtn",
    type: "button",
    selector: ".field-submit",
    label: options.submitLabel || "SUBMIT",
    action: "submit",
    borderWidth: 0,
  });

  return {
    content: `
      <div class="min-h-screen bg-gradient-to-br ${theme} p-8">
        <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r ${theme} text-white p-6">
            <h1 class="text-3xl font-bold">${options.title}</h1>
            ${
              options.description
                ? `<p class="mt-2 opacity-90">${options.description}</p>`
                : ""
            }
          </div>
          
          <div class="p-8">
            ${fieldsHTML}
            
            <div class="mt-8 field-submit">
              <div class="bg-gradient-to-r ${theme} text-white py-3 rounded-lg text-center font-semibold hover:shadow-lg transition cursor-pointer">
                ${options.submitLabel || "Submit Form"}
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    fields: formFields,
    metadata: {
      title: options.title,
      subject: "Form",
      creator: "TailwindPDF Forms Library",
    },
  };
}
