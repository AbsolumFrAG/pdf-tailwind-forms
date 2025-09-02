/**
 * Template Usage Examples
 * 
 * Demonstrates how to use the built-in form and invoice templates
 * with various customization options.
 */

import PDFGenerator from '../src/index';
import { createFormTemplate } from '../src/templates/form';
import { createInvoiceTemplate } from '../src/templates/invoice';

async function demonstrateFormTemplate() {
  console.log('🎨 Creating form template...');
  
  const generator = new PDFGenerator();

  // Create a customer registration form
  const formConfig = createFormTemplate({
    title: 'Customer Registration',
    description: 'Join our platform to access exclusive features and benefits',
    theme: 'purple',
    fields: [
      {
        label: 'Full Name',
        name: 'fullName',
        type: 'text',
        required: true
      },
      {
        label: 'Email Address',
        name: 'email',
        type: 'email',
        required: true
      },
      {
        label: 'Phone Number',
        name: 'phone',
        type: 'phone'
      },
      {
        label: 'Company',
        name: 'company',
        type: 'text'
      },
      {
        label: 'Job Title',
        name: 'jobTitle',
        type: 'text'
      },
      {
        label: 'Industry',
        name: 'industry',
        type: 'select',
        options: [
          'Technology',
          'Healthcare',
          'Finance',
          'Education',
          'Manufacturing',
          'Retail',
          'Other'
        ],
        required: true
      },
      {
        label: 'How did you hear about us?',
        name: 'referralSource',
        type: 'select',
        options: [
          'Search Engine',
          'Social Media',
          'Friend/Colleague',
          'Advertisement',
          'Event/Conference',
          'Other'
        ]
      },
      {
        label: 'Additional Comments',
        name: 'comments',
        type: 'textarea'
      },
      {
        label: 'Subscribe to newsletter',
        name: 'newsletter',
        type: 'checkbox'
      },
      {
        label: 'Agree to Terms of Service',
        name: 'agreeTerms',
        type: 'checkbox',
        required: true
      }
    ],
    submitLabel: 'Complete Registration'
  });

  // Set output path
  formConfig.outputPath = './examples/output/registration-form.pdf';

  try {
    const result = await generator.generate(formConfig);
    console.log(`✅ Registration form created with ${result.fieldCount} fields`);
    console.log(`📄 Saved to: ${result.path}`);
  } catch (error) {
    console.error('❌ Form generation failed:', error);
  } finally {
    await generator.destroy();
  }
}

async function demonstrateInvoiceTemplate() {
  console.log('💰 Creating invoice template...');
  
  const generator = new PDFGenerator();

  // Create a professional service invoice
  const invoiceConfig = createInvoiceTemplate({
    // Company Information
    companyName: 'WebDev Solutions LLC',
    companyAddress: `1234 Technology Drive
Suite 100
Silicon Valley, CA 94025
Phone: (555) 123-4567
Email: billing@webdevsolutions.com`,

    // Client Information
    clientName: 'Startup Innovations Inc.',
    clientAddress: `5678 Business Avenue
Floor 15
New York, NY 10001`,

    // Invoice Details
    invoiceNumber: 'WDS-2024-0156',
    date: '2024-03-15',
    dueDate: '2024-04-15',

    // Line Items
    items: [
      {
        description: 'Website Design & Development',
        quantity: 1,
        price: 4500.00
      },
      {
        description: 'Custom CMS Integration',
        quantity: 1,
        price: 1800.00
      },
      {
        description: 'E-commerce Setup',
        quantity: 1,
        price: 2200.00
      },
      {
        description: 'SEO Optimization',
        quantity: 8,
        price: 125.00
      },
      {
        description: 'Mobile Responsive Design',
        quantity: 1,
        price: 800.00
      },
      {
        description: 'SSL Certificate Setup',
        quantity: 1,
        price: 99.00
      },
      {
        description: 'Training Session',
        quantity: 3,
        price: 150.00
      }
    ],

    // Financial Details
    tax: 8.75,    // California sales tax
    currency: '$'
  });

  // Set output path
  invoiceConfig.outputPath = './examples/output/service-invoice.pdf';

  try {
    const result = await generator.generate(invoiceConfig);
    
    console.log(`✅ Invoice created successfully!`);
    console.log(`📄 Pages: ${result.pageCount}`);
    console.log(`📝 Interactive fields: ${result.fieldCount}`);
    console.log(`💾 Saved to: ${result.path}`);
    
    // Calculate totals for logging
    const subtotal = invoiceConfig.items.reduce(
      (sum, item) => sum + (item.quantity * item.price), 
      0
    );
    const taxAmount = subtotal * (invoiceConfig.tax! / 100);
    const total = subtotal + taxAmount;
    
    console.log(`💵 Invoice totals:`);
    console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`   Tax (${invoiceConfig.tax}%): $${taxAmount.toFixed(2)}`);
    console.log(`   Total: $${total.toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Invoice generation failed:', error);
  } finally {
    await generator.destroy();
  }
}

async function demonstrateThemeVariations() {
  console.log('🎨 Creating theme variations...');
  
  const generator = new PDFGenerator();
  const themes = ['blue', 'green', 'purple', 'red'] as const;

  for (const theme of themes) {
    const config = createFormTemplate({
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Demo`,
      description: `Demonstration of the ${theme} color theme`,
      theme,
      fields: [
        { label: 'Sample Text', name: 'text', type: 'text' },
        { label: 'Sample Email', name: 'email', type: 'email' },
        { label: 'Sample Checkbox', name: 'check', type: 'checkbox' },
        { 
          label: 'Sample Select', 
          name: 'select', 
          type: 'select',
          options: ['Option 1', 'Option 2', 'Option 3']
        }
      ]
    });

    config.outputPath = `./examples/output/theme-${theme}.pdf`;

    try {
      const result = await generator.generate(config);
      console.log(`✅ ${theme} theme created: ${result.path}`);
    } catch (error) {
      console.error(`❌ Failed to create ${theme} theme:`, error);
    }
  }

  await generator.destroy();
}

async function demonstrateBatchProcessing() {
  console.log('📦 Demonstrating batch processing...');
  
  const generator = new PDFGenerator();

  // Create multiple forms in batch
  const configs = [
    createFormTemplate({
      title: 'Feedback Form',
      theme: 'green',
      fields: [
        { label: 'Rating', name: 'rating', type: 'select', 
          options: ['Excellent', 'Good', 'Average', 'Poor'] },
        { label: 'Comments', name: 'comments', type: 'textarea' }
      ]
    }),
    
    createFormTemplate({
      title: 'Survey Form',
      theme: 'blue',
      fields: [
        { label: 'Age Group', name: 'age', type: 'select',
          options: ['18-25', '26-35', '36-45', '46-55', '55+'] },
        { label: 'Satisfaction', name: 'satisfaction', type: 'select',
          options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'] }
      ]
    }),

    createInvoiceTemplate({
      companyName: 'Quick Services Inc.',
      clientName: 'ABC Corporation',
      items: [
        { description: 'Consulting', quantity: 2, price: 200.00 }
      ],
      invoiceNumber: 'QS-001',
      tax: 10
    })
  ];

  // Set output paths
  configs[0].outputPath = './examples/output/feedback-batch.pdf';
  configs[1].outputPath = './examples/output/survey-batch.pdf';
  configs[2].outputPath = './examples/output/invoice-batch.pdf';

  try {
    const results = await generator.generateBatch(configs);
    console.log(`✅ Batch completed: ${results.length} PDFs generated`);
    
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.path} (${result.fieldCount} fields)`);
    });
    
  } catch (error) {
    console.error('❌ Batch processing failed:', error);
  } finally {
    await generator.destroy();
  }
}

// Main demonstration function
async function runExamples() {
  console.log('🚀 Starting template demonstrations...\n');

  try {
    await demonstrateFormTemplate();
    console.log('');
    
    await demonstrateInvoiceTemplate();
    console.log('');
    
    await demonstrateThemeVariations();
    console.log('');
    
    await demonstrateBatchProcessing();
    console.log('');
    
    console.log('🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('💥 Example execution failed:', error);
  }
}

// Export individual functions for testing
export {
  demonstrateFormTemplate,
  demonstrateInvoiceTemplate, 
  demonstrateThemeVariations,
  demonstrateBatchProcessing,
  runExamples
};

// Run examples if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}