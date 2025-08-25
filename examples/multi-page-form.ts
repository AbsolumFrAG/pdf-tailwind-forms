#!/usr/bin/env node

/**
 * Multi-Page PDF Form Example
 * Demonstrates the new multi-page support with automatic page breaks,
 * headers, footers, page numbering, and content flow management.
 */

import { PDFTailwindGenerator } from '../src/core/pdf-generator.js';
import { FormHelpers } from '../src/utils/form-helpers.js';
import { rgb } from 'pdf-lib';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

async function createMultiPageForm() {
  console.log('🚀 Creating multi-page PDF form with automatic page breaks...');

  // Initialize PDF generator with multi-page configuration
  const pdfGenerator = new PDFTailwindGenerator({
    title: 'Multi-Page Employee Onboarding Form',
    author: 'PDF-Tailwind-Forms Library',
    subject: 'Employee Information Collection',
    keywords: ['onboarding', 'employee', 'multi-page', 'forms'],
    defaultPageOptions: {
      width: 595.28, // A4 width
      height: 841.89, // A4 height
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      orientation: 'portrait'
    },
    multiPageLayout: {
      autoPageBreak: true,
      pageBreakMargin: 30,
      headerHeight: 40,
      footerHeight: 30,
      pageNumbering: {
        enabled: true,
        position: 'bottom-center',
        format: 'Page {current} of {total}',
        fontSize: 10,
        color: rgb(0.4, 0.4, 0.4)
      },
      header: {
        enabled: true,
        content: 'CONFIDENTIAL - Employee Onboarding Form',
        fontSize: 12,
        color: rgb(0.3, 0.3, 0.3),
        alignment: 'center'
      },
      footer: {
        enabled: true,
        content: (pageNum, total) => `HR Department © 2024 | Page ${pageNum} of ${total} | Form ID: EMP-001`,
        fontSize: 8,
        color: rgb(0.5, 0.5, 0.5),
        alignment: 'center'
      }
    }
  });

  await pdfGenerator.initialize();
  const formHelpers = new FormHelpers(pdfGenerator);

  // Add first page
  pdfGenerator.addPage();
  console.log('📄 Added page 1');

  // Get content area for positioning
  const contentArea = pdfGenerator.getContentArea();
  let currentY = contentArea.y + contentArea.height - 50;
  const leftMargin = contentArea.x + 20;
  const rightMargin = contentArea.x + contentArea.width - 250;
  const fieldWidth = 200;
  const fieldHeight = 25;

  // Page 1: Personal Information
  console.log('✍️ Adding personal information section...');

  // Section 1: Personal Information
  formHelpers.createFormSection(
    'Section 1: Personal Information',
    'Please provide your basic personal details',
    leftMargin - 10,
    currentY,
    contentArea.width - 20,
    { autoPageBreak: true }
  );
  currentY -= 60;

  // Full Name (spans two columns)
  formHelpers.addFieldLabel('Full Name', leftMargin, currentY, 'full_name', true);
  currentY -= 20;
  await pdfGenerator.addTextField({
    name: 'full_name',
    x: leftMargin,
    y: currentY,
    width: fieldWidth * 2 + 50,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 40;

  // First Name and Last Name (two columns)
  formHelpers.addFieldLabel('First Name', leftMargin, currentY, 'first_name', true);
  formHelpers.addFieldLabel('Last Name', rightMargin, currentY, 'last_name', true);
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'first_name',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addTextField({
    name: 'last_name',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 40;

  // Email and Phone
  formHelpers.addFieldLabel('Email Address', leftMargin, currentY, 'email', true);
  formHelpers.addFieldLabel('Phone Number', rightMargin, currentY, 'phone', true);
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'email',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addTextField({
    name: 'phone',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 40;

  // Date of Birth and Social Security
  await formHelpers.createDateField({
    name: 'date_of_birth',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    format: 'MM/DD/YYYY',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  formHelpers.addFieldLabel('Date of Birth (MM/DD/YYYY)', leftMargin, currentY + fieldHeight + 5, 'date_of_birth', true);

  await pdfGenerator.addTextField({
    name: 'ssn',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    password: true,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  formHelpers.addFieldLabel('Social Security Number', rightMargin, currentY + fieldHeight + 5, 'ssn', true);
  currentY -= 60;

  // Address (multiline with automatic page breaks)
  formHelpers.addFieldLabel('Home Address', leftMargin, currentY, 'address', true);
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'address_line1',
    x: leftMargin,
    y: currentY,
    width: fieldWidth * 2 + 50,
    height: fieldHeight,
    placeholder: 'Street Address Line 1',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 35;

  await pdfGenerator.addTextField({
    name: 'address_line2',
    x: leftMargin,
    y: currentY,
    width: fieldWidth * 2 + 50,
    height: fieldHeight,
    placeholder: 'Street Address Line 2 (Optional)',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 35;

  // City, State, ZIP
  await pdfGenerator.addTextField({
    name: 'city',
    x: leftMargin,
    y: currentY,
    width: 150,
    height: fieldHeight,
    placeholder: 'City',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addTextField({
    name: 'state',
    x: leftMargin + 160,
    y: currentY,
    width: 80,
    height: fieldHeight,
    placeholder: 'State',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addTextField({
    name: 'zip',
    x: leftMargin + 250,
    y: currentY,
    width: 100,
    height: fieldHeight,
    placeholder: 'ZIP Code',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 60;

  // Section 2: Employment Information (this will likely trigger a page break)
  console.log('💼 Adding employment information section...');
  
  formHelpers.createFormSection(
    'Section 2: Employment Information',
    'Details about your position and employment terms',
    leftMargin - 10,
    currentY,
    contentArea.width - 20,
    { autoPageBreak: true }
  );
  currentY -= 60;

  // Position and Department
  formHelpers.addFieldLabel('Job Title/Position', leftMargin, currentY, 'position', true);
  formHelpers.addFieldLabel('Department', rightMargin, currentY, 'department', true);
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'position',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addDropdown({
    name: 'department',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 40;

  // Manager and Start Date
  formHelpers.addFieldLabel('Direct Manager', leftMargin, currentY, 'manager', true);
  formHelpers.addFieldLabel('Start Date', rightMargin, currentY, 'start_date', true);
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'manager',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await formHelpers.createDateField({
    name: 'start_date',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    format: 'MM/DD/YYYY',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 40;

  // Employment Type (Radio buttons)
  formHelpers.addFieldLabel('Employment Type', leftMargin, currentY, 'employment_type', true);
  currentY -= 20;

  await pdfGenerator.addRadioGroup({
    name: 'employment_type',
    options: [
      { value: 'full_time', x: leftMargin, y: currentY, width: 15, height: 15 },
      { value: 'part_time', x: leftMargin + 120, y: currentY, width: 15, height: 15 },
      { value: 'contract', x: leftMargin + 240, y: currentY, width: 15, height: 15 },
      { value: 'intern', x: leftMargin + 360, y: currentY, width: 15, height: 15 }
    ],
    tailwind: { classes: 'border border-gray-400' }
  });

  // Add labels for radio buttons
  pdfGenerator.drawText('Full-time', leftMargin + 20, currentY + 3, { size: 10 });
  pdfGenerator.drawText('Part-time', leftMargin + 140, currentY + 3, { size: 10 });
  pdfGenerator.drawText('Contract', leftMargin + 260, currentY + 3, { size: 10 });
  pdfGenerator.drawText('Intern', leftMargin + 380, currentY + 3, { size: 10 });
  currentY -= 50;

  // Salary Information
  formHelpers.addFieldLabel('Annual Salary', leftMargin, currentY, 'salary', true);
  formHelpers.addFieldLabel('Hourly Rate (if applicable)', rightMargin, currentY, 'hourly_rate');
  currentY -= 20;

  await formHelpers.createNumberField({
    name: 'salary',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    min: 0,
    decimals: 2,
    currencySymbol: '$',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right' }
  });

  await formHelpers.createNumberField({
    name: 'hourly_rate',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    min: 0,
    decimals: 2,
    currencySymbol: '$',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right' }
  });
  currentY -= 60;

  // Section 3: Benefits and Preferences (will trigger page break)
  console.log('🏥 Adding benefits section...');
  
  formHelpers.createFormSection(
    'Section 3: Benefits and Preferences',
    'Select your benefit options and preferences',
    leftMargin - 10,
    currentY,
    contentArea.width - 20,
    { autoPageBreak: true }
  );
  currentY -= 60;

  // Health Insurance
  formHelpers.addFieldLabel('Health Insurance Plan', leftMargin, currentY, 'health_plan', true);
  currentY -= 20;

  await pdfGenerator.addDropdown({
    name: 'health_plan',
    x: leftMargin,
    y: currentY,
    width: fieldWidth * 1.5,
    height: fieldHeight,
    options: [
      'Basic Plan - $50/month',
      'Premium Plan - $120/month',
      'Family Plan - $200/month',
      'Decline Coverage'
    ],
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 50;

  // Additional Benefits (Checkboxes)
  formHelpers.addFieldLabel('Additional Benefits (Select all that apply)', leftMargin, currentY, 'benefits');
  currentY -= 20;

  const benefitOptions = [
    { name: 'dental', label: 'Dental Insurance (+$25/month)', x: leftMargin, y: currentY },
    { name: 'vision', label: 'Vision Insurance (+$15/month)', x: leftMargin, y: currentY - 25 },
    { name: 'life', label: 'Life Insurance (+$10/month)', x: leftMargin, y: currentY - 50 },
    { name: 'disability', label: 'Disability Insurance (+$20/month)', x: leftMargin, y: currentY - 75 },
    { name: 'hsa', label: 'Health Savings Account', x: rightMargin, y: currentY },
    { name: '401k', label: '401(k) Retirement Plan', x: rightMargin, y: currentY - 25 },
    { name: 'parking', label: 'Parking Pass (+$50/month)', x: rightMargin, y: currentY - 50 },
    { name: 'gym', label: 'Gym Membership (+$30/month)', x: rightMargin, y: currentY - 75 }
  ];

  for (const benefit of benefitOptions) {
    await pdfGenerator.addCheckBox({
      name: benefit.name,
      x: benefit.x,
      y: benefit.y,
      width: 15,
      height: 15,
      tailwind: { classes: 'border border-gray-400' }
    });
    
    pdfGenerator.drawText(benefit.label, benefit.x + 20, benefit.y + 3, { size: 9 });
  }
  currentY -= 120;

  // Section 4: Emergency Contact (another page break likely)
  console.log('📞 Adding emergency contact section...');
  
  formHelpers.createFormSection(
    'Section 4: Emergency Contact Information',
    'Provide contact details for emergencies',
    leftMargin - 10,
    currentY,
    contentArea.width - 20,
    { autoPageBreak: true }
  );
  currentY -= 60;

  // Emergency Contact 1
  pdfGenerator.drawText('Primary Emergency Contact:', leftMargin, currentY, { 
    size: 12, 
    tailwind: 'font-semibold text-gray-800' 
  });
  currentY -= 30;

  // Contact Name and Relationship
  formHelpers.addFieldLabel('Full Name', leftMargin, currentY, 'emergency_name1', true);
  formHelpers.addFieldLabel('Relationship', rightMargin, currentY, 'emergency_relationship1', true);
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'emergency_name1',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addTextField({
    name: 'emergency_relationship1',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 40;

  // Contact Phone and Email
  formHelpers.addFieldLabel('Phone Number', leftMargin, currentY, 'emergency_phone1', true);
  formHelpers.addFieldLabel('Email Address', rightMargin, currentY, 'emergency_email1');
  currentY -= 20;

  await pdfGenerator.addTextField({
    name: 'emergency_phone1',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  await pdfGenerator.addTextField({
    name: 'emergency_email1',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });
  currentY -= 60;

  // Signature Section (will be on final page)
  console.log('✍️ Adding signature section...');
  
  formHelpers.createFormSection(
    'Section 5: Acknowledgment and Signature',
    'Please review and sign to complete your onboarding',
    leftMargin - 10,
    currentY,
    contentArea.width - 20,
    { autoPageBreak: true }
  );
  currentY -= 60;

  // Agreement text
  const agreementText = `I hereby acknowledge that I have read and understood all the information provided in this form. I certify that all information given is true and complete to the best of my knowledge. I understand that any false information may lead to the rejection of my application or termination of employment.

I agree to comply with all company policies and procedures, and I understand that my employment is subject to satisfactory completion of background checks and reference verification.`;

  pdfGenerator.drawText(agreementText, leftMargin, currentY, {
    size: 10,
    tailwind: 'text-gray-700',
    lineHeight: 14,
    autoPageBreak: true
  });
  currentY -= 80;

  // Signature fields
  await formHelpers.createSignatureField({
    name: 'employee_signature',
    x: leftMargin,
    y: currentY,
    width: fieldWidth,
    height: 40,
    required: true,
    tailwind: { classes: 'border border-gray-400' },
    autoPageBreak: true
  });

  await formHelpers.createDateField({
    name: 'signature_date',
    x: rightMargin,
    y: currentY,
    width: fieldWidth,
    height: fieldHeight,
    format: 'MM/DD/YYYY',
    tailwind: { classes: 'bg-white border border-gray-300 text-gray-900 text-sm rounded p-2' }
  });

  formHelpers.addFieldLabel('Employee Signature', leftMargin, currentY - 15, 'employee_signature', true);
  formHelpers.addFieldLabel('Date', rightMargin, currentY - 15, 'signature_date', true);

  // Add a large table to demonstrate table splitting across pages
  console.log('📊 Adding skills assessment table...');
  
  // This will force another page break and demonstrate table splitting
  await formHelpers.createTable({
    x: leftMargin,
    y: currentY - 100,
    rows: 15,
    columns: 4,
    cellWidth: 120,
    cellHeight: 25,
    headers: ['Skill', 'Experience Level', 'Years', 'Certification'],
    data: [
      ['JavaScript', 'Expert', '5+', 'Yes'],
      ['TypeScript', 'Advanced', '3-5', 'Yes'],
      ['React', 'Expert', '4+', 'Yes'],
      ['Node.js', 'Advanced', '3-4', 'No'],
      ['Python', 'Intermediate', '2-3', 'No'],
      ['SQL', 'Advanced', '4+', 'Yes'],
      ['AWS', 'Intermediate', '2-3', 'Yes'],
      ['Docker', 'Advanced', '3+', 'Yes'],
      ['Git', 'Expert', '5+', 'No'],
      ['Kubernetes', 'Beginner', '1', 'No'],
      ['GraphQL', 'Intermediate', '2', 'No'],
      ['MongoDB', 'Advanced', '3+', 'No'],
      ['Redis', 'Intermediate', '2+', 'No'],
      ['Linux', 'Advanced', '4+', 'No'],
    ],
    borderColor: rgb(0.3, 0.3, 0.3),
    borderWidth: 1,
    tailwind: { classes: 'bg-white' },
    autoPageBreak: true
  });

  // Final page statistics
  const pageCount = pdfGenerator.getPageCount();
  console.log(`📊 Generated ${pageCount} pages`);

  // Save the PDF
  const pdfBytes = await pdfGenerator.save();
  
  // Ensure output directory exists
  if (!existsSync('output')) {
    mkdirSync('output', { recursive: true });
  }

  writeFileSync('output/multi-page-form.pdf', pdfBytes);
  console.log('✅ Multi-page PDF saved as output/multi-page-form.pdf');
  console.log(`📄 Total pages: ${pageCount}`);
  console.log('🎉 Multi-page form generation completed successfully!');

  // Display features demonstrated
  console.log('\n🌟 Features demonstrated in this example:');
  console.log('   ✓ Automatic page breaks based on content overflow');
  console.log('   ✓ Headers and footers on every page');
  console.log('   ✓ Dynamic page numbering with custom format');
  console.log('   ✓ Content flow management across pages');
  console.log('   ✓ Form sections that respect page boundaries');
  console.log('   ✓ Table splitting across multiple pages');
  console.log('   ✓ Mixed field types (text, dropdown, radio, checkbox, signature)');
  console.log('   ✓ Custom page layouts and margins');
  console.log('   ✓ Professional multi-page form structure');
}

// Run the example
createMultiPageForm().catch(console.error);