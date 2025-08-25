import { PDFDocument } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFTailwindGenerator } from "../../src/core/pdf-generator.js";
import {
  ButtonOptions,
  CheckBoxOptions,
  DropdownOptions,
  PDFGeneratorConfig,
  RadioGroupOptions,
  TextFieldOptions,
} from "../../src/types/index.js";

// Mock pdf-lib to avoid actual PDF operations in tests
vi.mock("pdf-lib", () => ({
  PDFDocument: {
    create: vi.fn(),
  },
  StandardFonts: {
    Helvetica: "Helvetica",
  },
  rgb: vi.fn(),
}));

describe("PDFTailwindGenerator", () => {
  let generator: PDFTailwindGenerator;
  let mockPdfDoc: any;
  let mockForm: any;
  let mockPage: any;

  beforeEach(() => {
    // Setup mocks
    mockPage = {
      drawText: vi.fn(),
      drawRectangle: vi.fn(),
    };

    mockForm = {
      createTextField: vi.fn(),
      createCheckBox: vi.fn(),
      createRadioGroup: vi.fn(),
      createDropdown: vi.fn(),
      createButton: vi.fn(),
      createOptionList: vi.fn(),
      flatten: vi.fn(),
    };

    mockPdfDoc = {
      getForm: vi.fn().mockReturnValue(mockForm),
      addPage: vi.fn().mockReturnValue(mockPage),
      setTitle: vi.fn(),
      setAuthor: vi.fn(),
      setSubject: vi.fn(),
      setKeywords: vi.fn(),
      setCreator: vi.fn(),
      setProducer: vi.fn(),
      setCreationDate: vi.fn(),
      setModificationDate: vi.fn(),
      setLanguage: vi.fn(),
      embedFont: vi.fn(),
      embedPng: vi.fn(),
      embedJpg: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    };

    (PDFDocument.create as any).mockResolvedValue(mockPdfDoc);

    generator = new PDFTailwindGenerator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should create generator without config", () => {
      expect(generator).toBeInstanceOf(PDFTailwindGenerator);
    });

    it("should initialize PDF document", async () => {
      await generator.initialize();
      expect(PDFDocument.create).toHaveBeenCalled();
      expect(mockPdfDoc.getForm).toHaveBeenCalled();
    });

    it("should set PDF metadata when config provided", async () => {
      const config: PDFGeneratorConfig = {
        title: "Test Document",
        author: "Test Author",
        subject: "Test Subject",
        creator: "Test Creator",
      };

      await generator.initialize(config);

      expect(mockPdfDoc.setTitle).toHaveBeenCalledWith("Test Document");
      expect(mockPdfDoc.setAuthor).toHaveBeenCalledWith("Test Author");
      expect(mockPdfDoc.setSubject).toHaveBeenCalledWith("Test Subject");
      expect(mockPdfDoc.setCreator).toHaveBeenCalledWith("Test Creator");
    });
  });

  describe("page management", () => {
    it("should add page with default dimensions", async () => {
      await generator.initialize();
      const page = generator.addPage();

      expect(mockPdfDoc.addPage).toHaveBeenCalledWith([595.28, 841.89]);
      expect(page).toBe(mockPage);
    });

    it("should add page with custom dimensions", async () => {
      await generator.initialize();
      const page = generator.addPage({ width: 800, height: 600 });

      expect(mockPdfDoc.addPage).toHaveBeenCalledWith([800, 600]);
      expect(page).toBe(mockPage);
    });

    it("should return current page", async () => {
      await generator.initialize();
      generator.addPage();

      expect(generator.getCurrentPage()).toBe(mockPage);
    });
  });

  describe("error handling", () => {
    it("should throw error when PDF not initialized", async () => {
      const options: TextFieldOptions = {
        name: "testField",
        x: 100,
        y: 200,
        width: 300,
        height: 40,
      };

      await expect(generator.addTextField(options)).rejects.toThrow(
        "PDF not initialized. Call initialize() first."
      );
    });
  });

  describe("text field creation", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should create basic text field", async () => {
      const mockTextField = {
        setText: vi.fn(),
        setMaxLength: vi.fn(),
        enableMultiline: vi.fn(),
        enableCombing: vi.fn(),
        enablePassword: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createTextField.mockReturnValue(mockTextField);

      const options: TextFieldOptions = {
        name: "testField",
        x: 100,
        y: 200,
        width: 300,
        height: 40,
      };

      const field = await generator.addTextField(options);

      expect(mockForm.createTextField).toHaveBeenCalledWith("testField");
      expect(mockTextField.addToPage).toHaveBeenCalledWith(
        mockPage,
        expect.objectContaining({
          x: 100,
          y: 200,
          width: 300,
          height: 40,
        })
      );
      expect(field).toBe(mockTextField);
    });

    it("should apply text field options", async () => {
      const mockTextField = {
        setText: vi.fn(),
        setMaxLength: vi.fn(),
        enableMultiline: vi.fn(),
        enableCombing: vi.fn(),
        enablePassword: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createTextField.mockReturnValue(mockTextField);

      const options: TextFieldOptions = {
        name: "testField",
        x: 100,
        y: 200,
        width: 300,
        height: 40,
        defaultValue: "Test Value",
        maxLength: 50,
        multiline: true,
        password: true,
      };

      await generator.addTextField(options);

      expect(mockTextField.setText).toHaveBeenCalledWith("Test Value");
      expect(mockTextField.setMaxLength).toHaveBeenCalledWith(50);
      expect(mockTextField.enableMultiline).toHaveBeenCalled();
      expect(mockTextField.enablePassword).toHaveBeenCalled();
    });
  });

  describe("checkbox creation", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should create basic checkbox", async () => {
      const mockCheckBox = {
        check: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createCheckBox.mockReturnValue(mockCheckBox);

      const options: CheckBoxOptions = {
        name: "testCheckbox",
        x: 100,
        y: 200,
        width: 20,
        height: 20,
      };

      const field = await generator.addCheckBox(options);

      expect(mockForm.createCheckBox).toHaveBeenCalledWith("testCheckbox");
      expect(mockCheckBox.addToPage).toHaveBeenCalledWith(
        mockPage,
        expect.objectContaining({
          x: 100,
          y: 200,
          width: 20,
          height: 20,
        })
      );
      expect(field).toBe(mockCheckBox);
    });

    it("should check checkbox when specified", async () => {
      const mockCheckBox = {
        check: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createCheckBox.mockReturnValue(mockCheckBox);

      const options: CheckBoxOptions = {
        name: "testCheckbox",
        x: 100,
        y: 200,
        width: 20,
        height: 20,
        checked: true,
      };

      await generator.addCheckBox(options);

      expect(mockCheckBox.check).toHaveBeenCalled();
    });
  });

  describe("radio group creation", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should create radio group with options", async () => {
      const mockRadioGroup = {
        addOptionToPage: vi.fn(),
        select: vi.fn(),
      };

      mockForm.createRadioGroup.mockReturnValue(mockRadioGroup);

      const options: RadioGroupOptions = {
        name: "testRadio",
        options: [
          { value: "option1", x: 100, y: 200, width: 20, height: 20 },
          { value: "option2", x: 100, y: 170, width: 20, height: 20 },
        ],
      };

      const field = await generator.addRadioGroup(options);

      expect(mockForm.createRadioGroup).toHaveBeenCalledWith("testRadio");
      expect(mockRadioGroup.addOptionToPage).toHaveBeenCalledTimes(2);
      expect(mockRadioGroup.addOptionToPage).toHaveBeenCalledWith(
        "option1",
        mockPage,
        expect.objectContaining({ x: 100, y: 200, width: 20, height: 20 })
      );
      expect(field).toBe(mockRadioGroup);
    });

    it("should select default value", async () => {
      const mockRadioGroup = {
        addOptionToPage: vi.fn(),
        select: vi.fn(),
      };

      mockForm.createRadioGroup.mockReturnValue(mockRadioGroup);

      const options: RadioGroupOptions = {
        name: "testRadio",
        options: [{ value: "option1", x: 100, y: 200, width: 20, height: 20 }],
        defaultValue: "option1",
      };

      await generator.addRadioGroup(options);

      expect(mockRadioGroup.select).toHaveBeenCalledWith("option1");
    });
  });

  describe("dropdown creation", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should create dropdown with string options", async () => {
      const mockDropdown = {
        addOptions: vi.fn(),
        select: vi.fn(),
        enableMultiselect: vi.fn(),
        enableEditing: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createDropdown.mockReturnValue(mockDropdown);

      const options: DropdownOptions = {
        name: "testDropdown",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        options: ["Option 1", "Option 2", "Option 3"],
      };

      const field = await generator.addDropdown(options);

      expect(mockForm.createDropdown).toHaveBeenCalledWith("testDropdown");
      expect(mockDropdown.addOptions).toHaveBeenCalledWith([
        "Option 1",
        "Option 2",
        "Option 3",
      ]);
      expect(field).toBe(mockDropdown);
    });

    it("should create dropdown with object options", async () => {
      const mockDropdown = {
        addOptions: vi.fn(),
        select: vi.fn(),
        enableMultiselect: vi.fn(),
        enableEditing: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createDropdown.mockReturnValue(mockDropdown);

      const options: DropdownOptions = {
        name: "testDropdown",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
        ],
      };

      await generator.addDropdown(options);

      expect(mockDropdown.addOptions).toHaveBeenCalledWith(["opt1", "opt2"]);
    });

    it("should apply dropdown settings", async () => {
      const mockDropdown = {
        addOptions: vi.fn(),
        select: vi.fn(),
        enableMultiselect: vi.fn(),
        enableEditing: vi.fn(),
        enableSorting: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createDropdown.mockReturnValue(mockDropdown);

      const options: DropdownOptions = {
        name: "testDropdown",
        x: 100,
        y: 200,
        width: 200,
        height: 30,
        options: ["Option 1", "Option 2"],
        defaultValue: "Option 1",
        multiselect: true,
        editable: true,
        sorted: true,
      };

      await generator.addDropdown(options);

      expect(mockDropdown.select).toHaveBeenCalledWith("Option 1");
      expect(mockDropdown.enableMultiselect).toHaveBeenCalled();
      expect(mockDropdown.enableEditing).toHaveBeenCalled();
      expect(mockDropdown.enableSorting).toHaveBeenCalled();
    });
  });

  describe("button creation", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should create button with label", async () => {
      const mockButton = {
        addToPage: vi.fn(),
      };

      mockForm.createButton.mockReturnValue(mockButton);

      const options: ButtonOptions = {
        name: "testButton",
        x: 100,
        y: 200,
        width: 100,
        height: 30,
        label: "Click Me",
      };

      const field = await generator.addButton(options);

      expect(mockForm.createButton).toHaveBeenCalledWith("testButton");
      expect(mockButton.addToPage).toHaveBeenCalledWith(
        "Click Me",
        mockPage,
        expect.objectContaining({
          x: 100,
          y: 200,
          width: 100,
          height: 30,
        })
      );
      expect(field).toBe(mockButton);
    });
  });

  describe("drawing operations", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should draw text", () => {
      generator.drawText("Hello World", 100, 200);

      expect(mockPage.drawText).toHaveBeenCalledWith(
        "Hello World",
        expect.objectContaining({ x: 100, y: 200 })
      );
    });

    it("should draw text with options", () => {
      generator.drawText("Hello World", 100, 200, {
        size: 16,
        color: "red",
      });

      expect(mockPage.drawText).toHaveBeenCalledWith(
        "Hello World",
        expect.objectContaining({
          x: 100,
          y: 200,
          size: 16,
          color: "red",
        })
      );
    });

    it("should draw rectangle", () => {
      generator.drawRectangle(100, 200, 300, 150);

      expect(mockPage.drawRectangle).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 100,
          y: 200,
          width: 300,
          height: 150,
        })
      );
    });

    it("should throw error when no current page", () => {
      const newGenerator = new PDFTailwindGenerator();

      expect(() => {
        newGenerator.drawText("Hello", 100, 200);
      }).toThrow("No current page. Add a page first.");

      expect(() => {
        newGenerator.drawRectangle(100, 200, 300, 150);
      }).toThrow("No current page. Add a page first.");
    });
  });

  describe("field management", () => {
    beforeEach(async () => {
      await generator.initialize();
      generator.addPage();
    });

    it("should store and retrieve fields", async () => {
      const mockTextField = {
        setText: vi.fn(),
        addToPage: vi.fn(),
      };

      mockForm.createTextField.mockReturnValue(mockTextField);

      const options: TextFieldOptions = {
        name: "testField",
        x: 100,
        y: 200,
        width: 300,
        height: 40,
      };

      await generator.addTextField(options);

      expect(generator.getField("testField")).toBe(mockTextField);
      expect(generator.getAllFields().size).toBe(1);
      expect(generator.getAllFields().get("testField")).toBe(mockTextField);
    });
  });

  describe("form operations", () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it("should flatten form", () => {
      generator.flattenForm();
      expect(mockForm.flatten).toHaveBeenCalled();
    });

    it("should set theme", () => {
      const newTheme = {
        fontSize: 16,
        fieldSpacing: 15,
      };

      generator.setTheme(newTheme);
      // No direct way to test private theme property,
      // but this ensures the method doesn't throw
    });
  });

  describe("document operations", () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it("should return PDF document", () => {
      expect(generator.getDocument()).toBe(mockPdfDoc);
    });

    it("should save PDF as Uint8Array", async () => {
      const result = await generator.save();

      expect(mockPdfDoc.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it("should save PDF as Buffer", async () => {
      const result = await generator.saveAsBuffer();

      expect(mockPdfDoc.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });

    it("should embed fonts", async () => {
      const fontBytes = new ArrayBuffer(100);
      await generator.embedFont(fontBytes);

      expect(mockPdfDoc.embedFont).toHaveBeenCalledWith(fontBytes);
    });

    it("should embed images", async () => {
      const imageBytes = new ArrayBuffer(100);

      await generator.addImage(imageBytes, "PNG");
      expect(mockPdfDoc.embedPng).toHaveBeenCalledWith(imageBytes);

      await generator.addImage(imageBytes, "JPG");
      expect(mockPdfDoc.embedJpg).toHaveBeenCalledWith(imageBytes);
    });
  });

  describe("validation and conditional logic", () => {
    beforeEach(async () => {
      await generator.initialize();
    });

    it("should set field validation", () => {
      const validation = {
        rules: [
          { type: "required" as const, message: "This field is required" },
        ],
      };

      generator.setFieldValidation("testField", validation);
      // Method should not throw - validation is stored internally
    });

    it("should set conditional logic", () => {
      const logic = {
        showIf: [
          {
            field: "otherField",
            operator: "equals" as const,
            value: "showValue",
          },
        ],
      };

      generator.setConditionalLogic("testField", logic);
      // Method should not throw - logic is stored internally
    });

    it("should add form sections", () => {
      const section = {
        title: "Personal Information",
        fields: ["firstName", "lastName"],
      };

      generator.addSection(section);
      // Method should not throw - section is stored internally
    });
  });
});
