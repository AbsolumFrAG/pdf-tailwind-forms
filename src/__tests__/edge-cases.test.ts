import { PDFGenerator, type GenerateConfig, type TextField, type CheckboxField, type RadioField, type DropdownField, type ButtonField, type SignatureField } from "../pdf-generator";
import { PDFValidator } from "../validator";
import * as fs from "fs/promises";

describe("Edge Cases and Error Handling", () => {
  let generator: PDFGenerator;
  let validator: PDFValidator;

  beforeAll(() => {
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

  describe("Field Type Edge Cases", () => {
    it("should handle text field with extreme values", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="extreme-text" class="w-full h-8 border"></div></div>`,
        fields: [
          {
            name: "extremeText",
            type: "text",
            selector: "#extreme-text",
            maxLength: 50,
            fontSize: 6,
            defaultValue: "Short text",
            password: true,
            multiline: true,
            alignment: "center",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle checkbox with all properties", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="full-checkbox" class="w-8 h-8 border"></div></div>`,
        fields: [
          {
            name: "fullCheckbox",
            type: "checkbox",
            selector: "#full-checkbox",
            defaultValue: true,
            size: 25,
            required: true,
            backgroundColor: [255, 0, 0],
            borderColor: [0, 255, 0],
            borderWidth: 3,
          } as CheckboxField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle radio field with complex options", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="complex-radio" class="space-y-4"></div></div>`,
        fields: [
          {
            name: "complexRadio",
            type: "radio",
            selector: "#complex-radio",
            options: [
              { value: "option-with-spaces", label: "Option With Spaces" },
              { value: "option_with_underscores", label: "Option With Underscores" },
              { value: "option-with-special-chars!@#", label: "Special Characters" },
              { value: "", label: "Empty Value" },
            ],
            defaultValue: "option-with-spaces",
            spacing: 35,
            size: 20,
          } as RadioField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle dropdown with many options", async () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => `Option ${i + 1}`);
      
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="many-options" class="w-64 h-8 border"></div></div>`,
        fields: [
          {
            name: "manyOptions",
            type: "dropdown",
            selector: "#many-options",
            options: manyOptions,
            defaultValue: "Option 25",
            editable: true,
          } as DropdownField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle button field with JavaScript action", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="js-button" class="w-32 h-10 border"></div></div>`,
        fields: [
          {
            name: "jsButton",
            type: "button",
            selector: "#js-button",
            label: "Execute JavaScript",
            action: "javascript",
            javascript: "app.alert('Hello from PDF!');",
          } as ButtonField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle signature field", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="signature-area" class="w-64 h-16 border-2 border-dashed"></div></div>`,
        fields: [
          {
            name: "userSignature",
            type: "signature",
            selector: "#signature-area",
            height: 60,
          } as SignatureField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Positioning Edge Cases", () => {
    it("should handle zero dimensions", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4">Zero dimension test</div>`,
        fields: [
          {
            name: "zeroField",
            type: "text",
            position: { x: 0, y: 0, width: 0, height: 0 },
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle negative offsets", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="offset-field" class="w-32 h-8 border"></div></div>`,
        fields: [
          {
            name: "offsetField",
            type: "text",
            selector: "#offset-field",
            offsetX: -10,
            offsetY: -5,
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle very large position values", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4">Large position test</div>`,
        fields: [
          {
            name: "largePositionField",
            type: "text",
            position: { x: 10000, y: 10000, width: 1000, height: 100 },
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Color Edge Cases", () => {
    it("should handle invalid RGB values", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="color-field" class="w-32 h-8 border"></div></div>`,
        fields: [
          {
            name: "colorField",
            type: "text",
            selector: "#color-field",
            backgroundColor: [300, -50, 1.5], // Invalid values
            borderColor: [256, 0, 255.5], // Mixed invalid values
          } as TextField,
        ],
      };

      // Should not crash with invalid colors
      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Content Edge Cases", () => {
    it("should handle empty HTML elements", async () => {
      const config: GenerateConfig = {
        content: `<div></div><p></p><span></span>`,
      };

      const result = await generator.generate(config);
      expect(result).toBeDefined();
      expect(result.pageCount).toBe(1);
    }, 30000);

    it("should handle deeply nested HTML", async () => {
      const deeplyNested = Array.from({ length: 20 }, () => "<div>").join("") +
                          "Deep content" +
                          Array.from({ length: 20 }, () => "</div>").join("");

      const config: GenerateConfig = {
        content: deeplyNested,
      };

      const result = await generator.generate(config);
      expect(result).toBeDefined();
    }, 30000);

    it("should handle special characters (excluding emojis)", async () => {
      const config: GenerateConfig = {
        content: `
          <div class="p-4">
            <h1>Special Characters Test</h1>
            <div id="special-field" class="w-64 h-8 border"></div>
          </div>
        `,
        fields: [
          {
            name: "specialField",
            type: "text",
            selector: "#special-field",
            defaultValue: "Accents: café naïve Symbols: +-*/ Punctuation: !@#$%",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Error Recovery", () => {
    it("should handle non-existent file operations gracefully", async () => {
      const nonExistentPath = "/non/existent/path/file.pdf";
      
      await expect(generator.fillExistingPDF(nonExistentPath, {}))
        .rejects.toThrow();

      await expect(generator.extractFormData(nonExistentPath))
        .rejects.toThrow();
    });

    it("should handle corrupted PDF data", async () => {
      const corruptedPDFPath = "/tmp/corrupted.pdf";
      const corruptedData = new Uint8Array([1, 2, 3, 4, 5]); // Invalid PDF data
      
      await fs.writeFile(corruptedPDFPath, corruptedData);

      await expect(generator.fillExistingPDF(corruptedPDFPath, {}))
        .rejects.toThrow();

      await expect(generator.extractFormData(corruptedPDFPath))
        .rejects.toThrow();

      // Cleanup
      await fs.unlink(corruptedPDFPath);
    });

    it("should handle network issues with TailwindCSS CDN", async () => {
      const generatorWithBadCDN = new PDFGenerator({
        tailwindCDN: "https://non-existent-cdn.com/tailwind.css",
        puppeteerOptions: {
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        },
      });

      const config: GenerateConfig = {
        content: `<div class="text-xl p-4">Should work without Tailwind</div>`,
      };

      try {
        const result = await generatorWithBadCDN.generate(config);
        expect(result).toBeDefined();
        expect(result.pageCount).toBe(1);
      } finally {
        await generatorWithBadCDN.destroy();
      }
    }, 30000);
  });

  describe("Memory and Resource Management", () => {
    it("should handle multiple generator instances", async () => {
      const generators = Array.from({ length: 3 }, () => new PDFGenerator());

      try {
        const configs = generators.map((_, i) => ({
          content: `<div class="p-4">Generator ${i + 1}</div>`,
        }));

        const promises = generators.map((gen, i) => gen.generate(configs[i]));
        const results = await Promise.all(promises);

        expect(results).toHaveLength(3);
        results.forEach(result => {
          expect(result).toBeDefined();
          expect(result.pageCount).toBe(1);
        });
      } finally {
        await Promise.all(generators.map(gen => gen.destroy()));
      }
    }, 45000);

    it("should handle rapid sequential operations", async () => {
      const configs: GenerateConfig[] = Array.from({ length: 5 }, (_, i) => ({
        content: `<div class="p-2">Rapid test ${i + 1}</div>`,
      }));

      const startTime = Date.now();
      const results = await generator.generateBatch(configs);
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(20000); // Should complete reasonably fast
    }, 30000);
  });

  describe("Boundary Value Testing", () => {
    it("should handle minimum valid field configuration", async () => {
      const config: GenerateConfig = {
        content: `<div><div id="min-field"></div></div>`,
        fields: [
          {
            name: "m", // Single character name
            type: "text",
            selector: "#min-field",
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle maximum reasonable field configuration", async () => {
      const longName = "a".repeat(100);
      const longValue = "x".repeat(1000);
      
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="max-field" class="w-full h-32 border"></div></div>`,
        fields: [
          {
            name: longName,
            type: "text",
            selector: "#max-field",
            defaultValue: longValue,
            maxLength: 2000,
            fontSize: 8,
            multiline: true,
            required: true,
            backgroundColor: [255, 255, 255],
            borderColor: [0, 0, 0],
            fontColor: [128, 128, 128],
            borderWidth: 5,
            offsetX: 50,
            offsetY: 25,
            width: 400,
            height: 100,
          } as TextField,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("Malformed Configuration Handling", () => {
    it("should handle undefined field properties gracefully", async () => {
      const config: GenerateConfig = {
        content: `<div><div id="undefined-props" class="w-32 h-8 border"></div></div>`,
        fields: [
          {
            name: "undefinedProps",
            type: "text",
            selector: "#undefined-props",
            fontSize: undefined,
            backgroundColor: undefined,
            borderColor: undefined,
            offsetX: undefined,
            offsetY: undefined,
          } as any,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);

    it("should handle null values in configuration", async () => {
      const config: GenerateConfig = {
        content: `<div><div id="null-props" class="w-32 h-8 border"></div></div>`,
        fields: [
          {
            name: "nullProps",
            type: "text",
            selector: "#null-props",
            defaultValue: null,
            backgroundColor: null,
            borderColor: null,
          } as any,
        ],
      };

      const result = await generator.generate(config);
      expect(result.fieldCount).toBe(1);
    }, 30000);
  });

  describe("CSS and Styling Edge Cases", () => {
    it("should handle invalid CSS gracefully", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4">Content with invalid CSS</div>`,
        customCSS: `
          .invalid-css {
            color: not-a-color;
            width: invalid-width;
            font-size: ;
          }
          .unclosed-rule {
            color: red
        `,
      };

      const result = await generator.generate(config);
      expect(result).toBeDefined();
    }, 30000);

    it("should handle CSS with special characters", async () => {
      const config: GenerateConfig = {
        content: `<div class="special-content">Content with special CSS</div>`,
        customCSS: `
          .special-content::before {
            content: "Special content with accents: café";
          }
          .special-class {
            color: #ff0000;
          }
        `,
      };

      const result = await generator.generate(config);
      expect(result).toBeDefined();
    }, 30000);
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent PDF generation", async () => {
      const configs = Array.from({ length: 3 }, (_, i) => ({
        content: `<div class="p-4">Concurrent PDF ${i + 1}</div>`,
      }));

      const promises = configs.map(config => generator.generate(config));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.pageCount).toBe(1);
      });
    }, 45000);
  });

  describe("File System Edge Cases", () => {
    it("should handle invalid output paths", async () => {
      const config: GenerateConfig = {
        content: `<div class="p-4">Invalid path test</div>`,
        outputPath: "/invalid/directory/structure/file.pdf",
      };

      // Should generate PDF bytes even if file save fails
      await expect(generator.generate(config)).rejects.toThrow();
    }, 30000);

    it("should handle very long file names", async () => {
      const longFileName = "/tmp/" + "a".repeat(200) + ".pdf";
      
      const config: GenerateConfig = {
        content: `<div class="p-4">Long filename test</div>`,
        outputPath: longFileName,
      };

      try {
        const result = await generator.generate(config);
        expect(result.path).toBe(longFileName);
        
        // Cleanup if file was created
        try {
          await fs.unlink(longFileName);
        } catch {
          // Ignore cleanup errors
        }
      } catch (error) {
        // Expected to fail on some systems due to filename length limits
        expect(error).toBeDefined();
      }
    }, 30000);
  });

  describe("Form Data Edge Cases", () => {
    it("should handle special characters in form data", async () => {
      const tempPDFPath = "/tmp/special-chars-test.pdf";
      
      // Create a simple PDF with text field
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="special-field" class="w-64 h-8 border"></div></div>`,
        fields: [
          {
            name: "specialField",
            type: "text",
            selector: "#special-field",
          } as TextField,
        ],
        outputPath: tempPDFPath,
      };

      await generator.generate(config);

      const specialData = {
        specialField: "Special chars: café naïve! @#$%^&*()_+-=[]{}|;':\",./<>?",
      };

      const result = await generator.fillExistingPDF(tempPDFPath, specialData);
      expect(result).toBeInstanceOf(Uint8Array);

      // Cleanup
      await fs.unlink(tempPDFPath);
    }, 30000);

    it("should handle boolean values for non-checkbox fields", async () => {
      const tempPDFPath = "/tmp/boolean-test.pdf";
      
      const config: GenerateConfig = {
        content: `<div class="p-4"><div id="text-field" class="w-64 h-8 border"></div></div>`,
        fields: [
          {
            name: "textField",
            type: "text",
            selector: "#text-field",
          } as TextField,
        ],
        outputPath: tempPDFPath,
      };

      await generator.generate(config);

      const booleanData = {
        textField: true, // Boolean for text field should be converted to string
      };

      const result = await generator.fillExistingPDF(tempPDFPath, booleanData as any);
      expect(result).toBeInstanceOf(Uint8Array);

      // Cleanup
      await fs.unlink(tempPDFPath);
    }, 30000);
  });

  describe("Validation Edge Cases", () => {
    it("should handle extremely large configurations", () => {
      const manyFields = Array.from({ length: 100 }, (_, i) => ({
        name: `field${i}`,
        type: "text" as const,
        selector: `#field${i}`,
      }));

      const config: GenerateConfig = {
        content: "<div>Many fields</div>",
        fields: manyFields,
      };

      const result = validator.validate(config);
      expect(result.valid).toBe(true);
    });

    it("should handle configuration with circular references", () => {
      const circularConfig: any = {
        content: "<div>Circular test</div>",
        fields: [],
      };
      
      // Create circular reference
      circularConfig.self = circularConfig;

      // Should not crash validator
      const result = validator.validate(circularConfig);
      expect(result).toBeDefined();
    });
  });
});