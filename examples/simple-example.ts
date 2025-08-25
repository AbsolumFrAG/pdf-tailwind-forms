import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';
import { FormHelpers, PDFTailwindGenerator, rgb } from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSimpleForm() {
  // Initialize the PDF generator
  const pdfGenerator = new PDFTailwindGenerator();
  await pdfGenerator.initialize({
    title: "Simple Contact Form",
    author: "PDF-TailwindForms Library",
  });

  // Initialize form helpers
  const formHelpers = new FormHelpers(pdfGenerator);

  // Add a page
  pdfGenerator.addPage();

  let currentY = 750;
  const leftMargin = 50;
  const fieldHeight = 25;
  const fieldSpacing = 50; // Proper spacing between field groups

  // Header
  pdfGenerator.drawText("Contact Information Form", leftMargin, currentY, {
    size: 20,
    tailwind: "font-bold text-blue-600",
  });

  currentY -= 60;

  // Name field with proper spacing
  formHelpers.addFieldLabel("Full Name", leftMargin, currentY, "name", true);
  await pdfGenerator.addTextField({
    name: "name",
    x: leftMargin,
    y: currentY - 20, // Proper spacing below label
    width: 200,
    height: fieldHeight,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-blue-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= fieldSpacing;

  // Email field with proper spacing
  formHelpers.addFieldLabel("Email Address", leftMargin, currentY, "email", true);
  await pdfGenerator.addTextField({
    name: "email",
    x: leftMargin,
    y: currentY - 20, // Proper spacing below label
    width: 250,
    height: fieldHeight,
    defaultValue: "",
    tailwind: {
      classes:
        "bg-white border-2 border-blue-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= fieldSpacing;

  // Age field (number) with proper spacing
  formHelpers.addFieldLabel("Age", leftMargin, currentY, "age");
  await formHelpers.createNumberField({
    name: "age",
    x: leftMargin,
    y: currentY - 20, // Proper spacing below label
    width: 100,
    height: fieldHeight,
    min: 18,
    max: 100,
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right",
    },
  });

  currentY -= fieldSpacing;

  // Country dropdown with proper spacing
  formHelpers.addFieldLabel("Country", leftMargin, currentY, "country");
  await pdfGenerator.addDropdown({
    name: "country",
    x: leftMargin,
    y: currentY - 20, // Proper spacing below label
    width: 150,
    height: fieldHeight,
    options: ["France", "USA", "UK", "Germany", "Spain", "Italy", "Canada"],
    defaultValue: "France",
    tailwind: {
      classes:
        "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= fieldSpacing;

  // Newsletter checkbox with proper spacing
  await pdfGenerator.addCheckBox({
    name: "newsletter",
    x: leftMargin,
    y: currentY - 5,
    width: 15,
    height: 15,
    checked: false,
    tailwind: { classes: "border-2 border-green-400" },
  });

  pdfGenerator.drawText("Subscribe to newsletter", leftMargin + 25, currentY, {
    size: 11,
    tailwind: "text-gray-700",
  });

  currentY -= fieldSpacing;

  // Comments field (multiline) with proper spacing
  formHelpers.addFieldLabel("Comments", leftMargin, currentY, "comments");
  await pdfGenerator.addTextField({
    name: "comments",
    x: leftMargin,
    y: currentY - 80, // Space for multiline field
    width: 300,
    height: 60,
    multiline: true,
    defaultValue: "Please enter your comments here...",
    tailwind: {
      classes:
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= 100;

  // Submit button with proper spacing
  await pdfGenerator.addButton({
    name: "submit",
    label: "Submit Form",
    x: leftMargin,
    y: currentY,
    width: 120,
    height: 30,
    tailwind: {
      classes:
        "bg-green-600 text-white font-bold rounded border-2 border-green-700",
    },
  });

  // Save the PDF
  const pdfBytes = await pdfGenerator.save();

  // Ensure the output directory exists
  const outputDir = path.join(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "simple-contact-form.pdf");
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`✅ Simple contact form created successfully!`);
  console.log(`📄 Saved to: ${outputPath}`);

  return outputPath;
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  createSimpleForm().catch(console.error);
}

export default createSimpleForm;
