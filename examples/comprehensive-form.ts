import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';
import { FormHelpers, PDFTailwindGenerator, rgb } from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createComprehensiveForm() {
  // Initialize the PDF generator
  const pdfGenerator = new PDFTailwindGenerator();
  await pdfGenerator.initialize({
    title: "Comprehensive Form Example",
    author: "PDF-TailwindForms Library",
    subject: "Form with AcroFields and TailwindCSS styling",
  });

  // Initialize form helpers
  const formHelpers = new FormHelpers(pdfGenerator);

  // Add a page
  const page = pdfGenerator.addPage({
    width: 595.28,
    height: 841.89,
  });

  // Set theme colors
  pdfGenerator.setTheme({
    primaryColor: rgb(0.2, 0.4, 0.8),
    secondaryColor: rgb(0.5, 0.5, 0.5),
  });

  let currentY = 800;

  // Header
  pdfGenerator.drawText("Employee Information Form", 50, currentY, {
    size: 24,
    tailwind: "font-bold text-blue-800",
  });

  pdfGenerator.drawText(
    "Please fill out all required fields marked with *",
    50,
    currentY - 25,
    {
      size: 12,
      tailwind: "text-gray-600",
    }
  );

  currentY -= 60;

  // Section 1: Personal Information
  formHelpers.createFormSection(
    "Personal Information",
    "Basic personal details",
    50,
    currentY,
    500
  );
  currentY -= 60;

  // Name fields in a two-column layout
  const { columnWidth, columnPositions } = formHelpers.calculateColumnLayout(
    595.28,
    2,
    50
  );

  // First Name
  formHelpers.addFieldLabel(
    "First Name",
    columnPositions[0],
    currentY,
    "first_name",
    true
  );
  await pdfGenerator.addTextField({
    name: "first_name",
    x: columnPositions[0],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-blue-200 text-gray-900 text-sm rounded-md p-2",
    },
  });

  // Last Name
  formHelpers.addFieldLabel(
    "Last Name",
    columnPositions[1],
    currentY,
    "last_name",
    true
  );
  await pdfGenerator.addTextField({
    name: "last_name",
    x: columnPositions[1],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-blue-200 text-gray-900 text-sm rounded-md p-2",
    },
  });

  currentY -= 50;

  // Email
  formHelpers.addFieldLabel(
    "Email Address",
    columnPositions[0],
    currentY,
    "email",
    true
  );
  await pdfGenerator.addTextField({
    name: "email",
    x: columnPositions[0],
    y: currentY - 25,
    width: columnWidth * 2 + 20,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-blue-200 text-gray-900 text-sm rounded-md p-2",
    },
  });

  currentY -= 50;

  // Phone Number
  formHelpers.addFieldLabel(
    "Phone Number",
    columnPositions[0],
    currentY,
    "phone"
  );
  await pdfGenerator.addTextField({
    name: "phone",
    x: columnPositions[0],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  // Date of Birth
  formHelpers.addFieldLabel(
    "Date of Birth",
    columnPositions[1],
    currentY,
    "date_of_birth"
  );
  await formHelpers.createDateField({
    name: "date_of_birth",
    x: columnPositions[1],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    format: "MM/DD/YYYY",
    maxDate: new Date(),
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= 70;

  // Section 2: Employment Information
  formHelpers.createFormSection(
    "Employment Information",
    "Current position and department",
    50,
    currentY,
    500
  );
  currentY -= 60;

  // Job Title
  formHelpers.addFieldLabel(
    "Job Title",
    columnPositions[0],
    currentY,
    "job_title",
    true
  );
  await pdfGenerator.addTextField({
    name: "job_title",
    x: columnPositions[0],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-green-200 text-gray-900 text-sm rounded-md p-2",
    },
  });

  // Department Dropdown
  formHelpers.addFieldLabel(
    "Department",
    columnPositions[1],
    currentY,
    "department",
    true
  );
  await pdfGenerator.addDropdown({
    name: "department",
    x: columnPositions[1],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    options: [
      "Engineering",
      "Marketing",
      "Sales",
      "HR",
      "Finance",
      "Operations",
    ],
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-green-200 text-gray-900 text-sm rounded-md p-2",
    },
  });

  currentY -= 50;

  // Employment Type Radio Group
  formHelpers.addFieldLabel(
    "Employment Type",
    columnPositions[0],
    currentY,
    "employment_type",
    true
  );
  await pdfGenerator.addRadioGroup({
    name: "employment_type",
    options: [
      {
        value: "full_time",
        x: columnPositions[0],
        y: currentY - 25,
        width: 15,
        height: 15,
      },
      {
        value: "part_time",
        x: columnPositions[0] + 80,
        y: currentY - 25,
        width: 15,
        height: 15,
      },
      {
        value: "contract",
        x: columnPositions[0] + 160,
        y: currentY - 25,
        width: 15,
        height: 15,
      },
    ],
    defaultValue: "full_time",
    tailwind: { classes: "border-2 border-green-400" },
  });

  // Add radio button labels
  pdfGenerator.drawText("Full-time", columnPositions[0] + 20, currentY - 20, {
    size: 10,
  });
  pdfGenerator.drawText("Part-time", columnPositions[0] + 100, currentY - 20, {
    size: 10,
  });
  pdfGenerator.drawText("Contract", columnPositions[0] + 180, currentY - 20, {
    size: 10,
  });

  // Salary (Number field)
  formHelpers.addFieldLabel(
    "Annual Salary ($)",
    columnPositions[1],
    currentY,
    "salary"
  );
  await formHelpers.createNumberField({
    name: "salary",
    x: columnPositions[1],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    min: 20000,
    max: 500000,
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right",
    },
  });

  currentY -= 70;

  // Section 3: Skills and Experience
  formHelpers.createFormSection(
    "Skills and Experience",
    "Technical skills and work experience",
    50,
    currentY,
    500
  );
  currentY -= 60;

  // Skills Checkboxes
  formHelpers.addFieldLabel(
    "Technical Skills",
    columnPositions[0],
    currentY,
    "skills"
  );
  const skills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "React",
    "Node.js",
  ];

  let skillY = currentY - 25;
  for (let i = 0; i < skills.length; i++) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = columnPositions[col];
    const y = skillY - row * 25;

    await pdfGenerator.addCheckBox({
      name: `skill_${skills[i].toLowerCase().replace(".", "_")}`,
      x: x,
      y: y,
      width: 15,
      height: 15,
      tailwind: { classes: "border-2 border-purple-400" },
    });

    pdfGenerator.drawText(skills[i], x + 20, y + 3, { size: 10 });
  }

  currentY -= 100;

  // Experience Text Area
  formHelpers.addFieldLabel(
    "Work Experience",
    columnPositions[0],
    currentY,
    "experience"
  );
  await pdfGenerator.addTextField({
    name: "experience",
    x: columnPositions[0],
    y: currentY - 100,
    width: columnWidth * 2 + 20,
    height: 80,
    multiline: true,
    defaultValue: "Describe your relevant work experience...",
    tailwind: {
      classes:
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= 120;

  // Section 4: Additional Information
  formHelpers.createFormSection(
    "Additional Information",
    "Optional additional details",
    50,
    currentY,
    500
  );
  currentY -= 60;

  // Emergency Contact
  formHelpers.addFieldLabel(
    "Emergency Contact Name",
    columnPositions[0],
    currentY,
    "emergency_contact"
  );
  await pdfGenerator.addTextField({
    name: "emergency_contact",
    x: columnPositions[0],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  // Emergency Contact Phone
  formHelpers.addFieldLabel(
    "Emergency Contact Phone",
    columnPositions[1],
    currentY,
    "emergency_phone"
  );
  await pdfGenerator.addTextField({
    name: "emergency_phone",
    x: columnPositions[1],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= 50;

  // Languages (Multi-select list)
  formHelpers.addFieldLabel(
    "Languages Spoken",
    columnPositions[0],
    currentY,
    "languages"
  );
  await pdfGenerator.addOptionList({
    name: "languages",
    x: columnPositions[0],
    y: currentY - 80,
    width: columnWidth,
    height: 60,
    options: [
      "English",
      "Spanish",
      "French",
      "German",
      "Mandarin",
      "Japanese",
      "Arabic",
      "Portuguese",
    ],
    multiselect: true,
    defaultValues: ["English"],
    tailwind: {
      classes: "bg-white border border-gray-300 text-gray-900 text-sm",
    },
  });

  // Start Date
  formHelpers.addFieldLabel(
    "Preferred Start Date",
    columnPositions[1],
    currentY,
    "start_date"
  );
  await formHelpers.createDateField({
    name: "start_date",
    x: columnPositions[1],
    y: currentY - 25,
    width: columnWidth,
    height: 25,
    format: "MM/DD/YYYY",
    minDate: new Date(),
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= 100;

  // Signature Section
  formHelpers.createFormSection(
    "Signature",
    "Electronic signature and agreement",
    50,
    currentY,
    500
  );
  currentY -= 80;

  // Agreement Checkbox
  await pdfGenerator.addCheckBox({
    name: "agreement",
    x: columnPositions[0],
    y: currentY,
    width: 15,
    height: 15,
    tailwind: { classes: "border-2 border-red-400" },
  });

  pdfGenerator.drawText(
    "I certify that all information provided is accurate and complete.",
    columnPositions[0] + 20,
    currentY + 3,
    { size: 10, tailwind: "text-gray-700" }
  );

  currentY -= 30;

  // Signature Field
  await formHelpers.createSignatureField({
    name: "signature",
    x: columnPositions[0],
    y: currentY - 40,
    width: columnWidth,
    height: 30,
    required: true,
    tailwind: { classes: "border-2 border-gray-400 bg-gray-50" },
  });

  // Date Signed
  formHelpers.addFieldLabel(
    "Date Signed",
    columnPositions[1],
    currentY - 10,
    "date_signed"
  );
  await formHelpers.createDateField({
    name: "date_signed",
    x: columnPositions[1],
    y: currentY - 35,
    width: columnWidth,
    height: 25,
    format: "MM/DD/YYYY",
    defaultValue: new Date().toLocaleDateString(),
    tailwind: {
      classes:
        "bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  // Submit Button
  await pdfGenerator.addButton({
    name: "submit_button",
    label: "Submit Form",
    x: columnPositions[0],
    y: 50,
    width: 120,
    height: 35,
    tailwind: {
      classes:
        "bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-700",
    },
  });

  // Reset Button
  await pdfGenerator.addButton({
    name: "reset_button",
    label: "Reset Form",
    x: columnPositions[0] + 140,
    y: 50,
    width: 120,
    height: 35,
    tailwind: {
      classes:
        "bg-gray-500 text-white font-bold rounded-lg border-2 border-gray-600",
    },
  });

  // Set validation rules for required fields
  const requiredFields = [
    "first_name",
    "last_name",
    "email",
    "job_title",
    "department",
    "employment_type",
  ];
  for (const fieldName of requiredFields) {
    pdfGenerator.setFieldValidation(fieldName, {
      rules: [
        {
          type: "required",
          message: `${fieldName.replace("_", " ")} is required`,
        },
      ],
      validateOnBlur: true,
    });
  }

  // Save the PDF
  const pdfBytes = await pdfGenerator.save();

  // Ensure the output directory exists
  const outputDir = path.join(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "comprehensive-form-example.pdf");
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`✅ Comprehensive form created successfully!`);
  console.log(`📄 Saved to: ${outputPath}`);
  console.log(`📋 Form includes:`);
  console.log(`   • Personal Information section with validation`);
  console.log(`   • Employment details with dropdowns and radio buttons`);
  console.log(`   • Skills checkboxes and experience text area`);
  console.log(`   • Emergency contact information`);
  console.log(`   • Multi-language selection`);
  console.log(`   • Digital signature field`);
  console.log(`   • Submit and reset buttons`);
  console.log(`   • Full TailwindCSS styling throughout`);

  return outputPath;
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  createComprehensiveForm().catch(console.error);
}

export default createComprehensiveForm;
