import { rgb } from "pdf-lib";
import { PDFTailwindGenerator } from "../core/pdf-generator.js";
import {
  DateFieldOptions,
  NumberFieldOptions,
  SignatureFieldOptions,
  TableFieldOptions,
  ValidationRule,
} from "../types/index.js";

export class FormHelpers {
  constructor(private generator: PDFTailwindGenerator) {}

  /**
   * Creates a simple table with form fields in each cell
   * Now supports automatic page breaks for large tables
   */
  public async createTable(
    options: TableFieldOptions & { autoPageBreak?: boolean }
  ): Promise<void> {
    const {
      x,
      y,
      rows,
      columns,
      cellWidth,
      cellHeight,
      headers,
      data,
      borderColor,
      borderWidth,
    } = options;

    const tableWidth = columns * cellWidth;
    const tableHeight = rows * cellHeight;

    // Handle automatic page breaks for large tables
    if (
      options.autoPageBreak !== false &&
      this.generator.checkContentOverflow(tableHeight)
    ) {
      // Split table across pages if needed
      const currentPageInfo = this.generator.getCurrentPageInfo();
      const availableHeight = currentPageInfo.remainingHeight;
      const rowsPerPage = Math.floor(availableHeight / cellHeight);

      if (rowsPerPage < rows) {
        await this.createSplitTable(options, rowsPerPage);
        return;
      }
    }

    // Draw table border with auto page break support
    this.generator.drawRectangle(x, y, tableWidth, tableHeight, {
      borderColor: borderColor || rgb(0, 0, 0),
      borderWidth: borderWidth || 1,
      tailwind: options.tailwind?.classes,
      autoPageBreak: options.autoPageBreak,
    });

    // Draw grid lines
    for (let i = 1; i < columns; i++) {
      const lineX = x + i * cellWidth;
      this.generator.drawRectangle(lineX, y, 1, tableHeight, {
        backgroundColor: borderColor || rgb(0, 0, 0),
      });
    }

    for (let i = 1; i < rows; i++) {
      const lineY = y + i * cellHeight;
      this.generator.drawRectangle(x, lineY, tableWidth, 1, {
        backgroundColor: borderColor || rgb(0, 0, 0),
      });
    }

    // Add headers if provided
    if (headers && headers.length > 0) {
      for (let col = 0; col < Math.min(headers.length, columns); col++) {
        const headerX = x + col * cellWidth + 5;
        const headerY = y + cellHeight - 15;

        this.generator.drawText(headers[col], headerX, headerY, {
          size: 10,
          tailwind: "font-bold text-gray-800",
          autoPageBreak: false, // Headers should stay with table
        });
      }
    }

    // Add data if provided
    if (data && data.length > 0) {
      const startRow = headers ? 1 : 0;
      for (let row = 0; row < Math.min(data.length, rows - startRow); row++) {
        const rowData = data[row];
        for (let col = 0; col < Math.min(rowData.length, columns); col++) {
          const cellX = x + col * cellWidth + 5;
          const cellY = y + cellHeight - 15 - row * cellHeight;

          this.generator.drawText(rowData[col], cellX, cellY, {
            size: 9,
            tailwind: "text-gray-700",
            autoPageBreak: false, // Table data should stay with table
          });
        }
      }
    }
  }

  /**
   * Creates a date field with validation
   * Now supports automatic page breaks
   */
  public async createDateField(
    options: DateFieldOptions & { autoPageBreak?: boolean }
  ): Promise<void> {
    // Add the text field with auto page break support
    await this.generator.addTextField({
      name: options.name,
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      defaultValue: options.defaultValue,
      autoPageBreak: options.autoPageBreak,
      tailwind: options.tailwind || {
        classes:
          "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2",
      },
    });

    // Add date format validation
    if (options.format || options.minDate || options.maxDate) {
      const validationRules: ValidationRule[] = [];

      if (options.format) {
        validationRules.push({
          type: "pattern",
          value: this.getDatePatternRegex(options.format),
          message: `Date must be in format: ${options.format}`,
        });
      }

      if (options.minDate || options.maxDate) {
        validationRules.push({
          type: "custom",
          message: "Date is outside allowed range",
          customValidator: (value: string) => {
            const date = new Date(value);
            if (isNaN(date.getTime())) return false;

            if (options.minDate && date < options.minDate) return false;
            if (options.maxDate && date > options.maxDate) return false;

            return true;
          },
        });
      }

      this.generator.setFieldValidation(options.name, {
        rules: validationRules,
        validateOnBlur: true,
      });
    }
  }

  /**
   * Creates a number field with validation
   * Now supports automatic page breaks
   */
  public async createNumberField(
    options: NumberFieldOptions & { autoPageBreak?: boolean }
  ): Promise<void> {
    // Add the text field with auto page break support
    await this.generator.addTextField({
      name: options.name,
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
      defaultValue: options.defaultValue,
      autoPageBreak: options.autoPageBreak,
      tailwind: options.tailwind || {
        classes:
          "bg-white border border-gray-300 text-gray-900 text-sm rounded p-2 text-right",
      },
    });

    // Add number validation
    const validationRules: ValidationRule[] = [];

    validationRules.push({
      type: "pattern",
      value: /^-?\d*\.?\d*$/,
      message: "Must be a valid number",
    });

    if (options.min !== undefined || options.max !== undefined) {
      validationRules.push({
        type: "custom",
        message: `Number must be between ${options.min ?? "-∞"} and ${
          options.max ?? "∞"
        }`,
        customValidator: (value: string) => {
          const num = parseFloat(value);
          if (isNaN(num)) return false;

          if (options.min !== undefined && num < options.min) return false;
          if (options.max !== undefined && num > options.max) return false;

          return true;
        },
      });
    }

    this.generator.setFieldValidation(options.name, {
      rules: validationRules,
      validateOnBlur: true,
    });
  }

  /**
   * Creates a signature field
   * Now supports automatic page breaks
   */
  public async createSignatureField(
    options: SignatureFieldOptions & { autoPageBreak?: boolean }
  ): Promise<void> {
    // Handle page break if needed
    if (options.autoPageBreak !== false) {
      this.generator.handleContentOverflow(options.height + 20); // Extra space for label
    }

    // Draw signature area
    this.generator.drawRectangle(
      options.x,
      options.y,
      options.width,
      options.height,
      {
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
        tailwind: options.tailwind?.classes,
        autoPageBreak: false, // Already handled above
      }
    );

    // Add signature label
    this.generator.drawText(
      "Signature:",
      options.x,
      options.y + options.height + 5,
      {
        size: 10,
        tailwind: "text-gray-600",
        autoPageBreak: false, // Part of signature group
      }
    );

    // Add signature line
    this.generator.drawRectangle(
      options.x + 5,
      options.y + 5,
      options.width - 10,
      1,
      {
        backgroundColor: rgb(0.8, 0.8, 0.8),
      }
    );

    // Add "X" placeholder
    this.generator.drawText(
      "X",
      options.x + options.width - 20,
      options.y + 10,
      {
        size: 16,
        color: rgb(0.7, 0.7, 0.7),
        tailwind: "font-bold",
        autoPageBreak: false, // Part of signature group
      }
    );

    if (options.required) {
      this.generator.setFieldValidation(options.name, {
        rules: [
          {
            type: "required",
            message: "Signature is required",
          },
        ],
      });
    }
  }

  /**
   * Creates a form section with title and description
   * Now supports automatic page breaks
   */
  public createFormSection(
    title: string,
    description: string,
    x: number,
    y: number,
    width: number,
    options?: { autoPageBreak?: boolean }
  ): void {
    // Handle page break if needed
    if (options?.autoPageBreak !== false) {
      this.generator.handleContentOverflow(40);
    }

    // Draw section background
    this.generator.drawRectangle(x, y - 40, width, 35, {
      backgroundColor: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      autoPageBreak: false, // Already handled above
    });

    // Add title
    this.generator.drawText(title, x + 10, y - 15, {
      size: 14,
      tailwind: "font-bold text-gray-800",
      autoPageBreak: false, // Part of section group
    });

    // Add description
    if (description) {
      this.generator.drawText(description, x + 10, y - 30, {
        size: 10,
        tailwind: "text-gray-600",
        autoPageBreak: false, // Part of section group
      });
    }
  }

  /**
   * Creates a multi-column layout helper
   */
  public calculateColumnLayout(
    pageWidth: number,
    columns: number,
    margin: number = 40
  ): {
    columnWidth: number;
    columnPositions: number[];
  } {
    const availableWidth = pageWidth - 2 * margin;
    const spacing = 20;
    const totalSpacing = (columns - 1) * spacing;
    const columnWidth = (availableWidth - totalSpacing) / columns;

    const columnPositions: number[] = [];
    for (let i = 0; i < columns; i++) {
      columnPositions.push(margin + i * (columnWidth + spacing));
    }

    return { columnWidth, columnPositions };
  }

  /**
   * Creates a responsive grid layout
   */
  public createGridLayout(
    startX: number,
    startY: number,
    itemWidth: number,
    itemHeight: number,
    columns: number,
    spacing: number = 10
  ): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    let currentX = startX;
    let currentY = startY;
    let columnCount = 0;

    // This would typically be called in a loop for multiple items
    // For now, return the pattern for the first few positions
    for (let i = 0; i < 12; i++) {
      positions.push({ x: currentX, y: currentY });

      columnCount++;
      if (columnCount >= columns) {
        currentX = startX;
        currentY -= itemHeight + spacing;
        columnCount = 0;
      } else {
        currentX += itemWidth + spacing;
      }
    }

    return positions;
  }

  /**
   * Validates required fields
   */
  public validateRequiredFields(
    fieldsData: Record<string, any>,
    requiredFields: string[]
  ): {
    isValid: boolean;
    missingFields: string[];
  } {
    const missingFields: string[] = [];

    for (const fieldName of requiredFields) {
      const value = fieldsData[fieldName];
      if (!value || (typeof value === "string" && value.trim().length === 0)) {
        missingFields.push(fieldName);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Applies conditional logic to show/hide fields
   */
  public applyConditionalLogic(
    fieldsData: Record<string, any>
  ): Record<string, boolean> {
    const fieldVisibility: Record<string, boolean> = {};

    // This would iterate through conditional logic rules
    // For now, return a basic implementation
    for (const fieldName of this.generator.getAllFields().keys()) {
      fieldVisibility[fieldName] = true; // Default to visible
    }

    return fieldVisibility;
  }

  private getDatePatternRegex(format: string): RegExp {
    const formatMap: Record<string, string> = {
      "MM/DD/YYYY": "^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\\d{4}$",
      "DD/MM/YYYY": "^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\\d{4}$",
      "YYYY-MM-DD": "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$",
      "MM-DD-YYYY": "^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\\d{4}$",
    };

    return new RegExp(formatMap[format] || formatMap["MM/DD/YYYY"]);
  }

  /**
   * Auto-generates field names based on labels
   */
  public generateFieldName(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  /**
   * Creates accessibility-compliant field labels
   * Now supports automatic page breaks and proper spacing
   */
  public addFieldLabel(
    text: string,
    x: number,
    y: number,
    fieldName: string,
    required: boolean = false,
    options?: { autoPageBreak?: boolean; labelSpacing?: number }
  ): void {
    const labelText = required ? `${text} *` : text;
    const labelSpacing = options?.labelSpacing || 20; // Default 20pt spacing between label and field

    // Position label above the field with proper spacing
    const labelY = y + labelSpacing;

    this.generator.drawText(labelText, x, labelY, {
      size: 11,
      tailwind: required ? "font-medium text-gray-700" : "text-gray-700",
      autoPageBreak: options?.autoPageBreak,
    });

    if (required) {
      // Add red asterisk after the label text
      const textWidth = this.getTextWidth(text, 11);
      this.generator.drawText("*", x + textWidth + 2, labelY, {
        size: 11,
        color: rgb(0.8, 0.2, 0.2),
        tailwind: "font-bold",
        autoPageBreak: false, // Part of label group
      });
    }
  }

  /**
   * Creates a table split across multiple pages
   */
  private async createSplitTable(
    options: TableFieldOptions,
    rowsPerPage: number
  ): Promise<void> {
    const {
      x,
      y,
      rows,
      columns,
      cellWidth,
      cellHeight,
      headers,
      data,
      borderColor,
      borderWidth,
    } = options;
    let currentRow = 0;
    let currentY = y;

    while (currentRow < rows) {
      const remainingRows = Math.min(rowsPerPage, rows - currentRow);
      const currentTableHeight = remainingRows * cellHeight;
      const tableWidth = columns * cellWidth;

      // Draw table border for current page
      this.generator.drawRectangle(
        x,
        currentY,
        tableWidth,
        currentTableHeight,
        {
          borderColor: borderColor || rgb(0, 0, 0),
          borderWidth: borderWidth || 1,
          tailwind: options.tailwind?.classes,
          autoPageBreak: false,
        }
      );

      // Draw grid lines
      for (let i = 1; i < columns; i++) {
        const lineX = x + i * cellWidth;
        this.generator.drawRectangle(lineX, currentY, 1, currentTableHeight, {
          backgroundColor: borderColor || rgb(0, 0, 0),
        });
      }

      for (let i = 1; i < remainingRows; i++) {
        const lineY = currentY + i * cellHeight;
        this.generator.drawRectangle(x, lineY, tableWidth, 1, {
          backgroundColor: borderColor || rgb(0, 0, 0),
        });
      }

      // Add headers on each page if this is the first section or headers should repeat
      const shouldShowHeaders =
        currentRow === 0 || (headers && headers.length > 0);
      let dataStartRow = 0;

      if (shouldShowHeaders && headers && headers.length > 0) {
        for (let col = 0; col < Math.min(headers.length, columns); col++) {
          const headerX = x + col * cellWidth + 5;
          const headerY = currentY + cellHeight - 15;
          this.generator.drawText(headers[col], headerX, headerY, {
            size: 10,
            tailwind: "font-bold text-gray-800",
            autoPageBreak: false,
          });
        }
        dataStartRow = 1;
      }

      // Add data for current page
      if (data && data.length > currentRow) {
        for (
          let row = dataStartRow;
          row < remainingRows && currentRow + row - dataStartRow < data.length;
          row++
        ) {
          const dataRowIndex = currentRow + row - dataStartRow;
          const rowData = data[dataRowIndex];

          for (let col = 0; col < Math.min(rowData.length, columns); col++) {
            const cellX = x + col * cellWidth + 5;
            const cellY =
              currentY + cellHeight - 15 - (row - dataStartRow) * cellHeight;
            this.generator.drawText(rowData[col], cellX, cellY, {
              size: 9,
              tailwind: "text-gray-700",
              autoPageBreak: false,
            });
          }
        }
      }

      // Move to next section
      currentRow += remainingRows;

      // Add page break if more rows remain
      if (currentRow < rows) {
        this.generator.addPageBreak();
        const contentArea = this.generator.getContentArea();
        currentY = contentArea.y + contentArea.height - cellHeight;
      }
    }
  }

  /**
   * Creates a smart form layout that automatically flows across pages with proper spacing
   */
  public async createAutoFlowForm(
    fields: Array<{
      type: "text" | "checkbox" | "radio" | "dropdown" | "section";
      label?: string;
      name?: string;
      options?: any;
      required?: boolean;
    }>
  ): Promise<void> {
    const contentArea = this.generator.getContentArea();
    let currentY = contentArea.y + contentArea.height - 50;
    const leftMargin = contentArea.x + 20;
    const fieldHeight = 25;
    const labelSpacing = 20; // Space between label and field
    const fieldSpacing = 30; // Space between field groups

    for (const field of fields) {
      const totalFieldHeight = fieldHeight + labelSpacing + fieldSpacing;

      // Check if we need a page break
      if (this.generator.checkContentOverflow(totalFieldHeight)) {
        this.generator.addPageBreak();
        currentY =
          this.generator.getContentArea().y +
          this.generator.getContentArea().height -
          50;
      }

      // Add label if provided (positioned above the field with proper spacing)
      if (field.label) {
        this.addFieldLabel(
          field.label,
          leftMargin,
          currentY - labelSpacing, // Position field below label
          field.name || field.label,
          field.required,
          {
            autoPageBreak: false,
            labelSpacing: 0, // Label method will handle its own spacing
          }
        );
      }

      // Add field based on type
      switch (field.type) {
        case "text":
          if (field.name) {
            await this.generator.addTextField({
              name: field.name,
              x: leftMargin,
              y: currentY - fieldHeight,
              width: 300,
              height: fieldHeight,
              autoPageBreak: false,
            });
          }
          break;

        case "checkbox":
          if (field.name) {
            await this.generator.addCheckBox({
              name: field.name,
              x: leftMargin,
              y: currentY - fieldHeight,
              width: 15,
              height: 15,
              autoPageBreak: false,
            });
          }
          break;

        case "section":
          if (field.label) {
            this.createFormSection(
              field.label,
              field.options?.description || "",
              leftMargin - 10,
              currentY + 10,
              400,
              { autoPageBreak: false }
            );
          }
          break;
      }

      currentY -= totalFieldHeight;
    }
  }

  /**
   * Creates a properly spaced form field with label
   */
  public async createFormField(options: {
    type: "text" | "number" | "checkbox" | "dropdown" | "button";
    label?: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height?: number;
    required?: boolean;
    fieldOptions?: any;
    labelSpacing?: number;
  }): Promise<{ nextY: number }> {
    const {
      type,
      label,
      name,
      x,
      y,
      width,
      height = 25,
      required = false,
      fieldOptions = {},
      labelSpacing = 20,
    } = options;

    let currentY = y;

    // Add label if provided
    if (label) {
      this.addFieldLabel(label, x, currentY, name, required, {
        labelSpacing: 0, // We'll handle spacing manually
      });
      currentY -= labelSpacing;
    }

    // Create field based on type
    switch (type) {
      case "text":
        await this.generator.addTextField({
          name,
          x,
          y: currentY - height,
          width,
          height,
          ...fieldOptions,
        });
        break;

      case "number":
        await this.createNumberField({
          name,
          x,
          y: currentY - height,
          width,
          height,
          ...fieldOptions,
        });
        break;

      case "checkbox":
        await this.generator.addCheckBox({
          name,
          x,
          y: currentY - height,
          width: width < 20 ? width : 15,
          height: height < 20 ? height : 15,
          ...fieldOptions,
        });
        break;

      case "dropdown":
        await this.generator.addDropdown({
          name,
          x,
          y: currentY - height,
          width,
          height,
          ...fieldOptions,
        });
        break;

      case "button":
        await this.generator.addButton({
          name,
          x,
          y: currentY - height,
          width,
          height,
          ...fieldOptions,
        });
        break;
    }

    // Return the Y position for the next field
    return { nextY: currentY - height - 10 }; // 10pt spacing after field
  }

  /**
   * Estimates text width (simplified calculation)
   */
  private getTextWidth(text: string, fontSize: number): number {
    // Simplified calculation - in practice, you'd use proper font metrics
    return text.length * fontSize * 0.6;
  }
}
