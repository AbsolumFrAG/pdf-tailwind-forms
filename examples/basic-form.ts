/**
 * Basic Form Example
 * 
 * Demonstrates creating a simple contact form with text fields,
 * checkboxes, and basic styling using the PDFGenerator class.
 */

import PDFGenerator, { GenerateConfig, FormField } from '../src/index';

async function createBasicForm() {
  const generator = new PDFGenerator({
    defaultFontSize: 12,
    defaultBorderWidth: 1
  });

  const config: GenerateConfig = {
    content: `
      <div class="min-h-screen bg-gray-50 py-12 px-4">
        <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-blue-600 text-white p-6">
            <h1 class="text-2xl font-bold">Contact Us</h1>
            <p class="mt-2 opacity-90">We'd love to hear from you</p>
          </div>
          
          <div class="p-6 space-y-6">
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
                Phone Number
              </label>
              <div class="phone-field w-full h-10 border-2 border-gray-300 rounded-md"></div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div class="message-field w-full h-24 border-2 border-gray-300 rounded-md"></div>
            </div>
            
            <div class="newsletter-checkbox flex items-center">
              <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3"></div>
              <label class="text-sm text-gray-700">
                Subscribe to our newsletter
              </label>
            </div>
            
            <div class="submit-button bg-blue-600 text-white py-3 px-6 rounded-md text-center font-medium cursor-pointer hover:bg-blue-700 transition">
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
        fontSize: 12,
        offsetX: 8,
        offsetY: -3
      },
      {
        name: 'email',
        type: 'text', 
        selector: '.email-field',
        required: true,
        fontSize: 12,
        offsetX: 8,
        offsetY: -3
      },
      {
        name: 'phone',
        type: 'text',
        selector: '.phone-field',
        fontSize: 12,
        offsetX: 8,
        offsetY: -3
      },
      {
        name: 'message',
        type: 'text',
        selector: '.message-field',
        multiline: true,
        maxLength: 1000,
        fontSize: 11,
        offsetX: 8,
        offsetY: -5
      },
      {
        name: 'newsletter',
        type: 'checkbox',
        selector: '.newsletter-checkbox',
        defaultValue: false,
        size: 16,
        offsetX: 2,
        offsetY: 2
      },
      {
        name: 'submit',
        type: 'button',
        selector: '.submit-button',
        label: 'SEND MESSAGE',
        action: 'submit',
        borderWidth: 0
      }
    ] as FormField[],

    outputPath: './examples/output/basic-form.pdf',
    
    metadata: {
      title: 'Contact Form',
      author: 'Example Company',
      subject: 'Contact Information',
      keywords: ['contact', 'form', 'customer service'],
      creator: 'PDF TailwindCSS Forms Example'
    }
  };

  try {
    // Validate configuration
    const errors = generator.validateConfig(config);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }

    // Generate PDF
    console.log('Generating contact form PDF...');
    const result = await generator.generate(config);
    
    console.log(`✅ Success!`);
    console.log(`📄 Pages: ${result.pageCount}`);
    console.log(`📝 Interactive fields: ${result.fieldCount}`);
    console.log(`💾 Saved to: ${result.path}`);

  } catch (error) {
    console.error('❌ Generation failed:', error);
  } finally {
    // Always clean up resources
    await generator.destroy();
  }
}

// Run the example
if (require.main === module) {
  createBasicForm().catch(console.error);
}

export { createBasicForm };