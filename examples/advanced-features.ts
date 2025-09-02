/**
 * Advanced Features Example
 * 
 * Demonstrates advanced features including:
 * - Custom positioning with absolute coordinates
 * - Form validation and error handling
 * - Working with existing PDFs
 * - Custom styling and fonts
 * - Complex field configurations
 */

import PDFGenerator, { 
  GenerateConfig, 
  FormField, 
  TextField,
  CheckboxField,
  RadioField,
  DropdownField,
  FillData,
  Position
} from '../src/index';
import { PDFValidator } from '../src/validator';

async function demonstrateAbsolutePositioning() {
  console.log('📍 Demonstrating absolute positioning...');
  
  const generator = new PDFGenerator();

  // Define exact positions for fields
  const positions = {
    title: { x: 50, y: 750, width: 500, height: 30 },
    name: { x: 50, y: 680, width: 200, height: 25 },
    email: { x: 300, y: 680, width: 200, height: 25 },
    address: { x: 50, y: 620, width: 450, height: 60 },
    signature: { x: 50, y: 100, width: 200, height: 60 }
  };

  const config: GenerateConfig = {
    content: `
      <div style="width: 595px; height: 842px; position: relative; background: white; padding: 0; margin: 0;">
        <!-- Absolute positioned content -->
        <div style="position: absolute; top: 50px; left: 50px; font-size: 24px; font-weight: bold;">
          Application Form
        </div>
        <div style="position: absolute; top: 120px; left: 50px; font-size: 12px;">
          Name: ____________________
        </div>
        <div style="position: absolute; top: 120px; left: 300px; font-size: 12px;">
          Email: ____________________
        </div>
        <div style="position: absolute; top: 180px; left: 50px; font-size: 12px;">
          Address: 
          <br><br><br>
        </div>
        <div style="position: absolute; bottom: 150px; left: 50px; font-size: 12px;">
          Signature: ____________________
        </div>
      </div>
    `,
    
    fields: [
      {
        name: 'applicantName',
        type: 'text',
        position: positions.name,
        required: true,
        fontSize: 11,
        borderWidth: 0
      } as TextField,
      {
        name: 'applicantEmail',
        type: 'text',
        position: positions.email,
        required: true,
        fontSize: 11,
        borderWidth: 0
      } as TextField,
      {
        name: 'applicantAddress',
        type: 'text',
        position: positions.address,
        multiline: true,
        fontSize: 10,
        borderWidth: 0
      } as TextField,
      {
        name: 'applicantSignature',
        type: 'signature',
        position: positions.signature,
        borderWidth: 1,
        borderColor: [100, 100, 100]
      }
    ],

    outputPath: './examples/output/absolute-positioning.pdf',
    
    pdfOptions: {
      format: 'A4',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true
    },

    metadata: {
      title: 'Absolute Positioning Demo',
      creator: 'Advanced Features Example'
    }
  };

  try {
    const result = await generator.generate(config);
    console.log(`✅ Absolute positioning demo created: ${result.path}`);
    return result.path;
  } catch (error) {
    console.error('❌ Absolute positioning failed:', error);
    throw error;
  } finally {
    await generator.destroy();
  }
}

async function demonstrateValidation() {
  console.log('🔍 Demonstrating validation...');
  
  const validator = new PDFValidator();

  // Test invalid configuration
  const invalidConfig: GenerateConfig = {
    content: '', // Empty content (invalid)
    fields: [
      {
        name: 'duplicate',
        type: 'text',
        selector: '.test'
      } as TextField,
      {
        name: 'duplicate', // Duplicate name (invalid)
        type: 'checkbox',
        selector: '.test2'
      } as CheckboxField,
      {
        name: 'invalidRadio',
        type: 'radio',
        selector: '.radio',
        options: [] // Empty options (invalid)
      } as RadioField
    ]
  };

  const validationResult = validator.validate(invalidConfig);
  
  if (!validationResult.valid) {
    console.log('❌ Configuration validation failed (expected):');
    validationResult.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
  }

  // Test valid configuration
  const validConfig: GenerateConfig = {
    content: '<div class="p-8"><div class="name-field border h-10"></div></div>',
    fields: [
      {
        name: 'userName',
        type: 'text',
        selector: '.name-field',
        required: true
      } as TextField
    ]
  };

  const validResult = validator.validate(validConfig);
  if (validResult.valid) {
    console.log('✅ Valid configuration passed validation');
  }
}

async function demonstrateExistingPDFOperations() {
  console.log('📄 Demonstrating existing PDF operations...');
  
  const generator = new PDFGenerator();

  try {
    // First, create a template PDF
    const templatePath = './examples/output/template-for-filling.pdf';
    
    const templateConfig = createFormTemplate({
      title: 'Data Collection Form',
      theme: 'green',
      fields: [
        { label: 'Participant Name', name: 'participantName', type: 'text', required: true },
        { label: 'Study ID', name: 'studyId', type: 'text', required: true },
        { label: 'Consent Given', name: 'consent', type: 'checkbox' }
      ]
    });
    
    templateConfig.outputPath = templatePath;
    await generator.generate(templateConfig);
    console.log(`✅ Template created: ${templatePath}`);

    // Fill the template with data
    const fillData: FillData = {
      participantName: 'Dr. Sarah Johnson',
      studyId: 'STUDY-2024-042',
      consent: true
    };

    const filledPath = './examples/output/filled-form.pdf';
    await generator.fillExistingPDF(templatePath, fillData, filledPath);
    console.log(`✅ PDF filled with data: ${filledPath}`);

    // Extract data back from the filled PDF
    const extractedData = await generator.extractFormData(filledPath);
    console.log('📤 Extracted data:', extractedData);

    // Verify the data matches
    const dataMatches = Object.keys(fillData).every(
      key => extractedData[key] === fillData[key]
    );
    
    if (dataMatches) {
      console.log('✅ Data extraction successful - all values match');
    } else {
      console.log('⚠️ Data extraction completed but some values differ');
    }

  } catch (error) {
    console.error('❌ PDF operations failed:', error);
  } finally {
    await generator.destroy();
  }
}

async function demonstrateCustomStyling() {
  console.log('🎨 Demonstrating custom styling...');
  
  const generator = new PDFGenerator({
    tailwindCDN: 'https://cdn.tailwindcss.com',
    defaultFontSize: 13
  });

  const config: GenerateConfig = {
    content: `
      <div class="min-h-screen custom-bg p-8">
        <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl custom-border">
          <div class="custom-header text-white p-8 rounded-t-2xl">
            <h1 class="text-4xl font-bold custom-font">Premium Application</h1>
            <p class="mt-3 text-xl opacity-90">Exclusive membership form</p>
          </div>
          
          <div class="p-8 space-y-8">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="custom-label">Full Name</label>
                <div class="name-field custom-input"></div>
              </div>
              <div>
                <label class="custom-label">Email</label>
                <div class="email-field custom-input"></div>
              </div>
            </div>
            
            <div>
              <label class="custom-label">Membership Level</label>
              <div class="level-field custom-input"></div>
            </div>
            
            <div class="premium-checkbox flex items-center space-x-3">
              <div class="w-6 h-6 border-2 border-gold rounded"></div>
              <span class="custom-label">I agree to premium terms ($299/year)</span>
            </div>
            
            <div class="submit-btn custom-button">
              Join Premium Membership
            </div>
          </div>
        </div>
      </div>
    `,

    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
      
      .custom-font {
        font-family: 'Playfair Display', serif;
      }
      
      .custom-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .custom-header {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      
      .custom-border {
        border: 3px solid #f093fb;
      }
      
      .custom-label {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
        display: block;
        margin-bottom: 8px;
      }
      
      .custom-input {
        width: 100%;
        height: 45px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        background: #f9fafb;
        transition: all 0.2s;
      }
      
      .custom-input:focus {
        border-color: #f093fb;
        background: white;
        box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.1);
      }
      
      .custom-button {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 16px 32px;
        border-radius: 12px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(240, 147, 251, 0.3);
        transition: all 0.3s;
      }
      
      .border-gold {
        border-color: #fbbf24 !important;
      }
    `,

    fields: [
      {
        name: 'memberName',
        type: 'text',
        selector: '.name-field',
        required: true,
        fontSize: 13,
        offsetX: 12,
        offsetY: -8,
        backgroundColor: [249, 250, 251]
      } as TextField,
      {
        name: 'memberEmail',
        type: 'text',
        selector: '.email-field',
        required: true,
        fontSize: 13,
        offsetX: 12,
        offsetY: -8,
        backgroundColor: [249, 250, 251]
      } as TextField,
      {
        name: 'membershipLevel',
        type: 'dropdown',
        selector: '.level-field',
        options: ['Gold ($299/year)', 'Platinum ($599/year)', 'Diamond ($999/year)'],
        defaultValue: 'Gold ($299/year)',
        fontSize: 13,
        offsetX: 12,
        offsetY: -8,
        backgroundColor: [249, 250, 251]
      } as DropdownField,
      {
        name: 'agreePremium',
        type: 'checkbox',
        selector: '.premium-checkbox',
        required: true,
        size: 20,
        offsetX: 3,
        offsetY: 3,
        borderColor: [251, 191, 36]
      } as CheckboxField,
      {
        name: 'joinPremium',
        type: 'button',
        selector: '.submit-btn',
        label: 'JOIN PREMIUM',
        action: 'submit',
        borderWidth: 0
      }
    ],

    outputPath: './examples/output/custom-styling.pdf',

    metadata: {
      title: 'Premium Membership Application',
      author: 'Premium Services Inc.',
      subject: 'Membership Application',
      keywords: ['membership', 'premium', 'application'],
      creator: 'Advanced Features Demo'
    }
  };

  try {
    const result = await generator.generate(config);
    console.log(`✅ Custom styled PDF created: ${result.path}`);
    return result.path;
  } catch (error) {
    console.error('❌ Custom styling failed:', error);
    throw error;
  } finally {
    await generator.destroy();
  }
}

async function demonstrateComplexFieldTypes() {
  console.log('🔧 Demonstrating complex field configurations...');
  
  const generator = new PDFGenerator();

  const config: GenerateConfig = {
    content: `
      <div class="min-h-screen bg-gray-100 p-8">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          <div class="bg-indigo-600 text-white p-6 rounded-t-lg">
            <h1 class="text-3xl font-bold">Complex Form Demo</h1>
          </div>
          
          <div class="p-8 space-y-8">
            <!-- Radio Group -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Priority Level</h3>
              <div class="priority-group space-y-3">
                <div class="flex items-center">
                  <div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></div>
                  <span>Low Priority</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></div>
                  <span>Medium Priority</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></div>
                  <span>High Priority</span>
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></div>
                  <span>Critical</span>
                </div>
              </div>
            </div>

            <!-- Multi-select Dropdown -->
            <div>
              <label class="block text-lg font-semibold mb-2">Department</label>
              <div class="department-field w-full h-12 border-2 border-gray-300 rounded"></div>
            </div>

            <!-- Password Field -->
            <div>
              <label class="block text-lg font-semibold mb-2">Temporary Password</label>
              <div class="password-field w-full h-12 border-2 border-gray-300 rounded"></div>
            </div>

            <!-- Large Text Area -->
            <div>
              <label class="block text-lg font-semibold mb-2">Detailed Description</label>
              <div class="description-field w-full h-32 border-2 border-gray-300 rounded"></div>
            </div>

            <!-- Multiple Checkboxes -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Services Requested</h3>
              <div class="services-group grid grid-cols-2 gap-4">
                <div class="consulting-checkbox flex items-center">
                  <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3"></div>
                  <span>Consulting Services</span>
                </div>
                <div class="development-checkbox flex items-center">
                  <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3"></div>
                  <span>Software Development</span>
                </div>
                <div class="training-checkbox flex items-center">
                  <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3"></div>
                  <span>Training & Support</span>
                </div>
                <div class="maintenance-checkbox flex items-center">
                  <div class="w-5 h-5 border-2 border-gray-300 rounded mr-3"></div>
                  <span>Maintenance</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4">
              <div class="submit-btn bg-indigo-600 text-white px-8 py-3 rounded-lg">
                Submit Request
              </div>
              <div class="reset-btn bg-gray-500 text-white px-8 py-3 rounded-lg">
                Reset Form
              </div>
            </div>
          </div>
        </div>
      </div>
    `,

    fields: [
      // Radio group with custom spacing
      {
        name: 'priority',
        type: 'radio',
        selector: '.priority-group',
        options: [
          { value: 'low', label: 'Low Priority' },
          { value: 'medium', label: 'Medium Priority' },
          { value: 'high', label: 'High Priority' },
          { value: 'critical', label: 'Critical' }
        ],
        defaultValue: 'medium',
        spacing: 35,
        size: 16,
        required: true
      } as RadioField,

      // Editable dropdown
      {
        name: 'department',
        type: 'dropdown',
        selector: '.department-field',
        options: [
          'Engineering',
          'Sales',
          'Marketing', 
          'Support',
          'Operations',
          'Finance',
          'Human Resources'
        ],
        editable: true,
        fontSize: 12,
        offsetX: 10,
        offsetY: -6
      } as DropdownField,

      // Password field
      {
        name: 'tempPassword',
        type: 'text',
        selector: '.password-field',
        password: true,
        maxLength: 20,
        fontSize: 14,
        offsetX: 10,
        offsetY: -6,
        fontColor: [51, 51, 51]
      } as TextField,

      // Large multiline text
      {
        name: 'description',
        type: 'text',
        selector: '.description-field',
        multiline: true,
        maxLength: 2000,
        fontSize: 11,
        offsetX: 10,
        offsetY: -8,
        height: 100
      } as TextField,

      // Multiple checkboxes
      {
        name: 'consulting',
        type: 'checkbox',
        selector: '.consulting-checkbox',
        size: 18,
        offsetX: 2,
        offsetY: 2
      } as CheckboxField,
      {
        name: 'development',
        type: 'checkbox',
        selector: '.development-checkbox',
        size: 18,
        offsetX: 2,
        offsetY: 2
      } as CheckboxField,
      {
        name: 'training',
        type: 'checkbox',
        selector: '.training-checkbox',
        size: 18,
        offsetX: 2,
        offsetY: 2
      } as CheckboxField,
      {
        name: 'maintenance',
        type: 'checkbox',
        selector: '.maintenance-checkbox',
        size: 18,
        offsetX: 2,
        offsetY: 2
      } as CheckboxField,

      // Action buttons
      {
        name: 'submitRequest',
        type: 'button',
        selector: '.submit-btn',
        label: 'SUBMIT REQUEST',
        action: 'submit',
        borderWidth: 0
      },
      {
        name: 'resetForm',
        type: 'button',
        selector: '.reset-btn',
        label: 'RESET FORM',
        action: 'reset',
        borderWidth: 0
      }
    ],

    outputPath: './examples/output/complex-fields.pdf',

    customCSS: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      body {
        font-family: 'Inter', sans-serif;
      }
      
      .custom-input:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }
    `,

    metadata: {
      title: 'Complex Field Types Demo',
      creator: 'Advanced Features Example'
    }
  };

  try {
    const result = await generator.generate(config);
    console.log(`✅ Complex fields demo created: ${result.path}`);
    console.log(`📝 Total interactive fields: ${result.fieldCount}`);
    return result.path;
  } catch (error) {
    console.error('❌ Complex fields demo failed:', error);
    throw error;
  } finally {
    await generator.destroy();
  }
}

async function demonstrateErrorHandling() {
  console.log('🛡️ Demonstrating error handling...');
  
  const generator = new PDFGenerator();

  // Test various error scenarios
  const errorScenarios = [
    {
      name: 'Empty Content',
      config: { content: '', fields: [] }
    },
    {
      name: 'Invalid Selector',
      config: {
        content: '<div>Test</div>',
        fields: [{ name: 'test', type: 'text', selector: '.nonexistent' }]
      }
    },
    {
      name: 'Missing Field Name',
      config: {
        content: '<div class="test">Test</div>',
        fields: [{ name: '', type: 'text', selector: '.test' }]
      }
    }
  ];

  for (const scenario of errorScenarios) {
    try {
      console.log(`  Testing: ${scenario.name}`);
      await generator.generate(scenario.config as any);
      console.log(`  ⚠️ Expected error but generation succeeded`);
    } catch (error) {
      console.log(`  ✅ Correctly caught error: ${error.message.substring(0, 50)}...`);
    }
  }

  await generator.destroy();
}

// Main function to run all advanced examples
async function runAdvancedExamples() {
  console.log('🚀 Running advanced features demonstrations...\n');

  try {
    await demonstrateAbsolutePositioning();
    console.log('');
    
    await demonstrateValidation();
    console.log('');
    
    await demonstrateExistingPDFOperations();
    console.log('');
    
    await demonstrateCustomStyling();
    console.log('');
    
    await demonstrateComplexFieldTypes();
    console.log('');
    
    await demonstrateErrorHandling();
    console.log('');
    
    console.log('🎉 All advanced examples completed successfully!');
    
  } catch (error) {
    console.error('💥 Advanced examples failed:', error);
  }
}

// Export functions for individual testing
export {
  demonstrateAbsolutePositioning,
  demonstrateValidation,
  demonstrateExistingPDFOperations,
  demonstrateCustomStyling,
  demonstrateComplexFieldTypes,
  demonstrateErrorHandling,
  runAdvancedExamples
};

// Run if called directly
if (require.main === module) {
  runAdvancedExamples().catch(console.error);
}