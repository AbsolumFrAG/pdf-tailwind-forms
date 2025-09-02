import { PDFGenerator, type GenerateConfig, type FormField, type TextField, type CheckboxField, type RadioField, type DropdownField } from "../pdf-generator";
import * as fs from "fs/promises";
import { PDFDocument } from "pdf-lib";

// Mock puppeteer
jest.mock("puppeteer", () => ({
  launch: jest.fn(),
}));

// Mock fs
jest.mock("fs/promises", () => ({
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

describe("PDFGenerator", () => {
  let generator: PDFGenerator;
  let mockBrowser: any;
  let mockPage: any;

  beforeEach(() => {
    // Setup mocks
    mockPage = {
      setContent: jest.fn(),
      evaluate: jest.fn(),
      pdf: jest.fn(),
      close: jest.fn(),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };

    // Mock puppeteer.launch
    const puppeteer = require("puppeteer");
    puppeteer.launch.mockResolvedValue(mockBrowser);

    generator = new PDFGenerator();
  });

  afterEach(async () => {
    await generator.destroy();
    jest.clearAllMocks();
  });

  describe("Constructor and Configuration", () => {
    it("should create instance with default options", () => {
      const defaultGenerator = new PDFGenerator();
      expect(defaultGenerator).toBeInstanceOf(PDFGenerator);
    });

    it("should create instance with custom options", () => {
      const customOptions = {
        tailwindCDN: "https://custom-tailwind.com",
        defaultFontSize: 14,
        defaultBorderWidth: 2,
        puppeteerOptions: { headless: false },
      };
      
      const customGenerator = new PDFGenerator(customOptions);
      expect(customGenerator).toBeInstanceOf(PDFGenerator);
    });
  });

  describe("HTML Generation", () => {
    it("should generate valid HTML with TailwindCSS", async () => {
      const content = '<div class="text-xl">Test Content</div>';
      const customCSS = ".custom { color: red; }";

      // Access private method via any cast for testing
      const html = (generator as any).generateHTML(content, customCSS);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain(content);
      expect(html).toContain(customCSS);
      expect(html).toContain("https://cdn.tailwindcss.com");
    });

    it("should include custom Tailwind CDN when provided", () => {
      const customCDN = "https://custom-tailwind.com";
      const customGenerator = new PDFGenerator({ tailwindCDN: customCDN });
      
      const html = (customGenerator as any).generateHTML("<div>test</div>");
      expect(html).toContain(customCDN);
    });
  });

  describe("RGB Color Normalization", () => {
    it("should normalize RGB values correctly", () => {
      const normalizeRGB = (generator as any).normalizeRGB.bind(generator);
      
      // Values already normalized (0-1)
      expect(normalizeRGB([0.5, 0.7, 0.9])).toEqual([0.5, 0.7, 0.9]);
      
      // Values need normalization (0-255)
      expect(normalizeRGB([128, 179, 230])).toEqual([128/255, 179/255, 230/255]);
      
      // Mixed values
      expect(normalizeRGB([0.5, 179, 0.9])).toEqual([0.5, 179/255, 0.9]);
    });
  });

  describe("Field Options Creation", () => {
    it("should create correct field options with position", () => {
      const field: TextField = {
        name: "testField",
        type: "text",
        width: 100,
        height: 30,
        offsetX: 5,
        offsetY: 10,
        borderWidth: 2,
        backgroundColor: [255, 255, 255],
        borderColor: [0, 0, 0],
      };

      const position = { x: 50, y: 100, width: 200, height: 25, pdfY: 150 };

      const options = (generator as any).createFieldOptions(field, position);

      expect(options.x).toBe(55); // 50 + 5 offset
      expect(options.y).toBe(110); // 100 + 10 offset (using position.y since no selector)
      expect(options.width).toBe(100); // field width
      expect(options.height).toBe(30); // field height
      expect(options.borderWidth).toBe(2);
    });

    it("should use default values when field properties are undefined", () => {
      const field: TextField = {
        name: "testField",
        type: "text",
      };

      const position = { x: 50, y: 100, width: 200, height: 25 };

      const options = (generator as any).createFieldOptions(field, position);

      expect(options.width).toBe(200); // position width
      expect(options.height).toBe(25); // position height
      expect(options.borderWidth).toBe(1); // default border width
    });
  });

  describe("Configuration Validation", () => {
    it("should validate valid configuration", () => {
      const validConfig: GenerateConfig = {
        content: "<div>Valid content</div>",
        fields: [
          {
            name: "testField",
            type: "text",
            selector: ".test-field",
          } as TextField,
        ],
      };

      const errors = generator.validateConfig(validConfig);
      expect(errors).toHaveLength(0);
    });

    it("should detect missing content", () => {
      const invalidConfig: GenerateConfig = {
        content: "",
      };

      const errors = generator.validateConfig(invalidConfig);
      expect(errors).toContain("Content is required");
    });

    it("should detect field without name", () => {
      const invalidConfig: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "",
            type: "text",
            selector: ".test",
          } as TextField,
        ],
      };

      const errors = generator.validateConfig(invalidConfig);
      expect(errors).toContain("Field name is required");
    });

    it("should detect field without selector or position", () => {
      const invalidConfig: GenerateConfig = {
        content: "<div>test</div>",
        fields: [
          {
            name: "testField",
            type: "text",
          } as TextField,
        ],
      };

      const errors = generator.validateConfig(invalidConfig);
      expect(errors).toContain("Field testField must have either selector or position");
    });

    it("should detect radio field without options", () => {
      const invalidConfig: GenerateConfig = {
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

      const errors = generator.validateConfig(invalidConfig);
      expect(errors).toContain("Radio field radioField must have options");
    });

    it("should detect dropdown field without options", () => {
      const invalidConfig: GenerateConfig = {
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

      const errors = generator.validateConfig(invalidConfig);
      expect(errors).toContain("Dropdown field dropdownField must have options");
    });
  });

  describe("Browser Lifecycle", () => {
    it("should initialize browser on first use", async () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
      };

      // Mock PDF generation steps
      mockPage.pdf.mockResolvedValue(Buffer.from("fake-pdf-content"));
      mockPage.evaluate.mockResolvedValue(null);

      // Mock PDFDocument.load to avoid actual PDF processing
      const mockPDFDoc = {
        getForm: jest.fn().mockReturnValue({
          getFields: jest.fn().mockReturnValue([]),
        }),
        getPages: jest.fn().mockReturnValue([{}]),
        setTitle: jest.fn(),
        setAuthor: jest.fn(),
        setSubject: jest.fn(),
        setKeywords: jest.fn(),
        setCreator: jest.fn(),
        setProducer: jest.fn(),
        setCreationDate: jest.fn(),
        setModificationDate: jest.fn(),
        save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      };

      jest.spyOn(PDFDocument, "load").mockResolvedValue(mockPDFDoc as any);

      await generator.generate(config);

      expect(mockBrowser.newPage).toHaveBeenCalled();
    });

    it("should handle destroy when browser exists", async () => {
      // First ensure browser is initialized
      const config: GenerateConfig = {
        content: "<div>test</div>",
      };

      mockPage.pdf.mockResolvedValue(Buffer.from("fake-pdf-content"));
      mockPage.evaluate.mockResolvedValue(null);

      const mockPDFDoc = {
        getForm: jest.fn().mockReturnValue({ getFields: jest.fn().mockReturnValue([]) }),
        getPages: jest.fn().mockReturnValue([{}]),
        setTitle: jest.fn(),
        setAuthor: jest.fn(),
        setSubject: jest.fn(),
        setKeywords: jest.fn(),
        setCreator: jest.fn(),
        setProducer: jest.fn(),
        setCreationDate: jest.fn(),
        setModificationDate: jest.fn(),
        save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      };

      jest.spyOn(PDFDocument, "load").mockResolvedValue(mockPDFDoc as any);
      
      await generator.generate(config);
      await generator.destroy();
      
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle multiple destroy calls gracefully", async () => {
      // Test that multiple destroy calls don't cause issues
      await generator.destroy();
      await generator.destroy(); // Second call should not throw
      
      // Should handle gracefully even if browser is null
      expect(true).toBe(true); // Test passes if no exception thrown
    });
  });

  describe("Error Handling", () => {
    it("should handle PDF generation errors gracefully", async () => {
      const config: GenerateConfig = {
        content: "<div>test</div>",
      };

      mockPage.pdf.mockRejectedValue(new Error("PDF generation failed"));

      await expect(generator.generate(config)).rejects.toThrow("PDF generation failed");
    });

    it("should handle browser launch failures", async () => {
      const puppeteer = require("puppeteer");
      puppeteer.launch.mockRejectedValue(new Error("Browser launch failed"));

      const newGenerator = new PDFGenerator();
      const config: GenerateConfig = {
        content: "<div>test</div>",
      };

      await expect(newGenerator.generate(config)).rejects.toThrow("Browser launch failed");
    });
  });

  describe("Batch Generation", () => {
    it("should generate multiple PDFs in batch", async () => {
      const configs: GenerateConfig[] = [
        { content: "<div>PDF 1</div>" },
        { content: "<div>PDF 2</div>" },
      ];

      // Mock successful generation
      jest.spyOn(generator, "generate").mockResolvedValue({
        bytes: new Uint8Array([1, 2, 3]),
        fieldCount: 0,
        pageCount: 1,
      });

      const results = await generator.generateBatch(configs);

      expect(results).toHaveLength(2);
      expect(generator.generate).toHaveBeenCalledTimes(2);
    });

    it("should handle batch generation with failures", async () => {
      const configs: GenerateConfig[] = [
        { content: "<div>PDF 1</div>" },
        { content: "<div>PDF 2</div>" },
      ];

      jest.spyOn(generator, "generate")
        .mockResolvedValueOnce({
          bytes: new Uint8Array([1, 2, 3]),
          fieldCount: 0,
          pageCount: 1,
        })
        .mockRejectedValueOnce(new Error("Generation failed"));

      await expect(generator.generateBatch(configs)).rejects.toThrow("Generation failed");
    });
  });
});