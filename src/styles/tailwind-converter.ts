import { Color, rgb } from "pdf-lib";

export interface StyleProperties {
  backgroundColor?: Color;
  borderColor?: Color;
  textColor?: Color;
  fontSize?: number;
  borderWidth?: number;
  borderRadius?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  textAlign?: "left" | "center" | "right";
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  opacity?: number;
}

export class TailwindToPDFConverter {
  private colorMap: Map<string, Color> = new Map();
  private sizeMap: Map<string, number> = new Map();

  constructor() {
    this.initializeColorMap();
    this.initializeSizeMap();
  }

  private initializeColorMap(): void {
    // Tailwind default colors
    const colors = {
      // Grayscale
      black: rgb(0, 0, 0),
      white: rgb(1, 1, 1),
      "gray-50": rgb(0.98, 0.98, 0.98),
      "gray-100": rgb(0.96, 0.96, 0.96),
      "gray-200": rgb(0.9, 0.9, 0.9),
      "gray-300": rgb(0.83, 0.83, 0.83),
      "gray-400": rgb(0.62, 0.62, 0.62),
      "gray-500": rgb(0.42, 0.42, 0.42),
      "gray-600": rgb(0.29, 0.29, 0.29),
      "gray-700": rgb(0.21, 0.21, 0.21),
      "gray-800": rgb(0.12, 0.12, 0.12),
      "gray-900": rgb(0.06, 0.06, 0.06),

      // Red
      "red-50": rgb(0.99, 0.95, 0.95),
      "red-100": rgb(0.99, 0.88, 0.88),
      "red-200": rgb(0.99, 0.73, 0.73),
      "red-300": rgb(0.99, 0.48, 0.48),
      "red-400": rgb(0.97, 0.33, 0.33),
      "red-500": rgb(0.94, 0.2, 0.2),
      "red-600": rgb(0.86, 0.12, 0.12),
      "red-700": rgb(0.73, 0.08, 0.08),
      "red-800": rgb(0.6, 0.06, 0.06),
      "red-900": rgb(0.5, 0.05, 0.05),

      // Blue
      "blue-50": rgb(0.94, 0.97, 1),
      "blue-100": rgb(0.86, 0.93, 0.99),
      "blue-200": rgb(0.75, 0.87, 0.99),
      "blue-300": rgb(0.57, 0.77, 0.97),
      "blue-400": rgb(0.37, 0.65, 0.95),
      "blue-500": rgb(0.23, 0.52, 0.91),
      "blue-600": rgb(0.15, 0.39, 0.85),
      "blue-700": rgb(0.11, 0.31, 0.71),
      "blue-800": rgb(0.11, 0.25, 0.57),
      "blue-900": rgb(0.11, 0.21, 0.46),

      // Green
      "green-50": rgb(0.94, 0.99, 0.96),
      "green-100": rgb(0.86, 0.98, 0.9),
      "green-200": rgb(0.73, 0.96, 0.81),
      "green-300": rgb(0.52, 0.91, 0.65),
      "green-400": rgb(0.29, 0.83, 0.47),
      "green-500": rgb(0.13, 0.72, 0.33),
      "green-600": rgb(0.09, 0.59, 0.26),
      "green-700": rgb(0.08, 0.47, 0.21),
      "green-800": rgb(0.08, 0.37, 0.17),
      "green-900": rgb(0.08, 0.31, 0.15),

      // Yellow
      "yellow-50": rgb(0.99, 0.99, 0.94),
      "yellow-100": rgb(0.99, 0.97, 0.83),
      "yellow-200": rgb(0.99, 0.94, 0.62),
      "yellow-300": rgb(0.99, 0.88, 0.36),
      "yellow-400": rgb(0.98, 0.8, 0.14),
      "yellow-500": rgb(0.93, 0.69, 0.05),
      "yellow-600": rgb(0.79, 0.53, 0.02),
      "yellow-700": rgb(0.63, 0.38, 0.04),
      "yellow-800": rgb(0.52, 0.31, 0.07),
      "yellow-900": rgb(0.44, 0.25, 0.08),

      // Purple
      "purple-50": rgb(0.98, 0.97, 0.99),
      "purple-100": rgb(0.95, 0.92, 0.98),
      "purple-200": rgb(0.91, 0.84, 0.96),
      "purple-300": rgb(0.84, 0.7, 0.93),
      "purple-400": rgb(0.75, 0.51, 0.88),
      "purple-500": rgb(0.66, 0.33, 0.82),
      "purple-600": rgb(0.57, 0.21, 0.74),
      "purple-700": rgb(0.48, 0.15, 0.62),
      "purple-800": rgb(0.4, 0.13, 0.51),
      "purple-900": rgb(0.33, 0.11, 0.42),
    };

    for (const [name, color] of Object.entries(colors)) {
      this.colorMap.set(name, color);
    }
  }

  private initializeSizeMap(): void {
    // Font sizes
    this.sizeMap.set("text-xs", 10);
    this.sizeMap.set("text-sm", 12);
    this.sizeMap.set("text-base", 14);
    this.sizeMap.set("text-lg", 16);
    this.sizeMap.set("text-xl", 18);
    this.sizeMap.set("text-2xl", 22);
    this.sizeMap.set("text-3xl", 28);
    this.sizeMap.set("text-4xl", 36);
    this.sizeMap.set("text-5xl", 48);
    this.sizeMap.set("text-6xl", 60);
    this.sizeMap.set("text-7xl", 72);
    this.sizeMap.set("text-8xl", 96);
    this.sizeMap.set("text-9xl", 128);

    // Border widths
    this.sizeMap.set("border", 1);
    this.sizeMap.set("border-0", 0);
    this.sizeMap.set("border-2", 2);
    this.sizeMap.set("border-4", 4);
    this.sizeMap.set("border-8", 8);

    // Spacing (padding/margin) - converting rem to points (1rem = 12pt)
    for (let i = 0; i <= 96; i++) {
      const value = i * 3; // 1 unit = 3pt
      this.sizeMap.set(`p-${i}`, value);
      this.sizeMap.set(`pt-${i}`, value);
      this.sizeMap.set(`pr-${i}`, value);
      this.sizeMap.set(`pb-${i}`, value);
      this.sizeMap.set(`pl-${i}`, value);
      this.sizeMap.set(`px-${i}`, value);
      this.sizeMap.set(`py-${i}`, value);
      this.sizeMap.set(`m-${i}`, value);
      this.sizeMap.set(`mt-${i}`, value);
      this.sizeMap.set(`mr-${i}`, value);
      this.sizeMap.set(`mb-${i}`, value);
      this.sizeMap.set(`ml-${i}`, value);
      this.sizeMap.set(`mx-${i}`, value);
      this.sizeMap.set(`my-${i}`, value);
    }

    // Border radius
    this.sizeMap.set("rounded-none", 0);
    this.sizeMap.set("rounded-sm", 2);
    this.sizeMap.set("rounded", 4);
    this.sizeMap.set("rounded-md", 6);
    this.sizeMap.set("rounded-lg", 8);
    this.sizeMap.set("rounded-xl", 12);
    this.sizeMap.set("rounded-2xl", 16);
    this.sizeMap.set("rounded-3xl", 24);
    this.sizeMap.set("rounded-full", 9999);
  }

  public convertTailwindToStyles(tailwindClasses: string): StyleProperties {
    const classes = tailwindClasses.split(" ").filter((c) => c.length > 0);
    const styles: StyleProperties = {};

    for (const className of classes) {
      // Background colors
      if (className.startsWith("bg-")) {
        const colorName = className.substring(3);
        const color = this.colorMap.get(colorName);
        if (color) {
          styles.backgroundColor = color;
        }
      }

      // Text colors
      if (className.startsWith("text-") && !this.sizeMap.has(className)) {
        const colorName = className.substring(5);
        const color = this.colorMap.get(colorName);
        if (color) {
          styles.textColor = color;
        }
      }

      // Border colors
      if (className.startsWith("border-") && !this.sizeMap.has(className)) {
        const colorName = className.substring(7);
        const color = this.colorMap.get(colorName);
        if (color) {
          styles.borderColor = color;
        }
      }

      // Font sizes
      if (this.sizeMap.has(className) && className.startsWith("text-")) {
        styles.fontSize = this.sizeMap.get(className);
      }

      // Border widths
      if (className.startsWith("border") && this.sizeMap.has(className)) {
        styles.borderWidth = this.sizeMap.get(className);
      }

      // Border radius
      if (className.startsWith("rounded")) {
        const radius = this.sizeMap.get(className);
        if (radius !== undefined) {
          styles.borderRadius = radius;
        }
      }

      // Text alignment
      if (className === "text-left") styles.textAlign = "left";
      if (className === "text-center") styles.textAlign = "center";
      if (className === "text-right") styles.textAlign = "right";

      // Font weight
      if (className === "font-normal") styles.fontWeight = "normal";
      if (className === "font-bold") styles.fontWeight = "bold";

      // Font style
      if (className === "italic") styles.fontStyle = "italic";
      if (className === "not-italic") styles.fontStyle = "normal";

      // Text decoration
      if (className === "underline") styles.textDecoration = "underline";
      if (className === "line-through") styles.textDecoration = "line-through";
      if (className === "no-underline") styles.textDecoration = "none";

      // Padding
      if (className.startsWith("p-") || className.startsWith("p")) {
        const value = this.sizeMap.get(className);
        if (value !== undefined) {
          if (!styles.padding) {
            styles.padding = { top: 0, right: 0, bottom: 0, left: 0 };
          }
          if (className.startsWith("pt-")) styles.padding.top = value;
          else if (className.startsWith("pr-")) styles.padding.right = value;
          else if (className.startsWith("pb-")) styles.padding.bottom = value;
          else if (className.startsWith("pl-")) styles.padding.left = value;
          else if (className.startsWith("px-")) {
            styles.padding.left = value;
            styles.padding.right = value;
          } else if (className.startsWith("py-")) {
            styles.padding.top = value;
            styles.padding.bottom = value;
          } else if (className.startsWith("p-")) {
            styles.padding = {
              top: value,
              right: value,
              bottom: value,
              left: value,
            };
          }
        }
      }

      // Margin
      if (className.startsWith("m-") || className.startsWith("m")) {
        const value = this.sizeMap.get(className);
        if (value !== undefined) {
          if (!styles.margin) {
            styles.margin = { top: 0, right: 0, bottom: 0, left: 0 };
          }
          if (className.startsWith("mt-")) styles.margin.top = value;
          else if (className.startsWith("mr-")) styles.margin.right = value;
          else if (className.startsWith("mb-")) styles.margin.bottom = value;
          else if (className.startsWith("ml-")) styles.margin.left = value;
          else if (className.startsWith("mx-")) {
            styles.margin.left = value;
            styles.margin.right = value;
          } else if (className.startsWith("my-")) {
            styles.margin.top = value;
            styles.margin.bottom = value;
          } else if (className.startsWith("m-")) {
            styles.margin = {
              top: value,
              right: value,
              bottom: value,
              left: value,
            };
          }
        }
      }

      // Opacity
      if (className.startsWith("opacity-")) {
        const opacityValue = parseInt(className.substring(8));
        if (!isNaN(opacityValue)) {
          styles.opacity = opacityValue / 100;
        }
      }
    }

    return styles;
  }

  public addCustomColor(name: string, r: number, g: number, b: number): void {
    this.colorMap.set(name, rgb(r / 255, g / 255, b / 255));
  }

  public addCustomSize(name: string, value: number): void {
    this.sizeMap.set(name, value);
  }

  public parseHexColor(hex: string): Color {
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  }

  public parseRgbColor(rgbString: string): Color {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]) / 255;
      const g = parseInt(match[2]) / 255;
      const b = parseInt(match[3]) / 255;
      return rgb(r, g, b);
    }
    return rgb(0, 0, 0);
  }
}
