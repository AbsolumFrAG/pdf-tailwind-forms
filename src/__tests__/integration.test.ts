import { PDFGenerator, type GenerateConfig, type TextField, type CheckboxField, type RadioField, type DropdownField } from "../pdf-generator";
import { PDFValidator } from "../validator";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs/promises";
import puppeteer from "puppeteer";

describe("PDF Generation Integration Tests", () => {
  let generator: PDFGenerator;
  let validator: PDFValidator;

  beforeAll(() => {
    // Use real Puppeteer for integration tests but with custom options
    generator = new PDFGenerator({
      puppeteerOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      },
    });
    validator = new PDFValidator();
  });

  afterAll(async () => {
    await generator.destroy();
  });

  describe("Complete PDF Generation Workflow", () => {
    it("should generate a PDF with form fields", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="p-8 bg-white">
            <h1 class="text-2xl font-bold mb-4">Test Form</h1>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Name:</label>
              <div id="name-field" class="w-64 h-8 border border-gray-300"></div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Email:</label>
              <div id="email-field" class="w-64 h-8 border border-gray-300"></div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">
                <input id="newsletter" type="checkbox" class="mr-2">
                Subscribe to newsletter
              </label>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">Preferred Contact:</label>
              <div id="contact-radio" class="space-y-2">
                <div class="flex items-center">
                  <input type="radio" name="contact" value="email" class="mr-2">
                  <span>Email</span>
                </div>
                <div class="flex items-center">
                  <input type="radio" name="contact" value="phone" class="mr-2">
                  <span>Phone</span>
                </div>
              </div>
            </div>
          </div>
        `,
        fields: [
          {
            name: "name",
            type: "text",
            selector: "#name-field",
            required: true,
          } as TextField,
          {
            name: "email",
            type: "text",
            selector: "#email-field",
            required: true,
          } as TextField,
          {
            name: "newsletter",
            type: "checkbox",
            selector: "#newsletter",
          } as CheckboxField,
          {
            name: "contact",
            type: "radio",
            selector: "#contact-radio",
            options: [
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
            ],
          } as RadioField,
        ],
        metadata: {
          title: "Test Form PDF",
          author: "Test Author",
          subject: "Integration Test",
        },
      };

      const result = await generator.generate(config);

      expect(result).toBeDefined();
      expect(result.bytes).toBeInstanceOf(Uint8Array);
      expect(result.bytes.length).toBeGreaterThan(0);
      expect(result.fieldCount).toBe(4);
      expect(result.pageCount).toBe(1);
    }, 30000);

    it("should generate PDF with absolute positioning", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="p-8 bg-white">
            <h1 class="text-2xl font-bold mb-4">Absolute Position Form</h1>
            <p class="mb-8">This form uses absolute positioning for fields.</p>
          </div>
        `,
        fields: [
          {
            name: "absoluteText",
            type: "text",
            position: { x: 100, y: 200, width: 200, height: 30 },
            defaultValue: "Absolute positioned text",
          } as TextField,
          {
            name: "absoluteCheckbox",
            type: "checkbox",
            position: { x: 100, y: 250, width: 20, height: 20 },
            defaultValue: true,
          } as CheckboxField,
        ],
      };

      const result = await generator.generate(config);

      expect(result).toBeDefined();
      expect(result.fieldCount).toBe(2);
      expect(result.pageCount).toBe(1);
    }, 30000);
  });

  describe("Form Data Operations", () => {
    let testPDFPath: string;

    beforeAll(async () => {
      testPDFPath = "/tmp/test-form.pdf";
      
      const config: GenerateConfig = {
        content: `
          <div class="p-8">
            <h1>Test Form for Data Operations</h1>
            <div id="name-field" class="w-64 h-8 border"></div>
            <div id="checkbox-field" class="w-4 h-4 border"></div>
          </div>
        `,
        fields: [
          {
            name: "testName",
            type: "text",
            selector: "#name-field",
          } as TextField,
          {
            name: "testCheckbox",
            type: "checkbox",
            selector: "#checkbox-field",
          } as CheckboxField,
        ],
        outputPath: testPDFPath,
      };

      await generator.generate(config);
    });

    afterAll(async () => {
      try {
        await fs.unlink(testPDFPath);
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should fill existing PDF with data", async () => {
      const fillData = {
        testName: "John Doe",
        testCheckbox: true,
      };

      const result = await generator.fillExistingPDF(testPDFPath, fillData);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(0);

      // Verify the data was filled by extracting it back
      const outputPath = "/tmp/filled-test.pdf";
      await fs.writeFile(outputPath, result);
      
      const extractedData = await generator.extractFormData(outputPath);
      expect(extractedData.testName).toBe("John Doe");
      expect(extractedData.testCheckbox).toBe(true);

      // Cleanup
      await fs.unlink(outputPath);
    }, 30000);

    it("should extract form data from PDF", async () => {
      const fillData = {
        testName: "Jane Smith",
        testCheckbox: false,
      };

      const filledPDF = await generator.fillExistingPDF(testPDFPath, fillData);
      const tempPath = "/tmp/temp-extract-test.pdf";
      await fs.writeFile(tempPath, filledPDF);

      const extractedData = await generator.extractFormData(tempPath);

      expect(extractedData.testName).toBe("Jane Smith");
      expect(extractedData.testCheckbox).toBe(false);

      // Cleanup
      await fs.unlink(tempPath);
    }, 30000);

    it("should handle missing fields gracefully during fill", async () => {
      const fillData = {
        testName: "Valid Name",
        nonExistentField: "Should be ignored",
      };

      // Should not throw error even with non-existent field
      const result = await generator.fillExistingPDF(testPDFPath, fillData);
      expect(result).toBeInstanceOf(Uint8Array);
    }, 30000);
  });

  describe("End-to-End Workflow with Validation", () => {
    it("should validate config before generation", async () => {
      const invalidConfig: GenerateConfig = {
        content: "",
        fields: [
          {
            name: "",
            type: "text",
          } as TextField,
        ],
      };

      // Validate first
      const validation = validator.validate(invalidConfig);
      expect(validation.valid).toBe(false);

      // Should also work with generator's validation
      const errors = generator.validateConfig(invalidConfig);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should complete full workflow with valid config", async () => {
      const validConfig: GenerateConfig = {
        content: `
          <div class="p-8 bg-gray-100">
            <h1 class="text-3xl font-bold text-blue-600 mb-6">Registration Form</h1>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">First Name</label>
                <div id="firstName" class="w-full h-10 border-2 border-gray-300 rounded px-3"></div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Last Name</label>
                <div id="lastName" class="w-full h-10 border-2 border-gray-300 rounded px-3"></div>
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-sm font-medium mb-2">Country</label>
              <div id="country" class="w-full h-10 border-2 border-gray-300 rounded px-3"></div>
            </div>
            
            <div class="mt-4">
              <label class="flex items-center">
                <input id="terms" type="checkbox" class="mr-2">
                <span>I accept the terms and conditions</span>
              </label>
            </div>
          </div>
        `,
        fields: [
          {
            name: "firstName",
            type: "text",
            selector: "#firstName",
            required: true,
            maxLength: 50,
          } as TextField,
          {
            name: "lastName",
            type: "text",
            selector: "#lastName",
            required: true,
            maxLength: 50,
          } as TextField,
          {
            name: "country",
            type: "dropdown",
            selector: "#country",
            options: ["France", "United States", "Canada", "Germany", "Spain"],
            defaultValue: "France",
          } as DropdownField,
          {
            name: "terms",
            type: "checkbox",
            selector: "#terms",
            required: true,
          } as CheckboxField,
        ],
        metadata: {
          title: "Registration Form",
          author: "PDF Tailwind Forms",
          subject: "User Registration",
          keywords: ["registration", "form", "user"],
          creationDate: new Date(),
        },
      };

      // Step 1: Validate configuration
      const validation = validator.validate(validConfig);
      expect(validation.valid).toBe(true);

      // Step 2: Generate PDF
      const result = await generator.generate(validConfig);
      expect(result.fieldCount).toBe(4);
      expect(result.pageCount).toBe(1);

      // Step 3: Verify PDF structure
      const pdfDoc = await PDFDocument.load(result.bytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      expect(fields).toHaveLength(4);
      expect(fields.map(f => f.getName())).toEqual(
        expect.arrayContaining(["firstName", "lastName", "country", "terms"])
      );

      // Step 4: Test form data operations
      const fillData = {
        firstName: "Jean",
        lastName: "Dupont",
        country: "France",
        terms: true,
      };

      const tempPath = "/tmp/integration-test.pdf";
      await fs.writeFile(tempPath, result.bytes);

      const filledPDF = await generator.fillExistingPDF(tempPath, fillData);
      expect(filledPDF).toBeInstanceOf(Uint8Array);

      const extractedData = await generator.extractFormData(tempPath);
      expect(extractedData.firstName).toBe("");
      expect(extractedData.lastName).toBe("");
      expect(extractedData.country).toBe("France"); // default value

      // Cleanup
      await fs.unlink(tempPath);
    }, 45000);
  });

  describe("Error Resilience", () => {
    it("should handle malformed HTML gracefully", async () => {
      const config: GenerateConfig = {
        content: "<div><p>Unclosed div and unclosed paragraph",
      };

      // Should not crash, even with malformed HTML
      const result = await generator.generate(config);
      expect(result).toBeDefined();
      expect(result.bytes).toBeInstanceOf(Uint8Array);
    }, 30000);

    it("should handle fields with non-existent selectors", async () => {
      const config: GenerateConfig = {
        content: "<div>No matching selectors here</div>",
        fields: [
          {
            name: "missingField",
            type: "text",
            selector: "#does-not-exist",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result).toBeDefined();
      expect(result.fieldCount).toBe(0); // No fields added due to missing selectors
    }, 30000);

    it("should handle complex TailwindCSS classes", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <div class="px-6 py-4">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Complex Styling Test</h2>
                <div id="styled-field" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></div>
              </div>
            </div>
          </div>
        `,
        fields: [
          {
            name: "styledField",
            type: "text",
            selector: "#styled-field",
            fontSize: 14,
            backgroundColor: [240, 248, 255],
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result).toBeDefined();
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Performance and Resource Management", () => {
    it("should handle batch generation efficiently", async () => {
      const configs: GenerateConfig[] = Array.from({ length: 3 }, (_, i) => ({
        content: `<div class="p-4"><h1>Batch PDF ${i + 1}</h1><div id="field-${i}" class="w-32 h-8 border"></div></div>`,
        fields: [
          {
            name: `field${i}`,
            type: "text",
            selector: `#field-${i}`,
          } as TextField,
        ],
      }));

      const startTime = Date.now();
      const results = await generator.generateBatch(configs);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds
      
      results.forEach((result, i) => {
        expect(result.fieldCount).toBe(1);
        expect(result.pageCount).toBe(1);
        expect(result.bytes).toBeInstanceOf(Uint8Array);
      });
    }, 45000);

    it("should handle large content efficiently", async () => {
      // Generate large content with many elements
      const largeContent = Array.from({ length: 100 }, (_, i) => 
        `<div class="mb-2 p-2 border">Item ${i + 1}: ${Math.random().toString(36)}</div>`
      ).join("\n");

      const config: GenerateConfig = {
        content: `<div class="p-4">${largeContent}</div>`,
      };

      const startTime = Date.now();
      const result = await generator.generate(config);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.bytes.length).toBeGreaterThan(1000);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    }, 30000);
  });

  describe("Real-world Scenarios", () => {
    it("should generate an invoice-like PDF", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="max-w-4xl mx-auto p-8 bg-white">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">INVOICE</h1>
                <p class="text-gray-600">#INV-2024-001</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Date: <span id="invoice-date" class="inline-block w-24 h-6 border-b"></span></p>
                <p class="text-sm text-gray-600">Due: <span id="due-date" class="inline-block w-24 h-6 border-b"></span></p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 class="font-semibold mb-2">Bill To:</h3>
                <div id="client-name" class="w-full h-6 border-b mb-2"></div>
                <div id="client-address" class="w-full h-16 border border-gray-300"></div>
              </div>
              <div>
                <h3 class="font-semibold mb-2">From:</h3>
                <div id="company-name" class="w-full h-6 border-b mb-2"></div>
                <div id="company-address" class="w-full h-16 border border-gray-300"></div>
              </div>
            </div>
            
            <div class="mb-8">
              <h3 class="font-semibold mb-4">Payment Method:</h3>
              <div id="payment-options" class="space-y-2">
                <label class="flex items-center">
                  <input type="radio" name="payment" value="card" class="mr-2">
                  Credit Card
                </label>
                <label class="flex items-center">
                  <input type="radio" name="payment" value="bank" class="mr-2">
                  Bank Transfer
                </label>
                <label class="flex items-center">
                  <input type="radio" name="payment" value="cash" class="mr-2">
                  Cash
                </label>
              </div>
            </div>
            
            <div class="border-t pt-4">
              <label class="flex items-center">
                <input id="terms-agreement" type="checkbox" class="mr-2">
                I agree to the payment terms and conditions
              </label>
            </div>
          </div>
        `,
        fields: [
          {
            name: "invoiceDate",
            type: "text",
            selector: "#invoice-date",
          } as TextField,
          {
            name: "dueDate",
            type: "text",
            selector: "#due-date",
          } as TextField,
          {
            name: "clientName",
            type: "text",
            selector: "#client-name",
          } as TextField,
          {
            name: "clientAddress",
            type: "text",
            selector: "#client-address",
            multiline: true,
          } as TextField,
          {
            name: "companyName",
            type: "text",
            selector: "#company-name",
          } as TextField,
          {
            name: "companyAddress",
            type: "text",
            selector: "#company-address",
            multiline: true,
          } as TextField,
          {
            name: "paymentMethod",
            type: "radio",
            selector: "#payment-options",
            options: [
              { value: "card", label: "Credit Card" },
              { value: "bank", label: "Bank Transfer" },
              { value: "cash", label: "Cash" },
            ],
          } as RadioField,
          {
            name: "termsAgreement",
            type: "checkbox",
            selector: "#terms-agreement",
            required: true,
          } as CheckboxField,
        ],
        metadata: {
          title: "Invoice INV-2024-001",
          author: "PDF Tailwind Forms",
          subject: "Business Invoice",
          keywords: ["invoice", "billing", "payment"],
        },
      };

      // Validate before generation
      const validation = validator.validate(config);
      expect(validation.valid).toBe(true);

      // Generate PDF
      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(8);
      expect(result.pageCount).toBe(1);

      // Test form functionality
      const fillData = {
        invoiceDate: "2024-01-15",
        dueDate: "2024-02-15",
        clientName: "ACME Corporation",
        clientAddress: "123 Business St\nNew York, NY 10001",
        companyName: "My Company",
        companyAddress: "456 Office Ave\nBoston, MA 02101",
        paymentMethod: "card",
        termsAgreement: true,
      };

      const tempPath = "/tmp/invoice-test.pdf";
      await fs.writeFile(tempPath, result.bytes);

      const filledPDF = await generator.fillExistingPDF(tempPath, fillData);
      expect(filledPDF).toBeInstanceOf(Uint8Array);

      // Cleanup
      await fs.unlink(tempPath);
    }, 45000);
  });
});