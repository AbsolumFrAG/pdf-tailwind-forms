import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PDFTailwindGenerator } from "../../src/core/pdf-generator.js";
import { FormHelpers } from "../../src/utils/form-helpers.js";
import { TailwindToPDFConverter } from "../../src/styles/tailwind-converter.js";
import { PDFDocument, rgb } from "pdf-lib";

// We test the real implementations but mock pdf-lib for integration testing
vi.mock("pdf-lib", () => {
  const mockPdfDoc = {
    getForm: vi.fn(),
    addPage: vi.fn(),
    setTitle: vi.fn(),
    setAuthor: vi.fn(),
    setSubject: vi.fn(),
    save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
    embedFont: vi.fn(),
    embedPng: vi.fn(),
  };

  const mockForm = {
    createTextField: vi.fn(),
    createCheckBox: vi.fn(),
    createRadioGroup: vi.fn(),
    createDropdown: vi.fn(),
    createButton: vi.fn(),
    flatten: vi.fn(),
  };

  const mockPage = {
    drawText: vi.fn(),
    drawRectangle: vi.fn(),
  };

  const mockField = {
    setText: vi.fn(),
    setMaxLength: vi.fn(),
    enableMultiline: vi.fn(),
    enablePassword: vi.fn(),
    addToPage: vi.fn(),
    check: vi.fn(),
    addOptionToPage: vi.fn(),
    select: vi.fn(),
    addOptions: vi.fn(),
    enableMultiselect: vi.fn(),
    enableEditing: vi.fn(),
    enableSorting: vi.fn(),
    enableSpellChecking: vi.fn(),
  };

  mockPdfDoc.getForm.mockReturnValue(mockForm);
  mockPdfDoc.addPage.mockReturnValue(mockPage);
  mockForm.createTextField.mockReturnValue(mockField);
  mockForm.createCheckBox.mockReturnValue(mockField);
  mockForm.createRadioGroup.mockReturnValue(mockField);
  mockForm.createDropdown.mockReturnValue(mockField);
  mockForm.createButton.mockReturnValue(mockField);

  return {
    PDFDocument: {
      create: vi.fn().mockResolvedValue(mockPdfDoc),
    },
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "Helvetica-Bold",
    },
    rgb: vi.fn((r, g, b) => ({ r, g, b, type: "Color" })),
    grayscale: vi.fn((gray) => ({ gray, type: "Grayscale" })),
  };
});

describe("PDF TailwindForms Integration Tests", () => {
  let generator: PDFTailwindGenerator;
  let helpers: FormHelpers;

  beforeEach(async () => {
    generator = new PDFTailwindGenerator();
    await generator.initialize({
      title: "Integration Test Form",
      author: "Test Suite",
      subject: "Integration Testing",
    });
    generator.addPage();
    helpers = new FormHelpers(generator);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete Form Creation Workflow", () => {
    it("should create a complete contact form", async () => {
      // Create form sections
      helpers.createFormSection(
        "Personal Information",
        "Please provide your details",
        50,
        750,
        500
      );

      // Add text fields with Tailwind styling
      await generator.addTextField({
        name: "firstName",
        x: 60,
        y: 680,
        width: 200,
        height: 30,
        defaultValue: "",
        tailwind: {
          classes:
            "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5",
        },
      });

      await generator.addTextField({
        name: "lastName",
        x: 280,
        y: 680,
        width: 200,
        height: 30,
        tailwind: {
          classes:
            "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5",
        },
      });

      await generator.addTextField({
        name: "email",
        x: 60,
        y: 630,
        width: 420,
        height: 30,
        tailwind: {
          classes:
            "bg-white border-2 border-blue-500 text-gray-900 text-sm rounded-lg p-2.5",
        },
      });

      // Add checkboxes
      await generator.addCheckBox({
        name: "newsletter",
        x: 60,
        y: 580,
        width: 20,
        height: 20,
        checked: true,
        tailwind: {
          classes: "text-blue-600 bg-gray-100 border-gray-300 rounded",
        },
      });

      // Add radio group
      await generator.addRadioGroup({
        name: "contact_method",
        options: [
          { value: "email", x: 60, y: 530, width: 20, height: 20 },
          { value: "phone", x: 200, y: 530, width: 20, height: 20 },
          { value: "mail", x: 340, y: 530, width: 20, height: 20 },
        ],
        defaultValue: "email",
        tailwind: {
          classes: "text-blue-600 bg-gray-100 border-gray-300",
        },
      });

      // Add dropdown
      await generator.addDropdown({
        name: "country",
        x: 60,
        y: 480,
        width: 200,
        height: 30,
        options: ["United States", "Canada", "United Kingdom", "France"],
        defaultValue: "United States",
        tailwind: {
          classes:
            "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg",
        },
      });

      // Add button
      await generator.addButton({
        name: "submit",
        x: 60,
        y: 430,
        width: 100,
        height: 40,
        label: "Submit",
        tailwind: {
          classes:
            "text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm",
        },
      });

      // Add labels
      helpers.addFieldLabel("First Name", 60, 705, "firstName", true);
      helpers.addFieldLabel("Last Name", 280, 705, "lastName", true);
      helpers.addFieldLabel("Email Address", 60, 655, "email", true);
      helpers.addFieldLabel("Subscribe to Newsletter", 85, 585, "newsletter");

      // Draw text for radio options
      generator.drawText("Email", 85, 535, {
        size: 12,
        tailwind: "text-gray-700",
      });
      generator.drawText("Phone", 225, 535, {
        size: 12,
        tailwind: "text-gray-700",
      });
      generator.drawText("Mail", 365, 535, {
        size: 12,
        tailwind: "text-gray-700",
      });

      helpers.addFieldLabel("Country", 60, 505, "country");
      helpers.addFieldLabel(
        "Preferred Contact Method",
        60,
        555,
        "contact_method"
      );

      // Save the PDF
      const pdfBytes = await generator.save();

      // Verify the workflow completed successfully
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(0);

      // Verify that all components were created
      expect(generator.getAllFields().size).toBe(7); // firstName, lastName, email, newsletter, contact_method, country, submit
      expect(generator.getField("firstName")).toBeDefined();
      expect(generator.getField("lastName")).toBeDefined();
      expect(generator.getField("email")).toBeDefined();
      expect(generator.getField("newsletter")).toBeDefined();
      expect(generator.getField("contact_method")).toBeDefined();
      expect(generator.getField("country")).toBeDefined();
      expect(generator.getField("submit")).toBeDefined();
    });

    it("should create a form with date and number fields using helpers", async () => {
      helpers.createFormSection(
        "Employee Information",
        "Employment details",
        50,
        750,
        500
      );

      // Create date field with validation
      await helpers.createDateField({
        name: "startDate",
        x: 60,
        y: 680,
        width: 150,
        height: 30,
        format: "MM/DD/YYYY",
        minDate: new Date("2020-01-01"),
        maxDate: new Date("2030-12-31"),
      });

      // Create number field with validation
      await helpers.createNumberField({
        name: "salary",
        x: 230,
        y: 680,
        width: 120,
        height: 30,
        min: 30000,
        max: 200000,
      });

      // Create signature field
      await helpers.createSignatureField({
        name: "signature",
        x: 60,
        y: 600,
        width: 300,
        height: 60,
        required: true,
      });

      // Add labels
      helpers.addFieldLabel("Start Date", 60, 705, "startDate", true);
      helpers.addFieldLabel("Annual Salary", 230, 705, "salary", true);

      // Verify helper methods were used correctly
      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);

      // Verify fields exist
      expect(generator.getField("startDate")).toBeDefined();
      expect(generator.getField("salary")).toBeDefined();
    });

    it("should create a form with table layout", async () => {
      helpers.createFormSection(
        "Employee List",
        "Current team members",
        50,
        750,
        500
      );

      // Create a table
      await helpers.createTable({
        x: 60,
        y: 650,
        rows: 4,
        columns: 3,
        cellWidth: 140,
        cellHeight: 30,
        headers: ["Name", "Department", "Salary"],
        data: [
          ["John Doe", "Engineering", "$75,000"],
          ["Jane Smith", "Marketing", "$65,000"],
          ["Bob Johnson", "Sales", "$70,000"],
        ],
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
      });

      // Add some form fields below the table
      await generator.addTextField({
        name: "newEmployeeName",
        x: 60,
        y: 500,
        width: 200,
        height: 30,
        tailwind: {
          classes:
            "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
        },
      });

      helpers.addFieldLabel("Add New Employee", 60, 525, "newEmployeeName");

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(generator.getField("newEmployeeName")).toBeDefined();
    });
  });

  describe("Tailwind Style Integration", () => {
    it("should apply multiple Tailwind classes correctly", async () => {
      await generator.addTextField({
        name: "styledField",
        x: 100,
        y: 200,
        width: 300,
        height: 40,
        tailwind: {
          classes:
            "bg-blue-50 border-2 border-blue-500 text-blue-900 text-lg font-bold rounded-xl p-4 shadow-lg",
        },
      });

      // The style converter should have been used internally
      expect(generator.getField("styledField")).toBeDefined();

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
    });

    it("should handle custom colors and styles", async () => {
      // Test custom color parsing in context
      await generator.addTextField({
        name: "customField",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        tailwind: {
          classes:
            "bg-purple-500 text-white border border-purple-700 rounded-lg",
        },
      });

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(generator.getField("customField")).toBeDefined();
    });
  });

  describe("Form Validation Integration", () => {
    it("should set up comprehensive validation", async () => {
      // Create form with various validation rules
      await helpers.createDateField({
        name: "birthDate",
        x: 100,
        y: 300,
        width: 150,
        height: 30,
        format: "YYYY-MM-DD",
        minDate: new Date("1950-01-01"),
        maxDate: new Date("2010-12-31"),
      });

      await helpers.createNumberField({
        name: "age",
        x: 270,
        y: 300,
        width: 80,
        height: 30,
        min: 13,
        max: 120,
      });

      // Test validation on mock data
      const validationResult = helpers.validateRequiredFields(
        {
          birthDate: "1990-05-15",
          age: "25",
        },
        ["birthDate", "age"]
      );

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.missingFields).toHaveLength(0);

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
    });

    it("should handle validation failures correctly", async () => {
      const validationResult = helpers.validateRequiredFields(
        {
          name: "",
          email: "test@example.com",
          phone: null,
        },
        ["name", "email", "phone", "address"]
      );

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.missingFields).toEqual([
        "name",
        "phone",
        "address",
      ]);
    });
  });

  describe("Layout Helpers Integration", () => {
    it("should create responsive layouts", async () => {
      const { columnWidth, columnPositions } = helpers.calculateColumnLayout(
        600,
        3,
        50
      );

      // Create fields using calculated positions
      await generator.addTextField({
        name: "col1Field",
        x: columnPositions[0],
        y: 300,
        width: columnWidth - 10,
        height: 30,
        tailwind: { classes: "bg-white border border-gray-300 rounded" },
      });

      await generator.addTextField({
        name: "col2Field",
        x: columnPositions[1],
        y: 300,
        width: columnWidth - 10,
        height: 30,
        tailwind: { classes: "bg-white border border-gray-300 rounded" },
      });

      await generator.addTextField({
        name: "col3Field",
        x: columnPositions[2],
        y: 300,
        width: columnWidth - 10,
        height: 30,
        tailwind: { classes: "bg-white border border-gray-300 rounded" },
      });

      expect(columnWidth).toBeCloseTo(153.33, 2); // (600 - 2*50 - 2*20) / 3
      expect(columnPositions[0]).toBe(50);
      expect(columnPositions[1]).toBeCloseTo(223.33, 2);
      expect(columnPositions[2]).toBeCloseTo(396.67, 2);

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(generator.getAllFields().size).toBe(3);
    });

    it("should create grid layouts", async () => {
      const positions = helpers.createGridLayout(50, 500, 100, 40, 2, 15);

      // Create a 2x2 grid of checkboxes
      for (let i = 0; i < 4; i++) {
        await generator.addCheckBox({
          name: `gridCheckbox${i}`,
          x: positions[i].x,
          y: positions[i].y,
          width: 20,
          height: 20,
          tailwind: { classes: "text-blue-600 bg-gray-100 border-gray-300" },
        });
      }

      expect(positions[0]).toEqual({ x: 50, y: 500 });
      expect(positions[1]).toEqual({ x: 165, y: 500 }); // next column
      expect(positions[2]).toEqual({ x: 50, y: 445 }); // next row
      expect(positions[3]).toEqual({ x: 165, y: 445 }); // next column of next row

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(generator.getAllFields().size).toBe(4);
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle invalid field configurations gracefully", async () => {
      // Test with empty field name (should still work but might cause warnings)
      await generator.addTextField({
        name: "", // Empty name
        x: 100,
        y: 200,
        width: 200,
        height: 30,
      });

      // Test with negative dimensions (pdf-lib should handle this)
      await generator.addTextField({
        name: "negativeField",
        x: 100,
        y: 200,
        width: -200,
        height: -30,
      });

      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
    });

    it("should handle missing Tailwind classes gracefully", async () => {
      await generator.addTextField({
        name: "unknownStyles",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        tailwind: {
          classes: "unknown-class invalid-style made-up-class bg-red-500", // Mix of invalid and valid
        },
      });

      // Should still create the field and apply valid styles
      const pdfBytes = await generator.save();
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(generator.getField("unknownStyles")).toBeDefined();
    });
  });

  describe("Performance and Memory Integration", () => {
    it("should handle large forms efficiently", async () => {
      const startTime = Date.now();

      // Create a form with many fields
      for (let i = 0; i < 50; i++) {
        await generator.addTextField({
          name: `field${i}`,
          x: 50 + (i % 5) * 100,
          y: 700 - Math.floor(i / 5) * 35,
          width: 90,
          height: 25,
          defaultValue: `Value ${i}`,
          tailwind: {
            classes: "bg-white border border-gray-300 text-sm rounded p-1",
          },
        });
      }

      const pdfBytes = await generator.save();
      const endTime = Date.now();

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(generator.getAllFields().size).toBe(50);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
