import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { FormHelpers, PDFTailwindGenerator, rgb } from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSpacingDemo() {
  // Initialize the PDF generator
  const pdfGenerator = new PDFTailwindGenerator();
  await pdfGenerator.initialize({
    title: "Form Spacing Demo - Before & After Fix",
    author: "PDF-TailwindForms Library",
  });

  // Initialize form helpers
  const formHelpers = new FormHelpers(pdfGenerator);

  // Add a page
  pdfGenerator.addPage();

  let currentY = 750;
  const leftMargin = 50;
  const fieldHeight = 25;

  // Header
  pdfGenerator.drawText("Form Field Spacing Demo", leftMargin, currentY, {
    size: 20,
    tailwind: "font-bold text-blue-600",
  });

  currentY -= 20;

  pdfGenerator.drawText(
    "FIXED: Proper spacing between labels and fields",
    leftMargin,
    currentY,
    {
      size: 14,
      tailwind: "font-medium text-green-600",
    }
  );

  currentY -= 40;

  // Use the new createFormField method for consistent spacing
  let result = await formHelpers.createFormField({
    type: "text",
    label: "Full Name",
    name: "name",
    x: leftMargin,
    y: currentY,
    width: 200,
    height: fieldHeight,
    required: true,
    fieldOptions: {
      tailwind: {
        classes:
          "bg-white border-2 border-blue-300 text-gray-900 text-sm rounded p-2",
      },
    },
  });

  currentY = result.nextY - 20;

  result = await formHelpers.createFormField({
    type: "text",
    label: "Email Address",
    name: "email",
    x: leftMargin,
    y: currentY,
    width: 250,
    height: fieldHeight,
    required: true,
    fieldOptions: {
      tailwind: {
        classes:
          "bg-white border-2 border-blue-300 text-gray-900 text-sm rounded p-2",
      },
    },
  });

  currentY = result.nextY - 20;

  result = await formHelpers.createFormField({
    type: "number",
    label: "Age",
    name: "age",
    x: leftMargin,
    y: currentY,
    width: 100,
    height: fieldHeight,
    fieldOptions: {
      min: 18,
      max: 100,
      tailwind: {
        classes:
          "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right",
      },
    },
  });

  currentY = result.nextY - 20;

  result = await formHelpers.createFormField({
    type: "dropdown",
    label: "Country",
    name: "country",
    x: leftMargin,
    y: currentY,
    width: 150,
    height: fieldHeight,
    fieldOptions: {
      options: ["France", "USA", "UK", "Germany", "Spain", "Italy", "Canada"],
      defaultValue: "France",
      tailwind: {
        classes:
          "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
      },
    },
  });

  currentY = result.nextY - 30;

  // Checkbox with inline label
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

  currentY -= 50;

  // Multi-line comments field
  formHelpers.addFieldLabel("Comments", leftMargin, currentY, "comments");
  await pdfGenerator.addTextField({
    name: "comments",
    x: leftMargin,
    y: currentY - 80,
    width: 300,
    height: 60,
    multiline: true,
    defaultValue: "Please enter your comments here...",
    tailwind: {
      classes:
        "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2",
    },
  });

  currentY -= 120;

  // Submit button
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

  // Add demonstration text
  currentY -= 80;

  pdfGenerator.drawText("Key Improvements Made:", leftMargin, currentY, {
    size: 12,
    tailwind: "font-bold text-gray-800",
  });

  currentY -= 20;

  const improvements = [
    "- Increased default fieldSpacing from 10pt to 25pt",
    "- Labels positioned 20pt above fields (not overlapping)",
    "- Added createFormField() helper for consistent spacing",
    "- Enhanced addFieldLabel() with proper positioning",
    "- Fixed checkbox alignment with inline text",
    "- Improved multi-line field spacing",
  ];

  for (const improvement of improvements) {
    pdfGenerator.drawText(improvement, leftMargin, currentY, {
      size: 10,
      tailwind: "text-gray-700",
    });
    currentY -= 15;
  }

  // Save the PDF
  const pdfBytes = await pdfGenerator.save();

  // Ensure the output directory exists
  const outputDir = path.join(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "spacing-demo.pdf");
  fs.writeFileSync(outputPath, pdfBytes);

  console.log(`✅ Form spacing demo created successfully!`);
  console.log(`📄 Saved to: ${outputPath}`);

  return outputPath;
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  createSpacingDemo().catch(console.error);
}

export default createSpacingDemo;
