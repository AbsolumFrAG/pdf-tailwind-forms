import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFTailwindGenerator } from "../../src/core/pdf-generator.js";
import {
  DateFieldOptions,
  NumberFieldOptions,
  SignatureFieldOptions,
  TableFieldOptions,
} from "../../src/types/index.js";
import { FormHelpers } from "../../src/utils/form-helpers.js";

// Mock pdf-lib
vi.mock("pdf-lib", () => ({
  rgb: vi.fn((r, g, b) => ({ r, g, b, type: "Color" })),
}));

describe("FormHelpers", () => {
  let helpers: FormHelpers;
  let mockGenerator: PDFTailwindGenerator;

  beforeEach(() => {
    // Create mock generator
    mockGenerator = {
      addTextField: vi.fn(),
      drawRectangle: vi.fn(),
      drawText: vi.fn(),
      setFieldValidation: vi.fn(),
      getAllFields: vi.fn(() => new Map()),
    } as any;

    helpers = new FormHelpers(mockGenerator);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("table creation", () => {
    it("should create basic table", async () => {
      const options: TableFieldOptions = {
        x: 100,
        y: 200,
        rows: 3,
        columns: 2,
        cellWidth: 100,
        cellHeight: 30,
      };

      await helpers.createTable(options);

      // Should draw main table border
      expect(mockGenerator.drawRectangle).toHaveBeenCalledWith(
        100,
        200,
        200,
        90, // x, y, width (2*100), height (3*30)
        expect.objectContaining({
          borderColor: expect.any(Object),
          borderWidth: 1,
        })
      );

      // Should draw grid lines (1 vertical, 2 horizontal)
      expect(mockGenerator.drawRectangle).toHaveBeenCalledTimes(4); // 1 main + 1 vertical + 2 horizontal
    });

    it("should create table with headers", async () => {
      const options: TableFieldOptions = {
        x: 100,
        y: 200,
        rows: 2,
        columns: 2,
        cellWidth: 100,
        cellHeight: 30,
        headers: ["Name", "Email"],
      };

      await helpers.createTable(options);

      // Should draw header text
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Name",
        105, // x + 5 for padding
        215, // y + cellHeight - 15
        expect.objectContaining({
          size: 10,
          tailwind: "font-bold text-gray-800",
        })
      );

      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Email",
        205, // x + columnWidth + 5
        215,
        expect.objectContaining({
          size: 10,
          tailwind: "font-bold text-gray-800",
        })
      );
    });

    it("should create table with data", async () => {
      const options: TableFieldOptions = {
        x: 100,
        y: 200,
        rows: 2,
        columns: 2,
        cellWidth: 100,
        cellHeight: 30,
        data: [
          ["John Doe", "john@example.com"],
          ["Jane Smith", "jane@example.com"],
        ],
      };

      await helpers.createTable(options);

      // Should draw data text
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "John Doe",
        105, // x + 5
        215, // y + (row + 1) * cellHeight - 15
        expect.objectContaining({
          size: 9,
          tailwind: "text-gray-700",
        })
      );

      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "jane@example.com",
        205, // x + columnWidth + 5
        185, // second row
        expect.objectContaining({
          size: 9,
          tailwind: "text-gray-700",
        })
      );
    });

    it("should create table with headers and data", async () => {
      const options: TableFieldOptions = {
        x: 100,
        y: 200,
        rows: 3,
        columns: 2,
        cellWidth: 100,
        cellHeight: 30,
        headers: ["Name", "Email"],
        data: [
          ["John Doe", "john@example.com"],
          ["Jane Smith", "jane@example.com"],
        ],
      };

      await helpers.createTable(options);

      // Should draw both headers and data
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Name",
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      );
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Email",
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      );
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "John Doe",
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      );
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "jane@example.com",
        expect.any(Number),
        expect.any(Number),
        expect.any(Object)
      );
    });
  });

  describe("date field creation", () => {
    it("should create basic date field", async () => {
      const options: DateFieldOptions = {
        name: "birthDate",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
      };

      await helpers.createDateField(options);

      expect(mockGenerator.addTextField).toHaveBeenCalledWith({
        name: "birthDate",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        defaultValue: undefined,
        tailwind: {
          classes:
            "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
        },
      });
    });

    it("should create date field with default value", async () => {
      const options: DateFieldOptions = {
        name: "birthDate",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        defaultValue: "1990-01-15",
      };

      await helpers.createDateField(options);

      expect(mockGenerator.addTextField).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValue: "1990-01-15",
        })
      );
    });

    it("should add format validation", async () => {
      const options: DateFieldOptions = {
        name: "birthDate",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        format: "MM/DD/YYYY",
      };

      await helpers.createDateField(options);

      expect(mockGenerator.setFieldValidation).toHaveBeenCalledWith(
        "birthDate",
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({
              type: "pattern",
              message: "Date must be in format: MM/DD/YYYY",
            }),
          ]),
          validateOnBlur: true,
        })
      );
    });

    it("should add date range validation", async () => {
      const minDate = new Date("2000-01-01");
      const maxDate = new Date("2030-12-31");

      const options: DateFieldOptions = {
        name: "birthDate",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        minDate,
        maxDate,
      };

      await helpers.createDateField(options);

      expect(mockGenerator.setFieldValidation).toHaveBeenCalledWith(
        "birthDate",
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({
              type: "custom",
              message: "Date is outside allowed range",
              customValidator: expect.any(Function),
            }),
          ]),
        })
      );

      // Test the custom validator
      const validationCall = vi.mocked(mockGenerator.setFieldValidation).mock
        .calls[0];
      const validation = validationCall[1];
      const customRule = validation.rules.find(
        (rule) => rule.type === "custom"
      );
      const validator = customRule?.customValidator;

      expect(validator).toBeDefined();
      if (validator) {
        expect(validator("2010-06-15")).toBe(true); // valid date in range
        expect(validator("1999-01-01")).toBe(false); // before minDate
        expect(validator("2031-01-01")).toBe(false); // after maxDate
        expect(validator("invalid-date")).toBe(false); // invalid date
      }
    });
  });

  describe("number field creation", () => {
    it("should create basic number field", async () => {
      const options: NumberFieldOptions = {
        name: "age",
        x: 100,
        y: 200,
        width: 100,
        height: 30,
      };

      await helpers.createNumberField(options);

      expect(mockGenerator.addTextField).toHaveBeenCalledWith({
        name: "age",
        x: 100,
        y: 200,
        width: 100,
        height: 30,
        defaultValue: undefined,
        tailwind: {
          classes:
            "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right",
        },
      });

      // Should add number validation
      expect(mockGenerator.setFieldValidation).toHaveBeenCalledWith(
        "age",
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({
              type: "pattern",
              value: /^-?\d*\.?\d*$/,
              message: "Must be a valid number",
            }),
          ]),
          validateOnBlur: true,
        })
      );
    });

    it("should add min/max validation", async () => {
      const options: NumberFieldOptions = {
        name: "age",
        x: 100,
        y: 200,
        width: 100,
        height: 30,
        min: 18,
        max: 65,
      };

      await helpers.createNumberField(options);

      expect(mockGenerator.setFieldValidation).toHaveBeenCalledWith(
        "age",
        expect.objectContaining({
          rules: expect.arrayContaining([
            expect.objectContaining({
              type: "custom",
              message: "Number must be between 18 and 65",
              customValidator: expect.any(Function),
            }),
          ]),
        })
      );

      // Test the custom validator
      const validationCall = vi.mocked(mockGenerator.setFieldValidation).mock
        .calls[0];
      const validation = validationCall[1];
      const customRule = validation.rules.find(
        (rule) => rule.type === "custom"
      );
      const validator = customRule?.customValidator;

      expect(validator).toBeDefined();
      if (validator) {
        expect(validator("25")).toBe(true); // valid number in range
        expect(validator("17")).toBe(false); // below min
        expect(validator("66")).toBe(false); // above max
        expect(validator("invalid")).toBe(false); // invalid number
      }
    });

    it("should handle min-only validation", async () => {
      const options: NumberFieldOptions = {
        name: "salary",
        x: 100,
        y: 200,
        width: 100,
        height: 30,
        min: 0,
      };

      await helpers.createNumberField(options);

      const validationCall = vi.mocked(mockGenerator.setFieldValidation).mock
        .calls[0];
      const validation = validationCall[1];
      const customRule = validation.rules.find(
        (rule) => rule.type === "custom"
      );

      expect(customRule?.message).toBe("Number must be between 0 and ∞");
    });

    it("should handle max-only validation", async () => {
      const options: NumberFieldOptions = {
        name: "discount",
        x: 100,
        y: 200,
        width: 100,
        height: 30,
        max: 100,
      };

      await helpers.createNumberField(options);

      const validationCall = vi.mocked(mockGenerator.setFieldValidation).mock
        .calls[0];
      const validation = validationCall[1];
      const customRule = validation.rules.find(
        (rule) => rule.type === "custom"
      );

      expect(customRule?.message).toBe("Number must be between -∞ and 100");
    });
  });

  describe("signature field creation", () => {
    it("should create basic signature field", async () => {
      const options: SignatureFieldOptions = {
        name: "signature",
        x: 100,
        y: 200,
        width: 300,
        height: 100,
      };

      await helpers.createSignatureField(options);

      // Should draw signature area border
      expect(mockGenerator.drawRectangle).toHaveBeenCalledWith(
        100,
        200,
        300,
        100,
        expect.objectContaining({
          borderColor: expect.any(Object),
          borderWidth: 1,
        })
      );

      // Should draw signature label
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Signature:",
        100,
        305, // y + height + 5
        expect.objectContaining({
          size: 10,
          tailwind: "text-gray-600",
        })
      );

      // Should draw signature line
      expect(mockGenerator.drawRectangle).toHaveBeenCalledWith(
        105,
        205,
        290,
        1, // x+5, y+5, width-10, 1
        expect.objectContaining({
          backgroundColor: expect.any(Object),
        })
      );

      // Should draw X placeholder
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "X",
        380,
        210, // x + width - 20, y + 10
        expect.objectContaining({
          size: 16,
          color: expect.any(Object),
          tailwind: "font-bold",
        })
      );
    });

    it("should add required validation", async () => {
      const options: SignatureFieldOptions = {
        name: "signature",
        x: 100,
        y: 200,
        width: 300,
        height: 100,
        required: true,
      };

      await helpers.createSignatureField(options);

      expect(mockGenerator.setFieldValidation).toHaveBeenCalledWith(
        "signature",
        expect.objectContaining({
          rules: [
            {
              type: "required",
              message: "Signature is required",
            },
          ],
        })
      );
    });

    it("should not add validation when not required", async () => {
      const options: SignatureFieldOptions = {
        name: "signature",
        x: 100,
        y: 200,
        width: 300,
        height: 100,
        required: false,
      };

      await helpers.createSignatureField(options);

      expect(mockGenerator.setFieldValidation).not.toHaveBeenCalled();
    });
  });

  describe("form section creation", () => {
    it("should create form section", () => {
      helpers.createFormSection(
        "Personal Information",
        "Please fill in your details",
        100,
        200,
        400
      );

      // Should draw section background
      expect(mockGenerator.drawRectangle).toHaveBeenCalledWith(
        100,
        160,
        400,
        35, // x, y-40, width, 35
        expect.objectContaining({
          backgroundColor: expect.any(Object),
          borderColor: expect.any(Object),
          borderWidth: 1,
        })
      );

      // Should draw title
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Personal Information",
        110,
        185, // x+10, y-15
        expect.objectContaining({
          size: 14,
          tailwind: "font-bold text-gray-800",
        })
      );

      // Should draw description
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Please fill in your details",
        110,
        170, // x+10, y-30
        expect.objectContaining({
          size: 10,
          tailwind: "text-gray-600",
        })
      );
    });

    it("should create section without description", () => {
      helpers.createFormSection("Personal Information", "", 100, 200, 400);

      // Should still draw title
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Personal Information",
        110,
        185,
        expect.any(Object)
      );

      // Should not draw empty description
      expect(mockGenerator.drawText).toHaveBeenCalledTimes(1);
    });
  });

  describe("layout calculations", () => {
    it("should calculate column layout", () => {
      const result = helpers.calculateColumnLayout(600, 3, 50);

      expect(result.columnWidth).toBeCloseTo(153.33, 2); // (600 - 2*50 - 2*20) / 3
      expect(result.columnPositions[0]).toBe(50);
      expect(result.columnPositions[1]).toBeCloseTo(223.33, 2);
      expect(result.columnPositions[2]).toBeCloseTo(396.67, 2);
    });

    it("should calculate column layout with default margin", () => {
      const result = helpers.calculateColumnLayout(600, 2);

      expect(result.columnWidth).toBe(250); // (600 - 2*40 - 1*20) / 2
      expect(result.columnPositions).toEqual([40, 310]);
    });

    it("should create grid layout", () => {
      const positions = helpers.createGridLayout(50, 500, 100, 40, 3, 15);

      expect(positions).toHaveLength(12);
      expect(positions[0]).toEqual({ x: 50, y: 500 });
      expect(positions[1]).toEqual({ x: 165, y: 500 }); // 50 + 100 + 15
      expect(positions[2]).toEqual({ x: 280, y: 500 }); // 165 + 100 + 15
      expect(positions[3]).toEqual({ x: 50, y: 445 }); // new row: 500 - 40 - 15
    });
  });

  describe("validation helpers", () => {
    it("should validate required fields", () => {
      const fieldsData = {
        firstName: "John",
        lastName: "Doe",
        email: "",
        phone: null,
      };

      const requiredFields = ["firstName", "lastName", "email", "phone"];

      const result = helpers.validateRequiredFields(fieldsData, requiredFields);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(["email", "phone"]);
    });

    it("should pass validation when all fields present", () => {
      const fieldsData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };

      const requiredFields = ["firstName", "lastName", "email"];

      const result = helpers.validateRequiredFields(fieldsData, requiredFields);

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it("should handle whitespace-only values", () => {
      const fieldsData = {
        firstName: "   ",
        lastName: "Doe",
      };

      const requiredFields = ["firstName", "lastName"];

      const result = helpers.validateRequiredFields(fieldsData, requiredFields);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toEqual(["firstName"]);
    });
  });

  describe("conditional logic", () => {
    it("should apply conditional logic", () => {
      const fieldsData = {
        field1: "value1",
        field2: "value2",
      };

      vi.mocked(mockGenerator.getAllFields).mockReturnValue(
        new Map([
          ["field1", {}],
          ["field2", {}],
        ])
      );

      const result = helpers.applyConditionalLogic(fieldsData);

      expect(result.field1).toBe(true);
      expect(result.field2).toBe(true);
    });
  });

  describe("utility functions", () => {
    it("should generate field names from labels", () => {
      expect(helpers.generateFieldName("First Name")).toBe("first_name");
      expect(helpers.generateFieldName("Email Address!")).toBe("email_address");
      expect(helpers.generateFieldName("Phone # (with area code)")).toBe(
        "phone_with_area_code"
      );
      expect(helpers.generateFieldName("  Spaced   Out  ")).toBe("spaced_out");
    });

    it("should add field labels", () => {
      helpers.addFieldLabel("Email Address", 100, 200, "email");

      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Email Address",
        100,
        200,
        expect.objectContaining({
          size: 11,
          tailwind: "text-gray-700",
        })
      );
    });

    it("should add required field labels with asterisk", () => {
      helpers.addFieldLabel("Email Address", 100, 200, "email", true);

      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "Email Address *",
        100,
        200,
        expect.objectContaining({
          size: 11,
          tailwind: "font-medium text-gray-700",
        })
      );

      // Should also draw the red asterisk separately
      expect(mockGenerator.drawText).toHaveBeenCalledWith(
        "*",
        expect.any(Number),
        200,
        expect.objectContaining({
          size: 11,
          color: expect.any(Object),
          tailwind: "font-bold",
        })
      );
    });
  });
});
