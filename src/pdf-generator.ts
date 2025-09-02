import * as fs from "fs/promises";
import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFForm,
  PDFPage,
  PDFRadioGroup,
  PDFTextField,
  rgb,
} from "pdf-lib";
import puppeteer, { Browser, Page, PDFOptions } from "puppeteer";

/**
 * Configuration options for the PDFGenerator
 */
export interface PDFGeneratorOptions {
  /** URL for TailwindCSS CDN. Defaults to "https://cdn.tailwindcss.com" */
  tailwindCDN?: string;
  /** Puppeteer launch options. Defaults to headless mode with sandbox disabled */
  puppeteerOptions?: any;
  /** Default font size for form fields in points. Defaults to 12 */
  defaultFontSize?: number;
  /** Default border width for form fields in points. Defaults to 1 */
  defaultBorderWidth?: number;
}

/**
 * Coordinate position and dimensions for form field placement
 */
export interface Position {
  /** X coordinate in pixels or PDF points */
  x: number;
  /** Y coordinate in pixels or PDF points */
  y: number;
  /** Width in pixels or PDF points */
  width: number;
  /** Height in pixels or PDF points */
  height: number;
  /** Y coordinate adjusted for PDF coordinate system (optional) */
  pdfY?: number;
}

/**
 * Base interface for all form field types
 */
export interface BaseField {
  /** Unique identifier for the form field */
  name: string;
  /** Type of form field */
  type: "text" | "checkbox" | "radio" | "dropdown" | "button" | "signature";
  /** CSS selector to locate element in HTML for positioning */
  selector?: string;
  /** Absolute position coordinates (alternative to selector) */
  position?: Position;
  /** Horizontal offset from calculated position in points */
  offsetX?: number;
  /** Vertical offset from calculated position in points */
  offsetY?: number;
  /** Field width override in points */
  width?: number;
  /** Field height override in points */
  height?: number;
  /** Border width in points */
  borderWidth?: number;
  /** Background color as RGB array [0-255] or [0-1] */
  backgroundColor?: [number, number, number];
  /** Border color as RGB array [0-255] or [0-1] */
  borderColor?: [number, number, number];
  /** Font size in points */
  fontSize?: number;
  /** Font color as RGB array [0-255] or [0-1] */
  fontColor?: [number, number, number];
  /** Whether field is required for form submission */
  required?: boolean;
}

/**
 * Text input field configuration
 */
export interface TextField extends BaseField {
  type: "text";
  /** Default text value */
  defaultValue?: string;
  /** Enable multiline text input */
  multiline?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Hide input text (password field) */
  password?: boolean;
  /** Text alignment within field */
  alignment?: "left" | "center" | "right";
}

/**
 * Checkbox field configuration
 */
export interface CheckboxField extends BaseField {
  type: "checkbox";
  /** Default checked state */
  defaultValue?: boolean;
  /** Checkbox size in points */
  size?: number;
}

/**
 * Radio button option configuration
 */
export interface RadioOption {
  /** Value submitted when option is selected */
  value: string;
  /** Display label for the option */
  label?: string;
}

/**
 * Radio button group field configuration
 */
export interface RadioField extends BaseField {
  type: "radio";
  /** Array of radio button options */
  options: RadioOption[];
  /** Default selected option value */
  defaultValue?: string;
  /** Vertical spacing between options in points */
  spacing?: number;
  /** Radio button size in points */
  size?: number;
}

/**
 * Dropdown/select field configuration
 */
export interface DropdownField extends BaseField {
  type: "dropdown";
  /** Array of selectable options */
  options: string[];
  /** Default selected option */
  defaultValue?: string;
  /** Allow user to type custom values */
  editable?: boolean;
}

/**
 * Button field configuration
 */
export interface ButtonField extends BaseField {
  type: "button";
  /** Button display text */
  label: string;
  /** Button action type */
  action?: "submit" | "reset" | "javascript";
  /** JavaScript code for custom actions */
  javascript?: string;
}

/**
 * Digital signature field configuration
 */
export interface SignatureField extends BaseField {
  type: "signature";
}

/**
 * Union type representing all possible form field types
 */
export type FormField =
  | TextField
  | CheckboxField
  | RadioField
  | DropdownField
  | ButtonField
  | SignatureField;

/**
 * Main configuration object for PDF generation
 */
export interface GenerateConfig {
  /** HTML content to render in the PDF */
  content: string;
  /** Additional CSS styles to apply */
  customCSS?: string;
  /** Array of interactive form fields to add */
  fields?: FormField[];
  /** File path to save the generated PDF */
  outputPath?: string;
  /** Puppeteer PDF generation options */
  pdfOptions?: PDFOptions;
  /** PDF document metadata */
  metadata?: PDFMetadata;
}

/**
 * PDF document metadata configuration
 */
export interface PDFMetadata {
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Document subject */
  subject?: string;
  /** Array of keywords for document indexing */
  keywords?: string[];
  /** Application that created the document */
  creator?: string;
  /** Application that produced the PDF */
  producer?: string;
  /** Document creation date */
  creationDate?: Date;
  /** Document last modification date */
  modificationDate?: Date;
}

/**
 * Data structure for filling existing PDF forms
 */
export interface FillData {
  /** Field values indexed by field name */
  [fieldName: string]: string | boolean | number;
}

/**
 * Result object returned after PDF generation
 */
export interface GenerationResult {
  /** PDF file content as byte array */
  bytes: Uint8Array;
  /** File path if PDF was saved to disk */
  path?: string;
  /** Number of interactive fields added */
  fieldCount: number;
  /** Number of pages in the generated PDF */
  pageCount: number;
}

/**
 * Main PDF generator class that combines TailwindCSS styling with interactive AcroForms
 * 
 * This class orchestrates a two-step process:
 * 1. Puppeteer renders HTML with TailwindCSS to create visual PDF layout
 * 2. pdf-lib adds interactive form fields at calculated positions
 * 
 * @example
 * ```typescript
 * const generator = new PDFGenerator();
 * 
 * const config = {
 *   content: '<div class="p-8 text-center"><h1>Hello World</h1></div>',
 *   fields: [{
 *     name: 'userName',
 *     type: 'text',
 *     selector: '.user-input',
 *     required: true
 *   }],
 *   outputPath: './output.pdf'
 * };
 * 
 * const result = await generator.generate(config);
 * await generator.destroy();
 * ```
 */
export class PDFGenerator {
  private browser: Browser | null = null;
  private options: Required<PDFGeneratorOptions>;

  /**
   * Creates a new PDFGenerator instance
   * @param options Configuration options for the generator
   */
  constructor(options: PDFGeneratorOptions = {}) {
    this.options = {
      tailwindCDN: options.tailwindCDN || "https://cdn.tailwindcss.com",
      puppeteerOptions: options.puppeteerOptions || {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      defaultFontSize: options.defaultFontSize || 12,
      defaultBorderWidth: options.defaultBorderWidth || 1,
    };
  }

  /**
   * Initializes the Puppeteer browser instance
   * @private
   */
  private async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch(this.options.puppeteerOptions);
    }
  }

  /**
   * Closes the browser and cleans up resources
   * Must be called when done using the generator to prevent memory leaks
   */
  public async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generates complete HTML document with TailwindCSS integration
   * @param content HTML content to wrap
   * @param customCSS Additional CSS styles to include
   * @returns Complete HTML document string
   * @private
   */
  private generateHTML(content: string, customCSS: string = ""): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="${this.options.tailwindCDN}"></script>
          <style>
            @media print {
              @page {
                margin: 0;
                size: A4;
              }
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            * {
              box-sizing: border-box;
            }
            ${customCSS}
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;
  }

  /**
   * Calculates the real position of an element in the PDF coordinate system
   * Converts browser pixel coordinates to PDF points (72 DPI)
   * @param page Puppeteer page instance
   * @param selector CSS selector for the target element
   * @returns Position object or null if element not found
   * @private
   */
  private async calculateElementPosition(
    page: Page,
    selector: string
  ): Promise<Position | null> {
    return await page.evaluate((sel: string) => {
      const element = document.querySelector(sel);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      const pdfScale = 72 / 96; // Conversion pixels vers points PDF

      return {
        x: rect.left * pdfScale,
        y: rect.top * pdfScale,
        width: rect.width * pdfScale,
        height: rect.height * pdfScale,
        pdfY: (window.innerHeight - rect.bottom) * pdfScale,
      };
    }, selector);
  }

  /**
   * Adds a text field to the PDF form
   * @param form PDF form instance
   * @param field Text field configuration
   * @param page PDF page to add field to
   * @param position Calculated field position
   * @private
   */
  private addTextField(
    form: PDFForm,
    field: TextField,
    page: PDFPage,
    position: Position
  ): void {
    const textField = form.createTextField(field.name);

    if (field.defaultValue) textField.setText(field.defaultValue);
    if (field.required) textField.enableRequired();
    if (field.multiline) textField.enableMultiline();
    if (field.maxLength) textField.setMaxLength(field.maxLength);
    if (field.password) textField.enablePassword();

    // Set font size only if form has proper appearance entries
    try {
      textField.setFontSize(field.fontSize || this.options.defaultFontSize);
    } catch (error) {
      // Ignore font size errors - pdf-lib may not have proper font appearance setup
      console.warn(`Could not set font size for field ${field.name}:`, error);
    }

    const fieldOptions = this.createFieldOptions(field, position);
    textField.addToPage(page, fieldOptions);
  }

  /**
   * Ajoute une case à cocher au formulaire PDF
   */
  private addCheckboxField(
    form: PDFForm,
    field: CheckboxField,
    page: PDFPage,
    position: Position
  ): void {
    const checkbox = form.createCheckBox(field.name);

    if (field.defaultValue) {
      checkbox.check();
    } else {
      checkbox.uncheck();
    }

    const fieldOptions = this.createFieldOptions(field, position);
    checkbox.addToPage(page, {
      ...fieldOptions,
      width: field.size || 15,
      height: field.size || 15,
    });
  }

  /**
   * Ajoute des boutons radio au formulaire PDF
   */
  private addRadioField(
    form: PDFForm,
    field: RadioField,
    page: PDFPage,
    position: Position
  ): void {
    const radioGroup = form.createRadioGroup(field.name);

    field.options.forEach((option, index) => {
      const yOffset = index * (field.spacing || 25);
      radioGroup.addOptionToPage(option.value, page, {
        x: position.x + (field.offsetX || 0),
        y:
          (field.selector ? position.pdfY! : position.y) -
          yOffset +
          (field.offsetY || 0),
        width: field.size || 15,
        height: field.size || 15,
      });
    });

    if (field.defaultValue) {
      radioGroup.select(field.defaultValue);
    }
  }

  /**
   * Ajoute une liste déroulante au formulaire PDF
   */
  private addDropdownField(
    form: PDFForm,
    field: DropdownField,
    page: PDFPage,
    position: Position
  ): void {
    const dropdown = form.createDropdown(field.name);

    dropdown.addOptions(field.options);

    if (field.defaultValue) {
      dropdown.select(field.defaultValue);
    }

    if (field.editable) {
      dropdown.enableEditing();
    }

    // Set font size only if form has proper appearance entries
    try {
      dropdown.setFontSize(field.fontSize || this.options.defaultFontSize);
    } catch (error) {
      console.warn(`Could not set font size for dropdown ${field.name}:`, error);
    }

    const fieldOptions = this.createFieldOptions(field, position);
    dropdown.addToPage(page, fieldOptions);
  }

  /**
   * Ajoute un bouton au formulaire PDF
   */
  private addButtonField(
    form: PDFForm,
    field: ButtonField,
    page: PDFPage,
    position: Position
  ): void {
    const button = form.createButton(field.name);

    const fieldOptions = this.createFieldOptions(field, position);
    button.addToPage(field.label, page, fieldOptions);

    // Ajouter des actions JavaScript si nécessaire
    if (field.action === "submit") {
      // updateAppearances() doesn't need parameters for buttons
    }

    if (field.action === "javascript" && field.javascript) {
      // Note: Les actions JavaScript nécessitent une configuration supplémentaire
      // dans pdf-lib qui n'est pas toujours supportée
    }
  }

  /**
   * Ajoute un champ de signature au formulaire PDF
   */
  private addSignatureField(
    form: PDFForm,
    field: SignatureField,
    page: PDFPage,
    position: Position
  ): void {
    // Les champs de signature sont traités comme des champs de texte dans pdf-lib
    const signatureField = form.createTextField(`${field.name}_signature`);
    signatureField.setText("");

    const fieldOptions = this.createFieldOptions(field, position);
    signatureField.addToPage(page, {
      ...fieldOptions,
      height: field.height || 50,
    });
  }

  /**
   * Crée les options communes pour tous les champs
   */
  private createFieldOptions(field: BaseField, position: Position): any {
    return {
      x: position.x + (field.offsetX || 0),
      y: field.selector
        ? position.pdfY! + (field.offsetY || 0)
        : position.y + (field.offsetY || 0),
      width: field.width || position.width || 200,
      height: field.height || position.height || 20,
      borderWidth:
        field.borderWidth !== undefined
          ? field.borderWidth
          : this.options.defaultBorderWidth,
      backgroundColor: field.backgroundColor
        ? rgb(...this.normalizeRGB(field.backgroundColor))
        : undefined,
      borderColor: field.borderColor
        ? rgb(...this.normalizeRGB(field.borderColor))
        : rgb(0.8, 0.8, 0.8),
    };
  }

  /**
   * Normalise les valeurs RGB (0-255 vers 0-1) et clamp dans la plage valide
   */
  private normalizeRGB(
    color: [number, number, number]
  ): [number, number, number] {
    return color.map((c) => {
      // Normalise si > 1 (suppose 0-255), sinon utilise tel quel
      let normalized = c > 1 ? c / 255 : c;
      // Clamp dans la plage 0-1 pour éviter les erreurs pdf-lib
      return Math.max(0, Math.min(1, normalized));
    }) as [number, number, number];
  }

  /**
   * Ajoute les métadonnées au document PDF
   */
  private setMetadata(pdfDoc: PDFDocument, metadata: PDFMetadata): void {
    if (metadata.title) pdfDoc.setTitle(metadata.title);
    if (metadata.author) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);
    if (metadata.creator) pdfDoc.setCreator(metadata.creator);
    if (metadata.producer) pdfDoc.setProducer(metadata.producer);
    if (metadata.creationDate) pdfDoc.setCreationDate(metadata.creationDate);
    if (metadata.modificationDate)
      pdfDoc.setModificationDate(metadata.modificationDate);
  }

  /**
   * Generates a styled PDF with TailwindCSS and interactive AcroForms
   * 
   * This is the main method that orchestrates the two-step generation process:
   * 1. Renders HTML with TailwindCSS using Puppeteer
   * 2. Adds interactive form fields using pdf-lib
   * 
   * @param config Generation configuration object
   * @returns Promise resolving to generation result with PDF bytes and metadata
   * @throws Error if generation fails at any step
   * 
   * @example
   * ```typescript
   * const result = await generator.generate({
   *   content: '<div class="p-8">Form Content</div>',
   *   fields: [{
   *     name: 'email',
   *     type: 'text',
   *     selector: '.email-input',
   *     required: true
   *   }],
   *   outputPath: './form.pdf'
   * });
   * ```
   */
  public async generate(config: GenerateConfig): Promise<GenerationResult> {
    await this.init();

    const {
      content,
      customCSS = "",
      fields = [],
      outputPath,
      pdfOptions = {},
      metadata = {},
    } = config;

    try {
      // Étape 1: Créer une page avec le contenu stylé
      const page = await this.browser!.newPage();
      const html = this.generateHTML(content, customCSS);

      await page.setContent(html, {
        waitUntil: "networkidle0",
      });

      // Attendre que TailwindCSS soit chargé
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculer les positions des champs avant de générer le PDF
      const fieldPositions: Map<string, Position> = new Map();

      for (const field of fields) {
        if (field.selector) {
          const position = await this.calculateElementPosition(
            page,
            field.selector
          );
          if (position) {
            fieldPositions.set(field.name, position);
          }
        } else if (field.position) {
          fieldPositions.set(field.name, field.position);
        }
      }

      // Étape 2: Générer le PDF avec Puppeteer
      const styledPdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        ...pdfOptions,
      });

      await page.close();

      // Étape 3: Charger le PDF avec pdf-lib et ajouter les AcroForms
      const pdfDoc = await PDFDocument.load(styledPdfBuffer);

      // Ajouter les métadonnées
      this.setMetadata(pdfDoc, metadata);

      const form = pdfDoc.getForm();
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Ajouter les champs de formulaire
      let fieldCount = 0;
      for (const field of fields) {
        const position = fieldPositions.get(field.name);

        if (!position) {
          console.warn(`Position not found for field: ${field.name}`);
          continue;
        }

        switch (field.type) {
          case "text":
            this.addTextField(form, field as TextField, firstPage, position);
            break;
          case "checkbox":
            this.addCheckboxField(
              form,
              field as CheckboxField,
              firstPage,
              position
            );
            break;
          case "radio":
            this.addRadioField(form, field as RadioField, firstPage, position);
            break;
          case "dropdown":
            this.addDropdownField(
              form,
              field as DropdownField,
              firstPage,
              position
            );
            break;
          case "button":
            this.addButtonField(
              form,
              field as ButtonField,
              firstPage,
              position
            );
            break;
          case "signature":
            this.addSignatureField(
              form,
              field as SignatureField,
              firstPage,
              position
            );
            break;
        }
        fieldCount++;
      }

      // Sauvegarder le PDF final
      const pdfBytes = await pdfDoc.save();

      if (outputPath) {
        await fs.writeFile(outputPath, pdfBytes);
        console.log(`PDF saved to: ${outputPath}`);
      }

      return {
        bytes: pdfBytes,
        path: outputPath,
        fieldCount,
        pageCount: pages.length,
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  /**
   * Generates multiple PDFs in batch processing mode
   * 
   * Processes each configuration sequentially to avoid resource conflicts.
   * For better performance with many PDFs, consider using multiple generator instances.
   * 
   * @param configs Array of generation configurations
   * @returns Promise resolving to array of generation results
   * @throws Error if any generation fails
   * 
   * @example
   * ```typescript
   * const results = await generator.generateBatch([
   *   { content: '<div>Form 1</div>', fields: [] },
   *   { content: '<div>Form 2</div>', fields: [] }
   * ]);
   * ```
   */
  public async generateBatch(
    configs: GenerateConfig[]
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];

    for (const config of configs) {
      const result = await this.generate(config);
      results.push(result);
    }

    return results;
  }

  /**
   * Loads and fills an existing PDF form with data
   * 
   * This method can fill any PDF that contains AcroForm fields,
   * including PDFs generated by this library or other sources.
   * 
   * @param pdfPath Path to existing PDF file
   * @param data Form data to fill, indexed by field names
   * @param outputPath Optional path to save filled PDF
   * @returns Promise resolving to filled PDF bytes
   * @throws Error if PDF cannot be loaded or fields cannot be filled
   * 
   * @example
   * ```typescript
   * const filledPDF = await generator.fillExistingPDF(
   *   './template.pdf',
   *   { userName: 'John Doe', email: 'john@example.com' },
   *   './filled-form.pdf'
   * );
   * ```
   */
  public async fillExistingPDF(
    pdfPath: string,
    data: FillData,
    outputPath?: string
  ): Promise<Uint8Array> {
    const existingPdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Remplir les champs avec les données
    for (const [fieldName, value] of Object.entries(data)) {
      try {
        const field = form.getField(fieldName);

        if (field instanceof PDFTextField) {
          field.setText(String(value));
        } else if (field instanceof PDFCheckBox) {
          if (value) field.check();
          else field.uncheck();
        } else if (field instanceof PDFDropdown) {
          field.select(String(value));
        } else if (field instanceof PDFRadioGroup) {
          field.select(String(value));
        }
      } catch (error) {
        console.warn(`Field not found or error setting: ${fieldName}`, error);
      }
    }

    const pdfBytes = await pdfDoc.save();

    if (outputPath) {
      await fs.writeFile(outputPath, pdfBytes);
      console.log(`Filled PDF saved to: ${outputPath}`);
    }

    return pdfBytes;
  }

  /**
   * Extracts form data from an existing PDF
   * 
   * Reads all AcroForm field values from a PDF document.
   * Useful for processing submitted forms or migrating data.
   * 
   * @param pdfPath Path to PDF file to extract data from
   * @returns Promise resolving to extracted form data
   * @throws Error if PDF cannot be loaded or read
   * 
   * @example
   * ```typescript
   * const formData = await generator.extractFormData('./submitted-form.pdf');
   * console.log(formData); // { userName: 'John Doe', email: 'john@example.com' }
   * ```
   */
  public async extractFormData(pdfPath: string): Promise<FillData> {
    const existingPdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const data: FillData = {};

    for (const field of fields) {
      const name = field.getName();

      if (field instanceof PDFTextField) {
        data[name] = field.getText() || "";
      } else if (field instanceof PDFCheckBox) {
        data[name] = field.isChecked();
      } else if (field instanceof PDFDropdown) {
        data[name] = field.getSelected()[0] || "";
      } else if (field instanceof PDFRadioGroup) {
        data[name] = field.getSelected() || "";
      }
    }

    return data;
  }

  /**
   * Validates configuration before PDF generation
   * 
   * Performs comprehensive validation of the generation configuration
   * to catch errors early and provide helpful error messages.
   * 
   * @param config Generation configuration to validate
   * @returns Array of validation error messages (empty if valid)
   * 
   * @example
   * ```typescript
   * const errors = generator.validateConfig(config);
   * if (errors.length > 0) {
   *   console.error('Validation failed:', errors);
   *   return;
   * }
   * ```
   */
  public validateConfig(config: GenerateConfig): string[] {
    const errors: string[] = [];

    if (!config.content) {
      errors.push("Content is required");
    }

    if (config.fields) {
      for (const field of config.fields) {
        if (!field.name) {
          errors.push("Field name is required");
        }

        if (!field.selector && !field.position) {
          errors.push(
            `Field ${field.name} must have either selector or position`
          );
        }

        if (field.type === "radio" && !(field as RadioField).options?.length) {
          errors.push(`Radio field ${field.name} must have options`);
        }

        if (
          field.type === "dropdown" &&
          !(field as DropdownField).options?.length
        ) {
          errors.push(`Dropdown field ${field.name} must have options`);
        }
      }
    }

    return errors;
  }
}

// Export des types et de la classe
export default PDFGenerator;
