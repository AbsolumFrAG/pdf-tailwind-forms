import { PDFValidator } from "../validator";
import type { GenerateConfig, TextField, RadioField, DropdownField, ButtonField } from "../pdf-generator";

describe("PDFValidator", () => {
  let validator: PDFValidator;

  beforeEach(() => {
    validator = new PDFValidator();
  });

  describe("Content Validation", () => {
    it("should validate valid content", () => {
      const config: GenerateConfig = {
        content: "<div class='text-xl'>Valid content</div>",
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty content", () => {
      const config: GenerateConfig = {
        content: "",
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Content is required");
    });

    it("should reject whitespace-only content", () => {
      const config: GenerateConfig = {
        content: "   \n\t   ",
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Content cannot be empty");
    });

    it("should detect dangerous HTML tags", () => {
      const dangerousContents = [
        "<script>alert('xss')</script>",
        "<iframe src='malicious'></iframe>",
        "<object data='malicious'></object>",
        "<embed src='malicious'></embed>",
      ];

      dangerousContents.forEach((content) => {
        const config: GenerateConfig = { content };
        const result = validator.validate(config);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some(error => error.includes("Dangerous HTML tag detected"))).toBe(true);
      });
    });

    it("should be case insensitive for dangerous tags", () => {
      const config: GenerateConfig = {
        content: "<SCRIPT>alert('xss')</SCRIPT>",
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes("Dangerous HTML tag detected"))).toBe(true);
    });
  });

  describe("Field Validation", () => {
    it("should validate fields with unique names", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "field1",
            type: "text",
            selector: ".field1",
          } as TextField,
          {
            name: "field2",
            type: "text",
            selector: ".field2",
          } as TextField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect duplicate field names", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "duplicateField",
            type: "text",
            selector: ".field1",
          } as TextField,
          {
            name: "duplicateField",
            type: "checkbox",
            selector: ".field2",
          } as any,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Duplicate field name: duplicateField");
    });

    it("should detect fields without name", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "",
            type: "text",
            selector: ".field",
          } as TextField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field must have a name");
    });

    it("should detect fields without selector or position", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "testField",
            type: "text",
          } as TextField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Field "testField" must have either selector or position');
    });
  });

  describe("Text Field Validation", () => {
    it("should validate valid text field", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "textField",
            type: "text",
            selector: ".text",
            maxLength: 100,
          } as TextField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should detect invalid maxLength", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "textField",
            type: "text",
            selector: ".text",
            maxLength: -5,
          } as TextField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid maxLength for field "textField"');
    });

    it("should detect negative maxLength", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "textField",
            type: "text",
            selector: ".text",
            maxLength: -5,
          } as TextField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid maxLength for field "textField"');
    });
  });

  describe("Radio Field Validation", () => {
    it("should validate valid radio field", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "radioField",
            type: "radio",
            selector: ".radio",
            options: [
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ],
          } as RadioField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should detect radio field without options", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "radioField",
            type: "radio",
            selector: ".radio",
            options: [],
          } as RadioField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Radio field "radioField" must have options');
    });

    it("should detect radio field with undefined options", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "radioField",
            type: "radio",
            selector: ".radio",
          } as RadioField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Radio field "radioField" must have options');
    });
  });

  describe("Dropdown Field Validation", () => {
    it("should validate valid dropdown field", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "dropdownField",
            type: "dropdown",
            selector: ".dropdown",
            options: ["Option 1", "Option 2", "Option 3"],
          } as DropdownField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should detect dropdown field without options", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "dropdownField",
            type: "dropdown",
            selector: ".dropdown",
            options: [],
          } as DropdownField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dropdown field "dropdownField" must have options');
    });
  });

  describe("Button Field Validation", () => {
    it("should validate valid button field", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "buttonField",
            type: "button",
            selector: ".button",
            label: "Submit",
            action: "submit",
          } as ButtonField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should detect button field without label", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "buttonField",
            type: "button",
            selector: ".button",
            action: "submit",
          } as ButtonField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Button field "buttonField" must have a label');
    });
  });

  describe("PDF Options Validation", () => {
    it("should validate valid PDF format", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        pdfOptions: {
          format: "A4",
        },
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should detect invalid PDF format", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
        pdfOptions: {
          format: "InvalidFormat" as any,
        },
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid PDF format: InvalidFormat");
    });

    it("should allow valid PDF formats", () => {
      const validFormats = ["A3", "A4", "A5", "Legal", "Letter", "Tabloid"];
      
      validFormats.forEach((format) => {
        const config: GenerateConfig = {
          content: "<div>test</div>",
          pdfOptions: { format: format as any },
        };

        const result = validator.validate(config);
        expect(result.valid).toBe(true);
      });
    });

    it("should handle undefined pdfOptions", () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Complex Validation Scenarios", () => {
    it("should accumulate multiple validation errors", () => {
      const config: GenerateConfig = {
        content: "",
        fields: [
          {
            name: "",
            type: "text",
          } as TextField,
          {
            name: "radio",
            type: "radio",
            selector: ".radio",
            options: [],
          } as RadioField,
        ],
        pdfOptions: {
          format: "InvalidFormat" as any,
        },
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain("Content is required");
      expect(result.errors).toContain("Field must have a name");
      expect(result.errors).toContain('Radio field "radio" must have options');
      expect(result.errors).toContain("Invalid PDF format: InvalidFormat");
    });

    it("should validate complex form with all field types", () => {
      const config: GenerateConfig = {
        content: "<div>Complex form</div>",
        fields: [
          {
            name: "textField",
            type: "text",
            selector: ".text",
            maxLength: 50,
          } as TextField,
          {
            name: "radioField",
            type: "radio",
            selector: ".radio",
            options: [{ value: "option1" }, { value: "option2" }],
          } as RadioField,
          {
            name: "dropdownField",
            type: "dropdown",
            selector: ".dropdown",
            options: ["Choice 1", "Choice 2"],
          } as DropdownField,
          {
            name: "buttonField",
            type: "button",
            selector: ".button",
            label: "Submit",
          } as ButtonField,
        ],
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});