import { PDFGenerator, type GenerateConfig, type TextField, type CheckboxField, type RadioField, type DropdownField, type ButtonField, type SignatureField } from "../pdf-generator";
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from "pdf-lib";
import * as fs from "fs/promises";

describe("Form Field Implementation Tests", () => {
  let generator: PDFGenerator;

  beforeAll(() => {
    generator = new PDFGenerator({
      puppeteerOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      },
    });
  });

  afterAll(async () => {
    await generator.destroy();
  });

  describe("Text Field Implementation", () => {
    it("should create text field with all properties", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="text-test" class="w-64 h-8 border"></div></div>`,
        fields: [
          {
            name: "textTest",
            type: "text",
            selector: "#text-test",
            defaultValue: "Default Text",
            maxLength: 100,
            multiline: false,
            password: false,
            alignment: "left",
            fontSize: 14,
            fontColor: [0, 0, 0],
            backgroundColor: [255, 255, 255],
            borderColor: [128, 128, 128],
            borderWidth: 2,
            required: true,
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);

      // Verify field properties in generated PDF
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const textField = form.getTextField("textTest");

      expect(textField.getText()).toBe("Default Text");
      expect(textField.getMaxLength()).toBe(100);
      expect(textField.isRequired()).toBe(true);
    }, 30000);

    it("should create multiline text field", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="multiline-test" class="w-64 h-16 border"></div></div>`,
        fields: [
          {
            name: "multilineTest",
            type: "text",
            selector: "#multiline-test",
            multiline: true,
            defaultValue: "Line 1\nLine 2\nLine 3",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const textField = form.getTextField("multilineTest");

      expect(textField.isMultiline()).toBe(true);
      expect(textField.getText()).toContain("Line 1");
    }, 30000);

    it("should create password field", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="password-test" class="w-64 h-8 border"></div></div>`,
        fields: [
          {
            name: "passwordTest",
            type: "text",
            selector: "#password-test",
            password: true,
            defaultValue: "secret123",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const passwordField = form.getTextField("passwordTest");

      expect(passwordField.isPassword()).toBe(true);
    }, 30000);
  });

  describe("Checkbox Field Implementation", () => {
    it("should create checkbox with default checked state", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="checkbox-test" class="w-8 h-8 border"></div></div>`,
        fields: [
          {
            name: "checkboxTest",
            type: "checkbox",
            selector: "#checkbox-test",
            defaultValue: true,
            size: 20,
          } as CheckboxField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const checkbox = form.getCheckBox("checkboxTest");

      expect(checkbox.isChecked()).toBe(true);
    }, 30000);

    it("should create checkbox with default unchecked state", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="unchecked-test" class="w-8 h-8 border"></div></div>`,
        fields: [
          {
            name: "uncheckedTest",
            type: "checkbox",
            selector: "#unchecked-test",
            defaultValue: false,
          } as CheckboxField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const checkbox = form.getCheckBox("uncheckedTest");

      expect(checkbox.isChecked()).toBe(false);
    }, 30000);
  });

  describe("Radio Field Implementation", () => {
    it("should create radio group with multiple options", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="radio-test" class="space-y-4"></div></div>`,
        fields: [
          {
            name: "radioTest",
            type: "radio",
            selector: "#radio-test",
            options: [
              { value: "option1", label: "First Option" },
              { value: "option2", label: "Second Option" },
              { value: "option3", label: "Third Option" },
            ],
            defaultValue: "option2",
            spacing: 30,
            size: 15,
          } as RadioField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const radioGroup = form.getRadioGroup("radioTest");

      expect(radioGroup.getOptions()).toEqual(["option1", "option2", "option3"]);
      expect(radioGroup.getSelected()).toBe("option2");
    }, 30000);

    it("should create radio group without default selection", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="radio-no-default" class="space-y-2"></div></div>`,
        fields: [
          {
            name: "radioNoDefault",
            type: "radio",
            selector: "#radio-no-default",
            options: [
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ],
          } as RadioField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const radioGroup = form.getRadioGroup("radioNoDefault");

      expect(radioGroup.getSelected()).toBeUndefined();
    }, 30000);
  });

  describe("Dropdown Field Implementation", () => {
    it("should create dropdown with options and default selection", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="dropdown-test" class="w-48 h-8 border"></div></div>`,
        fields: [
          {
            name: "dropdownTest",
            type: "dropdown",
            selector: "#dropdown-test",
            options: ["Apple", "Banana", "Cherry", "Date", "Elderberry"],
            defaultValue: "Cherry",
            editable: false,
            fontSize: 12,
          } as DropdownField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const dropdown = form.getDropdown("dropdownTest");

      expect(dropdown.getOptions()).toEqual(["Apple", "Banana", "Cherry", "Date", "Elderberry"]);
      expect(dropdown.getSelected()).toEqual(["Cherry"]);
    }, 30000);

    it("should create editable dropdown", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="editable-dropdown" class="w-48 h-8 border"></div></div>`,
        fields: [
          {
            name: "editableDropdown",
            type: "dropdown",
            selector: "#editable-dropdown",
            options: ["Predefined 1", "Predefined 2"],
            editable: true,
          } as DropdownField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const dropdown = form.getDropdown("editableDropdown");

      expect(dropdown.isEditable()).toBe(true);
    }, 30000);
  });

  describe("Button Field Implementation", () => {
    it("should create button with submit action", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="submit-button" class="w-24 h-10 border"></div></div>`,
        fields: [
          {
            name: "submitButton",
            type: "button",
            selector: "#submit-button",
            label: "Submit Form",
            action: "submit",
          } as ButtonField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const button = form.getButton("submitButton");

      expect(button).toBeDefined();
    }, 30000);

    it("should create button with reset action", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="reset-button" class="w-24 h-10 border"></div></div>`,
        fields: [
          {
            name: "resetButton",
            type: "button",
            selector: "#reset-button",
            label: "Reset",
            action: "reset",
          } as ButtonField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Signature Field Implementation", () => {
    it("should create signature field", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="signature-test" class="w-64 h-16 border-2 border-dashed"></div></div>`,
        fields: [
          {
            name: "signatureTest",
            type: "signature",
            selector: "#signature-test",
            height: 60,
          } as SignatureField,
        ],
      };

      const result = await generator.generate(config);
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      
      // Signature fields are implemented as text fields in pdf-lib
      const signatureField = form.getTextField("signatureTest_signature");
      expect(signatureField).toBeDefined();
      expect(signatureField.getText() || "").toBe("");
    }, 30000);
  });

  describe("Mixed Field Types", () => {
    it("should handle form with all field types together", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="p-8 bg-gray-50">
            <h1 class="text-2xl font-bold mb-6">Complete Form Test</h1>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Full Name:</label>
                <div id="full-name" class="w-full h-8 border border-gray-300 rounded px-2"></div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Comments:</label>
                <div id="comments" class="w-full h-20 border border-gray-300 rounded p-2"></div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Country:</label>
                <div id="country-select" class="w-full h-8 border border-gray-300 rounded px-2"></div>
              </div>
              
              <div id="gender-radio" class="space-y-2">
                <p class="text-sm font-medium">Gender:</p>
                <label class="flex items-center">
                  <input type="radio" name="gender" value="male" class="mr-2">
                  Male
                </label>
                <label class="flex items-center">
                  <input type="radio" name="gender" value="female" class="mr-2">
                  Female
                </label>
                <label class="flex items-center">
                  <input type="radio" name="gender" value="other" class="mr-2">
                  Other
                </label>
              </div>
              
              <div class="space-y-2">
                <label class="flex items-center">
                  <input id="newsletter" type="checkbox" class="mr-2">
                  Subscribe to newsletter
                </label>
                <label class="flex items-center">
                  <input id="marketing" type="checkbox" class="mr-2">
                  Receive marketing emails
                </label>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div id="submit-btn" class="bg-blue-500 text-white px-4 py-2 rounded text-center cursor-pointer">Submit</div>
                <div id="reset-btn" class="bg-gray-500 text-white px-4 py-2 rounded text-center cursor-pointer">Reset</div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Signature:</label>
                <div id="signature" class="w-full h-16 border-2 border-dashed border-gray-400"></div>
              </div>
            </div>
          </div>
        `,
        fields: [
          {
            name: "fullName",
            type: "text",
            selector: "#full-name",
            required: true,
            maxLength: 100,
            fontSize: 12,
          } as TextField,
          {
            name: "comments",
            type: "text",
            selector: "#comments",
            multiline: true,
            maxLength: 500,
            fontSize: 10,
          } as TextField,
          {
            name: "country",
            type: "dropdown",
            selector: "#country-select",
            options: ["France", "USA", "Canada", "UK", "Germany", "Spain", "Italy"],
            defaultValue: "France",
            editable: true,
          } as DropdownField,
          {
            name: "gender",
            type: "radio",
            selector: "#gender-radio",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ],
            spacing: 25,
            size: 12,
          } as RadioField,
          {
            name: "newsletter",
            type: "checkbox",
            selector: "#newsletter",
            defaultValue: false,
            size: 14,
          } as CheckboxField,
          {
            name: "marketing",
            type: "checkbox",
            selector: "#marketing",
            defaultValue: false,
            size: 14,
          } as CheckboxField,
          {
            name: "submitButton",
            type: "button",
            selector: "#submit-btn",
            label: "Submit Form",
            action: "submit",
          } as ButtonField,
          {
            name: "resetButton",
            type: "button",
            selector: "#reset-btn",
            label: "Reset Form",
            action: "reset",
          } as ButtonField,
          {
            name: "userSignature",
            type: "signature",
            selector: "#signature",
            height: 60,
          } as SignatureField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(9);

      // Verify all field types were created
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      expect(fields).toHaveLength(9);

      // Check specific field types
      expect(form.getTextField("fullName")).toBeDefined();
      expect(form.getTextField("comments")).toBeDefined();
      expect(form.getDropdown("country")).toBeDefined();
      expect(form.getRadioGroup("gender")).toBeDefined();
      expect(form.getCheckBox("newsletter")).toBeDefined();
      expect(form.getCheckBox("marketing")).toBeDefined();
      expect(form.getButton("submitButton")).toBeDefined();
      expect(form.getButton("resetButton")).toBeDefined();
      expect(form.getTextField("userSignature_signature")).toBeDefined();
    }, 45000);
  });

  describe("Field Positioning Accuracy", () => {
    it("should position fields accurately using selectors", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="p-8">
            <div class="grid grid-cols-3 gap-4">
              <div id="field1" class="h-8 border bg-red-100"></div>
              <div id="field2" class="h-8 border bg-green-100"></div>
              <div id="field3" class="h-8 border bg-blue-100"></div>
            </div>
          </div>
        `,
        fields: [
          {
            name: "field1",
            type: "text",
            selector: "#field1",
          } as TextField,
          {
            name: "field2",
            type: "text",
            selector: "#field2",
          } as TextField,
          {
            name: "field3",
            type: "text",
            selector: "#field3",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(3);
    }, 30000);

    it("should handle offset positioning correctly", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="offset-test" class="w-32 h-8 border"></div></div>`,
        fields: [
          {
            name: "offsetTest",
            type: "text",
            selector: "#offset-test",
            offsetX: 10,
            offsetY: -5,
            width: 150,
            height: 25,
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle absolute positioning", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4">Absolute positioning test</div>`,
        fields: [
          {
            name: "absoluteField1",
            type: "text",
            position: { x: 100, y: 200, width: 200, height: 30 },
          } as TextField,
          {
            name: "absoluteField2",
            type: "checkbox",
            position: { x: 320, y: 200, width: 20, height: 20 },
          } as CheckboxField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(2);
    }, 30000);
  });

  describe("Form Data Validation and Filling", () => {
    it("should handle different data types correctly during form filling", async () => {
      const tempPath = "/tmp/data-types-test.pdf";
      
      const config: GenerateConfig = {
        content: `
          <div class="p-4">
            <div id="text-field" class="w-32 h-8 border mb-2"></div>
            <div id="checkbox-field" class="w-4 h-4 border mb-2"></div>
            <div id="dropdown-field" class="w-32 h-8 border mb-2"></div>
            <div id="radio-field" class="space-y-1"></div>
          </div>
        `,
        fields: [
          {
            name: "textField",
            type: "text",
            selector: "#text-field",
          } as TextField,
          {
            name: "checkboxField",
            type: "checkbox",
            selector: "#checkbox-field",
          } as CheckboxField,
          {
            name: "dropdownField",
            type: "dropdown",
            selector: "#dropdown-field",
            options: ["Option 1", "Option 2", "Option 3"],
          } as DropdownField,
          {
            name: "radioField",
            type: "radio",
            selector: "#radio-field",
            options: [
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ],
          } as RadioField,
        ],
        outputPath: tempPath,
      };

      await generator.generate(config);

      // Test filling with different data types
      const fillData = {
        textField: "String value",
        checkboxField: true,
        dropdownField: "Option 2",
        radioField: "b",
      };

      const filledPDF = await generator.fillExistingPDF(tempPath, fillData);
      expect(filledPDF).toBeInstanceOf(Uint8Array);

      // Verify data was filled correctly
      const filledPath = "/tmp/filled-data-types.pdf";
      await fs.writeFile(filledPath, filledPDF);
      
      const extractedData = await generator.extractFormData(filledPath);
      expect(extractedData.textField).toBe("String value");
      expect(extractedData.checkboxField).toBe(true);
      expect(extractedData.dropdownField).toBe("Option 2");
      expect(extractedData.radioField).toBe("b");

      // Cleanup
      await fs.unlink(tempPath);
      await fs.unlink(filledPath);
    }, 45000);

    it("should handle partial data filling gracefully", async () => {
      const tempPath = "/tmp/partial-fill-test.pdf";
      
      const config: GenerateConfig = {
        content: `
          <div class="p-4">
            <div id="field1" class="w-32 h-8 border mb-2"></div>
            <div id="field2" class="w-32 h-8 border mb-2"></div>
            <div id="field3" class="w-4 h-4 border"></div>
          </div>
        `,
        fields: [
          { name: "field1", type: "text", selector: "#field1" } as TextField,
          { name: "field2", type: "text", selector: "#field2" } as TextField,
          { name: "field3", type: "checkbox", selector: "#field3" } as CheckboxField,
        ],
        outputPath: tempPath,
      };

      await generator.generate(config);

      // Fill only some fields
      const partialData = {
        field1: "Only this field is filled",
        // field2 and field3 are intentionally omitted
      };

      const result = await generator.fillExistingPDF(tempPath, partialData);
      expect(result).toBeInstanceOf(Uint8Array);

      // Cleanup
      await fs.unlink(tempPath);
    }, 30000);
  });
});