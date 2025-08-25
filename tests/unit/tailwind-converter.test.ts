import { rgb } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TailwindToPDFConverter } from "../../src/styles/tailwind-converter.js";

// Mock pdf-lib rgb function
vi.mock("pdf-lib", () => ({
  rgb: vi.fn((r, g, b) => ({ r, g, b, type: "Color" })),
  grayscale: vi.fn((gray) => ({ gray, type: "Grayscale" })),
}));

describe("TailwindToPDFConverter", () => {
  let converter: TailwindToPDFConverter;

  beforeEach(() => {
    converter = new TailwindToPDFConverter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should create converter instance", () => {
      expect(converter).toBeInstanceOf(TailwindToPDFConverter);
    });
  });

  describe("color conversion", () => {
    it("should convert background colors", () => {
      const styles = converter.convertTailwindToStyles("bg-red-500");

      expect(styles.backgroundColor).toBeDefined();
      expect(rgb).toHaveBeenCalledWith(0.94, 0.2, 0.2);
    });

    it("should convert text colors", () => {
      const styles = converter.convertTailwindToStyles("text-blue-600");

      expect(styles.textColor).toBeDefined();
      expect(rgb).toHaveBeenCalledWith(0.15, 0.39, 0.85);
    });

    it("should convert border colors", () => {
      const styles = converter.convertTailwindToStyles("border-green-400");

      expect(styles.borderColor).toBeDefined();
      expect(rgb).toHaveBeenCalledWith(0.29, 0.83, 0.47);
    });

    it("should handle grayscale colors", () => {
      const styles = converter.convertTailwindToStyles(
        "bg-gray-500 text-gray-700 border-gray-300"
      );

      expect(styles.backgroundColor).toBeDefined();
      expect(styles.textColor).toBeDefined();
      expect(styles.borderColor).toBeDefined();
      expect(rgb).toHaveBeenCalledWith(0.42, 0.42, 0.42); // gray-500
      expect(rgb).toHaveBeenCalledWith(0.21, 0.21, 0.21); // gray-700
      expect(rgb).toHaveBeenCalledWith(0.83, 0.83, 0.83); // gray-300
    });

    it("should handle black and white", () => {
      const styles = converter.convertTailwindToStyles("bg-black text-white");

      expect(rgb).toHaveBeenCalledWith(0, 0, 0); // black
      expect(rgb).toHaveBeenCalledWith(1, 1, 1); // white
    });

    it("should ignore invalid color names", () => {
      const styles = converter.convertTailwindToStyles("bg-invalid-color");

      expect(styles.backgroundColor).toBeUndefined();
    });
  });

  describe("font size conversion", () => {
    it("should convert text size classes", () => {
      const testCases = [
        { class: "text-xs", expected: 10 },
        { class: "text-sm", expected: 12 },
        { class: "text-base", expected: 14 },
        { class: "text-lg", expected: 16 },
        { class: "text-xl", expected: 18 },
        { class: "text-2xl", expected: 22 },
        { class: "text-3xl", expected: 28 },
        { class: "text-4xl", expected: 36 },
        { class: "text-5xl", expected: 48 },
        { class: "text-6xl", expected: 60 },
      ];

      testCases.forEach(({ class: className, expected }) => {
        const styles = converter.convertTailwindToStyles(className);
        expect(styles.fontSize).toBe(expected);
      });
    });
  });

  describe("border width conversion", () => {
    it("should convert border width classes", () => {
      const testCases = [
        { class: "border-0", expected: 0 },
        { class: "border", expected: 1 },
        { class: "border-2", expected: 2 },
        { class: "border-4", expected: 4 },
        { class: "border-8", expected: 8 },
      ];

      testCases.forEach(({ class: className, expected }) => {
        const styles = converter.convertTailwindToStyles(className);
        expect(styles.borderWidth).toBe(expected);
      });
    });
  });

  describe("border radius conversion", () => {
    it("should convert border radius classes", () => {
      const testCases = [
        { class: "rounded-none", expected: 0 },
        { class: "rounded-sm", expected: 2 },
        { class: "rounded", expected: 4 },
        { class: "rounded-md", expected: 6 },
        { class: "rounded-lg", expected: 8 },
        { class: "rounded-xl", expected: 12 },
        { class: "rounded-2xl", expected: 16 },
        { class: "rounded-3xl", expected: 24 },
        { class: "rounded-full", expected: 9999 },
      ];

      testCases.forEach(({ class: className, expected }) => {
        const styles = converter.convertTailwindToStyles(className);
        expect(styles.borderRadius).toBe(expected);
      });
    });
  });

  describe("text alignment conversion", () => {
    it("should convert text alignment classes", () => {
      const leftStyles = converter.convertTailwindToStyles("text-left");
      expect(leftStyles.textAlign).toBe("left");

      const centerStyles = converter.convertTailwindToStyles("text-center");
      expect(centerStyles.textAlign).toBe("center");

      const rightStyles = converter.convertTailwindToStyles("text-right");
      expect(rightStyles.textAlign).toBe("right");
    });
  });

  describe("font weight conversion", () => {
    it("should convert font weight classes", () => {
      const normalStyles = converter.convertTailwindToStyles("font-normal");
      expect(normalStyles.fontWeight).toBe("normal");

      const boldStyles = converter.convertTailwindToStyles("font-bold");
      expect(boldStyles.fontWeight).toBe("bold");
    });
  });

  describe("font style conversion", () => {
    it("should convert font style classes", () => {
      const italicStyles = converter.convertTailwindToStyles("italic");
      expect(italicStyles.fontStyle).toBe("italic");

      const normalStyles = converter.convertTailwindToStyles("not-italic");
      expect(normalStyles.fontStyle).toBe("normal");
    });
  });

  describe("text decoration conversion", () => {
    it("should convert text decoration classes", () => {
      const underlineStyles = converter.convertTailwindToStyles("underline");
      expect(underlineStyles.textDecoration).toBe("underline");

      const lineThroughStyles =
        converter.convertTailwindToStyles("line-through");
      expect(lineThroughStyles.textDecoration).toBe("line-through");

      const noneStyles = converter.convertTailwindToStyles("no-underline");
      expect(noneStyles.textDecoration).toBe("none");
    });
  });

  describe("padding conversion", () => {
    it("should convert all-sides padding", () => {
      const styles = converter.convertTailwindToStyles("p-4");

      expect(styles.padding).toEqual({
        top: 12,
        right: 12,
        bottom: 12,
        left: 12,
      });
    });

    it("should convert individual padding sides", () => {
      const styles = converter.convertTailwindToStyles("pt-2 pr-4 pb-6 pl-8");

      expect(styles.padding).toEqual({
        top: 6,
        right: 12,
        bottom: 18,
        left: 24,
      });
    });

    it("should convert horizontal and vertical padding", () => {
      const styles = converter.convertTailwindToStyles("px-3 py-5");

      expect(styles.padding).toEqual({
        top: 15,
        right: 9,
        bottom: 15,
        left: 9,
      });
    });
  });

  describe("margin conversion", () => {
    it("should convert all-sides margin", () => {
      const styles = converter.convertTailwindToStyles("m-4");

      expect(styles.margin).toEqual({
        top: 12,
        right: 12,
        bottom: 12,
        left: 12,
      });
    });

    it("should convert individual margin sides", () => {
      const styles = converter.convertTailwindToStyles("mt-1 mr-2 mb-3 ml-4");

      expect(styles.margin).toEqual({
        top: 3,
        right: 6,
        bottom: 9,
        left: 12,
      });
    });

    it("should convert horizontal and vertical margin", () => {
      const styles = converter.convertTailwindToStyles("mx-2 my-4");

      expect(styles.margin).toEqual({
        top: 12,
        right: 6,
        bottom: 12,
        left: 6,
      });
    });
  });

  describe("opacity conversion", () => {
    it("should convert opacity classes", () => {
      const testCases = [
        { class: "opacity-0", expected: 0 },
        { class: "opacity-25", expected: 0.25 },
        { class: "opacity-50", expected: 0.5 },
        { class: "opacity-75", expected: 0.75 },
        { class: "opacity-100", expected: 1 },
      ];

      testCases.forEach(({ class: className, expected }) => {
        const styles = converter.convertTailwindToStyles(className);
        expect(styles.opacity).toBe(expected);
      });
    });

    it("should handle invalid opacity values", () => {
      const styles = converter.convertTailwindToStyles("opacity-invalid");
      expect(styles.opacity).toBeUndefined();
    });
  });

  describe("multiple classes", () => {
    it("should handle multiple classes correctly", () => {
      const styles = converter.convertTailwindToStyles(
        "bg-blue-500 text-white border-2 border-gray-300 text-lg font-bold rounded-lg p-4 opacity-90"
      );

      expect(styles.backgroundColor).toBeDefined();
      expect(styles.textColor).toBeDefined();
      expect(styles.borderColor).toBeDefined();
      expect(styles.borderWidth).toBe(2);
      expect(styles.fontSize).toBe(16);
      expect(styles.fontWeight).toBe("bold");
      expect(styles.borderRadius).toBe(8);
      expect(styles.padding).toEqual({
        top: 12,
        right: 12,
        bottom: 12,
        left: 12,
      });
      expect(styles.opacity).toBe(0.9);
    });

    it("should handle empty class string", () => {
      const styles = converter.convertTailwindToStyles("");
      expect(Object.keys(styles)).toHaveLength(0);
    });

    it("should handle whitespace-only class string", () => {
      const styles = converter.convertTailwindToStyles("   ");
      expect(Object.keys(styles)).toHaveLength(0);
    });

    it("should filter out empty classes", () => {
      const styles = converter.convertTailwindToStyles(
        "  bg-red-500   text-white  "
      );
      expect(styles.backgroundColor).toBeDefined();
      expect(styles.textColor).toBeDefined();
    });
  });

  describe("custom color and size methods", () => {
    it("should add custom colors", () => {
      converter.addCustomColor("brand-primary", 51, 102, 204);

      const styles = converter.convertTailwindToStyles("bg-brand-primary");
      expect(styles.backgroundColor).toBeDefined();
      expect(rgb).toHaveBeenCalledWith(0.2, 0.4, 0.8);
    });

    it("should add custom sizes", () => {
      converter.addCustomSize("text-huge", 72);

      const styles = converter.convertTailwindToStyles("text-huge");
      expect(styles.fontSize).toBe(72);
    });
  });

  describe("color parsing utilities", () => {
    it("should parse hex colors", () => {
      const color = converter.parseHexColor("#ff6600");
      expect(rgb).toHaveBeenCalledWith(1, 0.4, 0);
    });

    it("should parse hex colors without hash", () => {
      const color = converter.parseHexColor("ff6600");
      expect(rgb).toHaveBeenCalledWith(1, 0.4, 0);
    });

    it("should parse RGB strings", () => {
      const color = converter.parseRgbColor("rgb(255, 102, 0)");
      expect(rgb).toHaveBeenCalledWith(1, 0.4, 0);
    });

    it("should handle invalid RGB strings", () => {
      const color = converter.parseRgbColor("invalid");
      expect(rgb).toHaveBeenCalledWith(0, 0, 0); // fallback to black
    });

    it("should parse RGB strings with spaces", () => {
      const color = converter.parseRgbColor("rgb(255, 102, 0)");
      expect(rgb).toHaveBeenCalledWith(1, 0.4, 0);
    });

    it("should parse RGB strings without spaces", () => {
      const color = converter.parseRgbColor("rgb(255,102,0)");
      expect(rgb).toHaveBeenCalledWith(1, 0.4, 0);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle conflicting text size and color classes", () => {
      // text-red-500 (color) vs text-lg (size)
      const styles = converter.convertTailwindToStyles("text-red-500 text-lg");

      expect(styles.textColor).toBeDefined();
      expect(styles.fontSize).toBe(16);
    });

    it("should handle conflicting border color and width classes", () => {
      // border-red-500 (color) vs border-2 (width)
      const styles = converter.convertTailwindToStyles(
        "border-red-500 border-2"
      );

      expect(styles.borderColor).toBeDefined();
      expect(styles.borderWidth).toBe(2);
    });

    it("should handle very large spacing values", () => {
      converter.addCustomSize("p-100", 300);
      const styles = converter.convertTailwindToStyles("p-100");

      // Should use the custom size mapping
      expect(styles.padding).toEqual({
        top: 300,
        right: 300,
        bottom: 300,
        left: 300,
      });
    });

    it("should prioritize later classes when conflicting", () => {
      const styles = converter.convertTailwindToStyles("text-sm text-lg");
      expect(styles.fontSize).toBe(16); // text-lg wins
    });

    it("should handle unknown classes gracefully", () => {
      const styles = converter.convertTailwindToStyles(
        "unknown-class-123 bg-red-500"
      );
      expect(styles.backgroundColor).toBeDefined();
      expect(Object.keys(styles)).toHaveLength(1);
    });
  });
});
