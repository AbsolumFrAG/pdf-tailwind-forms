import { FormField, GenerateConfig } from "./pdf-generator";

/**
 * Validator class for PDF generation configurations
 * 
 * Provides comprehensive validation of GenerateConfig objects
 * to ensure valid PDF generation and catch common errors early.
 * 
 * @example
 * ```typescript
 * const validator = new PDFValidator();
 * const result = validator.validate(config);
 * 
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 *   return;
 * }
 * ```
 */
export class PDFValidator {
  private errors: string[] = [];

  /**
   * Validates a complete PDF generation configuration
   * 
   * Performs comprehensive validation including content validation,
   * field validation, and PDF options validation.
   * 
   * @param config Configuration object to validate
   * @returns Validation result with success status and error list
   */
  public validate(config: GenerateConfig): {
    valid: boolean;
    errors: string[];
  } {
    this.errors = [];

    this.validateContent(config.content);
    this.validateFields(config.fields || []);
    this.validatePDFOptions(config.pdfOptions);

    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
    };
  }

  /**
   * Validates HTML content for security and completeness
   * 
   * Checks for required content and dangerous HTML tags that
   * could cause security issues or generation failures.
   * 
   * @param content HTML content string to validate
   * @private
   */
  private validateContent(content?: string): void {
    if (!content) {
      this.errors.push("Content is required");
      return;
    }

    if (content.trim().length === 0) {
      this.errors.push("Content cannot be empty");
    }

    // Vérifier si le HTML contient des balises dangereuses
    const dangerousTags = ["<script", "<iframe", "<object", "<embed"];
    for (const tag of dangerousTags) {
      if (content.toLowerCase().includes(tag)) {
        this.errors.push(`Dangerous HTML tag detected: ${tag}`);
      }
    }
  }

  /**
   * Validates form fields for consistency and completeness
   * 
   * Checks for duplicate field names and validates each field
   * according to its type-specific requirements.
   * 
   * @param fields Array of form fields to validate
   * @private
   */
  private validateFields(fields: FormField[]): void {
    const fieldNames = new Set<string>();

    for (const field of fields) {
      // Vérifier les doublons de noms
      if (fieldNames.has(field.name)) {
        this.errors.push(`Duplicate field name: ${field.name}`);
      }
      fieldNames.add(field.name);

      // Valider chaque champ
      this.validateField(field);
    }
  }

  /**
   * Validates an individual form field
   * 
   * Performs type-specific validation and ensures required
   * properties are present for the field type.
   * 
   * @param field Form field to validate
   * @private
   */
  private validateField(field: FormField): void {
    if (!field.name) {
      this.errors.push("Field must have a name");
    }

    if (!field.selector && !field.position) {
      this.errors.push(
        `Field "${field.name}" must have either selector or position`
      );
    }

    // Validations spécifiques par type
    switch (field.type) {
      case "text":
        this.validateTextField(field as any);
        break;
      case "radio":
        this.validateRadioField(field as any);
        break;
      case "dropdown":
        this.validateDropdownField(field as any);
        break;
      case "button":
        this.validateButtonField(field as any);
        break;
    }
  }

  private validateTextField(field: any): void {
    if (field.maxLength && field.maxLength <= 0) {
      this.errors.push(`Invalid maxLength for field "${field.name}"`);
    }
  }

  private validateRadioField(field: any): void {
    if (!field.options || field.options.length === 0) {
      this.errors.push(`Radio field "${field.name}" must have options`);
    }
  }

  private validateDropdownField(field: any): void {
    if (!field.options || field.options.length === 0) {
      this.errors.push(`Dropdown field "${field.name}" must have options`);
    }
  }

  private validateButtonField(field: any): void {
    if (!field.label) {
      this.errors.push(`Button field "${field.name}" must have a label`);
    }
  }

  private validatePDFOptions(options: any): void {
    if (!options) return;

    const validFormats = ["A3", "A4", "A5", "Legal", "Letter", "Tabloid"];
    if (options.format && !validFormats.includes(options.format)) {
      this.errors.push(`Invalid PDF format: ${options.format}`);
    }
  }
}
