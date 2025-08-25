import {
  PDFButton,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFForm,
  PDFOptionList,
  PDFPage,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { TailwindToPDFConverter } from "../styles/tailwind-converter.js";
import {
  ButtonOptions,
  CheckBoxOptions,
  ConditionalLogic,
  ContentFlow,
  DropdownOptions,
  FieldValidation,
  FormSection,
  FormTheme,
  ListBoxOptions,
  MultiPageLayout,
  PageBreakOptions,
  PDFGeneratorConfig,
  PageOptions,
  RadioGroupOptions,
  TextFieldOptions,
} from "../types/index.js";

export class PDFTailwindGenerator {
  private pdfDoc!: PDFDocument;
  private form!: PDFForm;
  private currentPage!: PDFPage;
  private styleConverter: TailwindToPDFConverter;
  private theme!: FormTheme;
  private fields: Map<string, any> = new Map();
  private validationRules: Map<string, FieldValidation> = new Map();
  private conditionalLogic: Map<string, ConditionalLogic> = new Map();
  private sections: FormSection[] = [];

  // Multi-page support properties
  private pages: PDFPage[] = [];
  private currentPageIndex: number = 0;
  private defaultPageOptions!: PageOptions;
  private multiPageLayout!: MultiPageLayout;
  private contentFlow!: ContentFlow;
  private fonts: Map<string, any> = new Map();
  private images: Map<string, any> = new Map();

  constructor(config?: PDFGeneratorConfig) {
    this.styleConverter = new TailwindToPDFConverter();
    this.initializeTheme();
    this.initializeDefaultPageOptions(config?.defaultPageOptions);
    this.initializeMultiPageLayout(config?.multiPageLayout);
  }

  private initializeTheme(): void {
    this.theme = {
      primaryColor: rgb(0.2, 0.4, 0.8),
      secondaryColor: rgb(0.5, 0.5, 0.5),
      fontFamily: "Helvetica",
      fontSize: 12,
      borderRadius: 4,
      fieldSpacing: 25, // Increased spacing to prevent overlapping
      labelPosition: "top",
      errorColor: rgb(0.8, 0.2, 0.2),
      successColor: rgb(0.2, 0.8, 0.2),
      warningColor: rgb(0.8, 0.6, 0.2),
    };
  }

  private initializeDefaultPageOptions(options?: PageOptions): void {
    this.defaultPageOptions = {
      width: options?.width || 595.28, // A4 width
      height: options?.height || 841.89, // A4 height
      margins: {
        top: options?.margins?.top || 50,
        bottom: options?.margins?.bottom || 50,
        left: options?.margins?.left || 50,
        right: options?.margins?.right || 50,
      },
      orientation: options?.orientation || "portrait",
    };
  }

  private initializeMultiPageLayout(layout?: MultiPageLayout): void {
    this.multiPageLayout = {
      autoPageBreak: layout?.autoPageBreak ?? true,
      pageBreakMargin: layout?.pageBreakMargin || 20,
      headerHeight: layout?.headerHeight || 30,
      footerHeight: layout?.footerHeight || 30,
      contentHeight: 0, // Will be calculated
      pageNumbering: {
        enabled: layout?.pageNumbering?.enabled ?? true,
        position: layout?.pageNumbering?.position || "bottom-center",
        format: layout?.pageNumbering?.format || "Page {current} of {total}",
        startPage: layout?.pageNumbering?.startPage || 1,
        fontSize: layout?.pageNumbering?.fontSize || 10,
        color: layout?.pageNumbering?.color || rgb(0.3, 0.3, 0.3),
      },
      header: layout?.header || { enabled: false },
      footer: layout?.footer || { enabled: false },
      ...layout,
    };
  }

  private calculateContentHeight(): number {
    const margins = this.defaultPageOptions.margins!;
    return (
      this.defaultPageOptions.height! -
      margins.top! -
      margins.bottom! -
      this.multiPageLayout.headerHeight! -
      this.multiPageLayout.footerHeight!
    );
  }

  private initializeContentFlow(): void {
    this.contentFlow = {
      currentY:
        this.defaultPageOptions.height! -
        this.defaultPageOptions.margins!.top! -
        this.multiPageLayout.headerHeight!,
      remainingHeight: this.calculateContentHeight(),
      pageNumber: 1,
      totalPages: 1,
      isOverflowing: false,
    };
  }

  public async initialize(config?: PDFGeneratorConfig): Promise<void> {
    this.pdfDoc = await PDFDocument.create();
    this.form = this.pdfDoc.getForm();

    if (config) {
      if (config.title) this.pdfDoc.setTitle(config.title);
      if (config.author) this.pdfDoc.setAuthor(config.author);
      if (config.subject) this.pdfDoc.setSubject(config.subject);
      if (config.keywords) this.pdfDoc.setKeywords(config.keywords);
      if (config.creator) this.pdfDoc.setCreator(config.creator);
      if (config.producer) this.pdfDoc.setProducer(config.producer);
      if (config.creationDate) this.pdfDoc.setCreationDate(config.creationDate);
      if (config.modificationDate)
        this.pdfDoc.setModificationDate(config.modificationDate);
      if (config.language) this.pdfDoc.setLanguage(config.language);
    }
  }

  public addPage(options?: PageOptions): PDFPage {
    const pageOptions = { ...this.defaultPageOptions, ...options };
    const width = pageOptions.width!;
    const height = pageOptions.height!;

    const newPage = this.pdfDoc.addPage([width, height]);
    this.pages.push(newPage);
    this.currentPage = newPage;
    this.currentPageIndex = this.pages.length - 1;

    // Initialize content flow for first page
    if (this.pages.length === 1) {
      this.multiPageLayout.contentHeight = this.calculateContentHeight();
      this.initializeContentFlow();
    }

    // Add header and footer if enabled
    this.addHeaderAndFooter();

    return newPage;
  }

  public addPageBreak(options?: PageBreakOptions): PDFPage {
    // Update total pages count for existing pages
    this.updateTotalPagesCount();

    const newPage = this.addPage();
    this.contentFlow.pageNumber++;
    this.contentFlow.currentY =
      this.defaultPageOptions.height! -
      this.defaultPageOptions.margins!.top! -
      this.multiPageLayout.headerHeight!;
    this.contentFlow.remainingHeight = this.calculateContentHeight();
    this.contentFlow.isOverflowing = false;

    return newPage;
  }

  private addHeaderAndFooter(): void {
    if (!this.currentPage) return;

    const pageWidth = this.defaultPageOptions.width!;
    const pageHeight = this.defaultPageOptions.height!;
    const margins = this.defaultPageOptions.margins!;

    // Add header
    if (this.multiPageLayout.header?.enabled) {
      const headerY = pageHeight - margins.top! - 10;
      const headerContent =
        typeof this.multiPageLayout.header.content === "function"
          ? this.multiPageLayout.header.content(
              this.contentFlow.pageNumber,
              this.contentFlow.totalPages
            )
          : this.multiPageLayout.header.content || "";

      this.currentPage.drawText(headerContent, {
        x: this.getAlignmentX(
          this.multiPageLayout.header.alignment || "center",
          headerContent,
          pageWidth,
          margins
        ),
        y: headerY,
        size: this.multiPageLayout.header.fontSize || 12,
        color: this.multiPageLayout.header.color || rgb(0, 0, 0),
        font: this.multiPageLayout.header.font,
      });
    }

    // Add footer
    if (this.multiPageLayout.footer?.enabled) {
      const footerY = margins.bottom! + 10;
      const footerContent =
        typeof this.multiPageLayout.footer.content === "function"
          ? this.multiPageLayout.footer.content(
              this.contentFlow.pageNumber,
              this.contentFlow.totalPages
            )
          : this.multiPageLayout.footer.content || "";

      this.currentPage.drawText(footerContent, {
        x: this.getAlignmentX(
          this.multiPageLayout.footer.alignment || "center",
          footerContent,
          pageWidth,
          margins
        ),
        y: footerY,
        size: this.multiPageLayout.footer.fontSize || 12,
        color: this.multiPageLayout.footer.color || rgb(0, 0, 0),
        font: this.multiPageLayout.footer.font,
      });
    }

    // Add page numbering
    if (
      this.multiPageLayout.pageNumbering?.enabled &&
      this.contentFlow.pageNumber >=
        (this.multiPageLayout.pageNumbering.startPage || 1)
    ) {
      const pageNumberText = this.multiPageLayout.pageNumbering
        .format!.replace("{current}", this.contentFlow.pageNumber.toString())
        .replace("{total}", this.contentFlow.totalPages.toString());

      const position = this.multiPageLayout.pageNumbering.position!;
      let x: number, y: number;

      if (position.includes("top")) {
        y = pageHeight - margins.top! - 10;
      } else {
        y = margins.bottom! + 10;
      }

      if (position.includes("left")) {
        x = margins.left!;
      } else if (position.includes("right")) {
        x = pageWidth - margins.right! - 50;
      } else {
        x = pageWidth / 2 - 25;
      }

      this.currentPage.drawText(pageNumberText, {
        x,
        y,
        size: this.multiPageLayout.pageNumbering.fontSize || 10,
        color: this.multiPageLayout.pageNumbering.color || rgb(0.3, 0.3, 0.3),
        font: this.multiPageLayout.pageNumbering.font,
      });
    }
  }

  private getAlignmentX(
    alignment: string,
    text: string,
    pageWidth: number,
    margins: any
  ): number {
    switch (alignment) {
      case "left":
        return margins.left!;
      case "right":
        return pageWidth - margins.right! - text.length * 6; // Rough text width estimation
      case "center":
      default:
        return (pageWidth - text.length * 6) / 2;
    }
  }

  private updateTotalPagesCount(): void {
    this.contentFlow.totalPages = this.pages.length + 1;
  }

  public checkContentOverflow(
    elementHeight: number,
    currentY?: number
  ): boolean {
    const y = currentY || this.contentFlow.currentY;
    const minY =
      this.defaultPageOptions.margins!.bottom! +
      this.multiPageLayout.footerHeight!;

    return y - elementHeight < minY;
  }

  public handleContentOverflow(elementHeight: number): boolean {
    if (
      this.multiPageLayout.autoPageBreak &&
      this.checkContentOverflow(elementHeight)
    ) {
      this.addPageBreak();
      return true;
    }
    return false;
  }

  public updateCurrentY(deltaY: number): void {
    this.contentFlow.currentY -= deltaY;
    this.contentFlow.remainingHeight -= deltaY;
  }

  public getCurrentPageInfo(): ContentFlow {
    return { ...this.contentFlow };
  }

  public getPageCount(): number {
    return this.pages.length;
  }

  public setCurrentPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.pages.length) {
      this.currentPageIndex = pageIndex;
      this.currentPage = this.pages[pageIndex];
    }
  }

  public getAllPages(): PDFPage[] {
    return [...this.pages];
  }

  public async addTextField(
    options: TextFieldOptions & { autoPageBreak?: boolean }
  ): Promise<PDFTextField> {
    if (!this.form || !this.currentPage)
      throw new Error("PDF not initialized. Call initialize() first.");

    // Handle automatic page breaks
    if (options.autoPageBreak !== false && this.multiPageLayout.autoPageBreak) {
      if (this.handleContentOverflow(options.height)) {
        options.y = this.contentFlow.currentY - options.height;
      }
    }

    const textField = this.form.createTextField(options.name);

    if (options.defaultValue) textField.setText(options.defaultValue);
    if (options.maxLength) textField.setMaxLength(options.maxLength);
    if (options.multiline) textField.enableMultiline();
    if (options.combed) textField.enableCombing();
    if (options.password) textField.enablePassword();
    if (options.fileSelect) textField.enableFileSelection();
    if (options.spellCheck) textField.enableSpellChecking();
    if (options.scrollable) textField.enableScrolling();

    // Apply Tailwind styles
    const fieldOptions: any = {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };

    if (options.tailwind) {
      const styles = this.styleConverter.convertTailwindToStyles(
        options.tailwind.classes
      );

      if (styles.backgroundColor)
        fieldOptions.backgroundColor = styles.backgroundColor;
      if (styles.borderColor) fieldOptions.borderColor = styles.borderColor;
      if (styles.textColor) fieldOptions.textColor = styles.textColor;
      if (styles.fontSize) fieldOptions.fontSize = styles.fontSize;
      if (styles.borderWidth) fieldOptions.borderWidth = styles.borderWidth;
    }

    // Apply base options
    if (options.font) fieldOptions.font = options.font;
    if (options.fontSize) fieldOptions.fontSize = options.fontSize;
    if (options.textColor) fieldOptions.textColor = options.textColor;
    if (options.backgroundColor)
      fieldOptions.backgroundColor = options.backgroundColor;
    if (options.borderColor) fieldOptions.borderColor = options.borderColor;
    if (options.borderWidth) fieldOptions.borderWidth = options.borderWidth;
    if (options.rotate) fieldOptions.rotate = options.rotate;

    textField.addToPage(this.currentPage, fieldOptions);
    this.fields.set(options.name, textField);

    // Update content flow
    if (options.autoPageBreak !== false) {
      this.updateCurrentY(options.height + this.theme.fieldSpacing!);
    }

    return textField;
  }

  public async addCheckBox(
    options: CheckBoxOptions & { autoPageBreak?: boolean }
  ): Promise<PDFCheckBox> {
    if (!this.form)
      throw new Error("PDF not initialized. Call initialize() first.");

    // Handle automatic page breaks
    if (options.autoPageBreak !== false && this.multiPageLayout.autoPageBreak) {
      if (this.handleContentOverflow(options.height)) {
        options.y = this.contentFlow.currentY - options.height;
      }
    }

    const checkBox = this.form.createCheckBox(options.name);

    if (options.checked) checkBox.check();

    const fieldOptions: any = {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };

    if (options.tailwind) {
      const styles = this.styleConverter.convertTailwindToStyles(
        options.tailwind.classes
      );

      if (styles.backgroundColor)
        fieldOptions.backgroundColor = styles.backgroundColor;
      if (styles.borderColor) fieldOptions.borderColor = styles.borderColor;
      if (styles.borderWidth) fieldOptions.borderWidth = styles.borderWidth;
    }

    // Apply base options
    if (options.font) fieldOptions.font = options.font;
    if (options.backgroundColor)
      fieldOptions.backgroundColor = options.backgroundColor;
    if (options.borderColor) fieldOptions.borderColor = options.borderColor;
    if (options.borderWidth) fieldOptions.borderWidth = options.borderWidth;
    if (options.rotate) fieldOptions.rotate = options.rotate;

    checkBox.addToPage(this.currentPage, fieldOptions);
    this.fields.set(options.name, checkBox);

    // Update content flow
    if (options.autoPageBreak !== false) {
      this.updateCurrentY(options.height + this.theme.fieldSpacing!);
    }

    return checkBox;
  }

  public async addRadioGroup(
    options: RadioGroupOptions & { autoPageBreak?: boolean }
  ): Promise<PDFRadioGroup> {
    if (!this.form)
      throw new Error("PDF not initialized. Call initialize() first.");

    // Calculate total height for all radio options
    const totalHeight =
      options.options.reduce(
        (max, opt) => Math.max(max, opt.y + opt.height),
        0
      ) - Math.min(...options.options.map((opt) => opt.y));

    // Handle automatic page breaks
    if (options.autoPageBreak !== false && this.multiPageLayout.autoPageBreak) {
      if (this.handleContentOverflow(totalHeight)) {
        // Adjust all option positions
        const deltaY =
          this.contentFlow.currentY -
          Math.max(...options.options.map((opt) => opt.y));
        options.options.forEach((opt) => (opt.y += deltaY));
      }
    }

    const radioGroup = this.form.createRadioGroup(options.name);

    for (const option of options.options) {
      const optionFieldOptions: any = {
        x: option.x,
        y: option.y,
        width: option.width,
        height: option.height,
      };

      if (options.tailwind) {
        const styles = this.styleConverter.convertTailwindToStyles(
          options.tailwind.classes
        );

        if (styles.backgroundColor)
          optionFieldOptions.backgroundColor = styles.backgroundColor;
        if (styles.borderColor)
          optionFieldOptions.borderColor = styles.borderColor;
        if (styles.borderWidth)
          optionFieldOptions.borderWidth = styles.borderWidth;
      }

      // Apply base options
      if (options.font) optionFieldOptions.font = options.font;
      if (options.backgroundColor)
        optionFieldOptions.backgroundColor = options.backgroundColor;
      if (options.borderColor)
        optionFieldOptions.borderColor = options.borderColor;
      if (options.borderWidth)
        optionFieldOptions.borderWidth = options.borderWidth;
      if (options.rotate) optionFieldOptions.rotate = options.rotate;

      radioGroup.addOptionToPage(
        option.value,
        this.currentPage,
        optionFieldOptions
      );
    }

    if (options.defaultValue) {
      radioGroup.select(options.defaultValue);
    }

    this.fields.set(options.name, radioGroup);

    // Update content flow
    if (options.autoPageBreak !== false) {
      this.updateCurrentY(totalHeight + this.theme.fieldSpacing!);
    }

    return radioGroup;
  }

  public async addDropdown(
    options: DropdownOptions & { autoPageBreak?: boolean }
  ): Promise<PDFDropdown> {
    if (!this.form)
      throw new Error("PDF not initialized. Call initialize() first.");

    // Handle automatic page breaks
    if (options.autoPageBreak !== false && this.multiPageLayout.autoPageBreak) {
      if (this.handleContentOverflow(options.height)) {
        options.y = this.contentFlow.currentY - options.height;
      }
    }

    const dropdown = this.form.createDropdown(options.name);

    // Add options
    if (Array.isArray(options.options) && options.options.length > 0) {
      if (typeof options.options[0] === "string") {
        dropdown.addOptions(options.options as string[]);
      } else {
        const optionValues = (
          options.options as { value: string; label: string }[]
        ).map((opt) => opt.value);
        dropdown.addOptions(optionValues);
      }
    }

    if (options.defaultValue) {
      dropdown.select(options.defaultValue);
    }

    if (options.multiselect) {
      dropdown.enableMultiselect();
    }

    if (options.editable) {
      dropdown.enableEditing();
    }

    if (options.sorted) {
      dropdown.enableSorting();
    }

    if (options.spellCheck) {
      dropdown.enableSpellChecking();
    }

    const fieldOptions: any = {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };

    if (options.tailwind) {
      const styles = this.styleConverter.convertTailwindToStyles(
        options.tailwind.classes
      );

      if (styles.backgroundColor)
        fieldOptions.backgroundColor = styles.backgroundColor;
      if (styles.borderColor) fieldOptions.borderColor = styles.borderColor;
      if (styles.textColor) fieldOptions.textColor = styles.textColor;
      if (styles.fontSize) fieldOptions.fontSize = styles.fontSize;
      if (styles.borderWidth) fieldOptions.borderWidth = styles.borderWidth;
    }

    // Apply base options
    if (options.font) fieldOptions.font = options.font;
    if (options.fontSize) fieldOptions.fontSize = options.fontSize;
    if (options.textColor) fieldOptions.textColor = options.textColor;
    if (options.backgroundColor)
      fieldOptions.backgroundColor = options.backgroundColor;
    if (options.borderColor) fieldOptions.borderColor = options.borderColor;
    if (options.borderWidth) fieldOptions.borderWidth = options.borderWidth;
    if (options.rotate) fieldOptions.rotate = options.rotate;

    dropdown.addToPage(this.currentPage, fieldOptions);
    this.fields.set(options.name, dropdown);

    // Update content flow
    if (options.autoPageBreak !== false) {
      this.updateCurrentY(options.height + this.theme.fieldSpacing!);
    }

    return dropdown;
  }

  public async addButton(
    options: ButtonOptions & { autoPageBreak?: boolean }
  ): Promise<PDFButton> {
    if (!this.form)
      throw new Error("PDF not initialized. Call initialize() first.");

    // Handle automatic page breaks
    if (options.autoPageBreak !== false && this.multiPageLayout.autoPageBreak) {
      if (this.handleContentOverflow(options.height)) {
        options.y = this.contentFlow.currentY - options.height;
      }
    }

    const button = this.form.createButton(options.name);

    const fieldOptions: any = {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };

    if (options.tailwind) {
      const styles = this.styleConverter.convertTailwindToStyles(
        options.tailwind.classes
      );

      if (styles.backgroundColor)
        fieldOptions.backgroundColor = styles.backgroundColor;
      if (styles.borderColor) fieldOptions.borderColor = styles.borderColor;
      if (styles.textColor) fieldOptions.textColor = styles.textColor;
      if (styles.fontSize) fieldOptions.fontSize = styles.fontSize;
      if (styles.borderWidth) fieldOptions.borderWidth = styles.borderWidth;
    }

    // Apply base options
    if (options.font) fieldOptions.font = options.font;
    if (options.fontSize) fieldOptions.fontSize = options.fontSize;
    if (options.textColor) fieldOptions.textColor = options.textColor;
    if (options.backgroundColor)
      fieldOptions.backgroundColor = options.backgroundColor;
    if (options.borderColor) fieldOptions.borderColor = options.borderColor;
    if (options.borderWidth) fieldOptions.borderWidth = options.borderWidth;
    if (options.rotate) fieldOptions.rotate = options.rotate;

    button.addToPage(options.label, this.currentPage, fieldOptions);
    this.fields.set(options.name, button);

    // Update content flow
    if (options.autoPageBreak !== false) {
      this.updateCurrentY(options.height + this.theme.fieldSpacing!);
    }

    return button;
  }

  public async addOptionList(
    options: ListBoxOptions & { autoPageBreak?: boolean }
  ): Promise<PDFOptionList> {
    if (!this.form)
      throw new Error("PDF not initialized. Call initialize() first.");

    // Handle automatic page breaks
    if (options.autoPageBreak !== false && this.multiPageLayout.autoPageBreak) {
      if (this.handleContentOverflow(options.height)) {
        options.y = this.contentFlow.currentY - options.height;
      }
    }

    const optionList = this.form.createOptionList(options.name);

    // Add options
    if (Array.isArray(options.options) && options.options.length > 0) {
      if (typeof options.options[0] === "string") {
        optionList.addOptions(options.options as string[]);
      } else {
        const optionValues = (
          options.options as { value: string; label: string }[]
        ).map((opt) => opt.value);
        optionList.addOptions(optionValues);
      }
    }

    if (options.defaultValues && options.defaultValues.length > 0) {
      if (options.multiselect) {
        optionList.select(options.defaultValues);
      } else {
        optionList.select(options.defaultValues[0]);
      }
    }

    if (options.multiselect) {
      optionList.enableMultiselect();
    }

    if (options.sorted) {
      optionList.enableSorting();
    }

    const fieldOptions: any = {
      x: options.x,
      y: options.y,
      width: options.width,
      height: options.height,
    };

    if (options.tailwind) {
      const styles = this.styleConverter.convertTailwindToStyles(
        options.tailwind.classes
      );

      if (styles.backgroundColor)
        fieldOptions.backgroundColor = styles.backgroundColor;
      if (styles.borderColor) fieldOptions.borderColor = styles.borderColor;
      if (styles.textColor) fieldOptions.textColor = styles.textColor;
      if (styles.fontSize) fieldOptions.fontSize = styles.fontSize;
      if (styles.borderWidth) fieldOptions.borderWidth = styles.borderWidth;
    }

    // Apply base options
    if (options.font) fieldOptions.font = options.font;
    if (options.fontSize) fieldOptions.fontSize = options.fontSize;
    if (options.textColor) fieldOptions.textColor = options.textColor;
    if (options.backgroundColor)
      fieldOptions.backgroundColor = options.backgroundColor;
    if (options.borderColor) fieldOptions.borderColor = options.borderColor;
    if (options.borderWidth) fieldOptions.borderWidth = options.borderWidth;
    if (options.rotate) fieldOptions.rotate = options.rotate;

    optionList.addToPage(this.currentPage, fieldOptions);
    this.fields.set(options.name, optionList);

    // Update content flow
    if (options.autoPageBreak !== false) {
      this.updateCurrentY(options.height + this.theme.fieldSpacing!);
    }

    return optionList;
  }

  public setFieldValidation(
    fieldName: string,
    validation: FieldValidation
  ): void {
    this.validationRules.set(fieldName, validation);
  }

  public setConditionalLogic(fieldName: string, logic: ConditionalLogic): void {
    this.conditionalLogic.set(fieldName, logic);
  }

  public getField(name: string): any {
    return this.fields.get(name);
  }

  public getAllFields(): Map<string, any> {
    return this.fields;
  }

  public flattenForm(): void {
    this.form.flatten();
  }

  public setTheme(theme: Partial<FormTheme>): void {
    this.theme = { ...this.theme, ...theme };
  }

  public async embedFont(fontBytes: ArrayBuffer): Promise<any> {
    return await this.pdfDoc.embedFont(fontBytes);
  }

  public async embedStandardFont(
    font: keyof typeof StandardFonts
  ): Promise<any> {
    return await this.pdfDoc.embedFont(StandardFonts[font]);
  }

  public async addImage(
    imageBytes: ArrayBuffer,
    type: "PNG" | "JPG"
  ): Promise<any> {
    if (type === "PNG") {
      return await this.pdfDoc.embedPng(imageBytes);
    } else {
      return await this.pdfDoc.embedJpg(imageBytes);
    }
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    options?: {
      size?: number;
      color?: any;
      font?: any;
      tailwind?: string;
      autoPageBreak?: boolean;
      lineHeight?: number;
    }
  ): void {
    if (!this.currentPage)
      throw new Error("No current page. Add a page first.");

    const lineHeight = options?.lineHeight || (options?.size || 12) * 1.2;

    // Handle multi-line text and page breaks
    const lines = text.split("\n");
    let currentY = y;

    for (const line of lines) {
      // Check for page break if enabled
      if (
        options?.autoPageBreak !== false &&
        this.multiPageLayout.autoPageBreak
      ) {
        if (this.handleContentOverflow(lineHeight)) {
          currentY = this.contentFlow.currentY;
        }
      }

      const textOptions: any = { x, y: currentY };

      if (options?.tailwind) {
        const styles = this.styleConverter.convertTailwindToStyles(
          options.tailwind
        );
        if (styles.fontSize) textOptions.size = styles.fontSize;
        if (styles.textColor) textOptions.color = styles.textColor;
      }

      if (options?.size) textOptions.size = options.size;
      if (options?.color) textOptions.color = options.color;
      if (options?.font) textOptions.font = options.font;

      this.currentPage.drawText(line, textOptions);
      currentY -= lineHeight;
    }

    // Update content flow
    if (options?.autoPageBreak !== false) {
      this.updateCurrentY(lines.length * lineHeight);
    }
  }

  public drawRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: {
      borderColor?: any;
      backgroundColor?: any;
      borderWidth?: number;
      tailwind?: string;
      autoPageBreak?: boolean;
    }
  ): void {
    if (!this.currentPage)
      throw new Error("No current page. Add a page first.");

    // Check for page break if enabled
    if (
      options?.autoPageBreak !== false &&
      this.multiPageLayout.autoPageBreak
    ) {
      if (this.handleContentOverflow(height)) {
        y = this.contentFlow.currentY - height;
      }
    }

    const rectOptions: any = { x, y, width, height };

    if (options?.tailwind) {
      const styles = this.styleConverter.convertTailwindToStyles(
        options.tailwind
      );
      if (styles.borderColor) rectOptions.borderColor = styles.borderColor;
      if (styles.backgroundColor) rectOptions.color = styles.backgroundColor;
      if (styles.borderWidth) rectOptions.borderWidth = styles.borderWidth;
    }

    if (options?.borderColor) rectOptions.borderColor = options.borderColor;
    if (options?.backgroundColor) rectOptions.color = options.backgroundColor;
    if (options?.borderWidth) rectOptions.borderWidth = options.borderWidth;

    this.currentPage.drawRectangle(rectOptions);

    // Update content flow
    if (options?.autoPageBreak !== false) {
      this.updateCurrentY(height);
    }
  }

  public getCurrentPage(): PDFPage {
    return this.currentPage;
  }

  public getDocument(): PDFDocument {
    return this.pdfDoc;
  }

  public async save(): Promise<Uint8Array> {
    // Final update of page numbers before saving
    this.finalizePageNumbers();
    return await this.pdfDoc.save();
  }

  private finalizePageNumbers(): void {
    if (!this.multiPageLayout.pageNumbering?.enabled) return;

    const totalPages = this.pages.length;

    // Update all page numbers with correct total
    this.pages.forEach((page, index) => {
      const pageNumber = index + 1;
      if (pageNumber >= (this.multiPageLayout.pageNumbering!.startPage || 1)) {
        // Remove old page number and add new one with correct total
        // Note: In a real implementation, you'd need to track and update existing text
        // For now, this is a placeholder for the concept
      }
    });
  }

  public async saveAsBuffer(): Promise<Buffer> {
    const pdfBytes = await this.save();
    return Buffer.from(pdfBytes);
  }

  // Additional utility methods for multi-page support
  public setMultiPageLayout(layout: Partial<MultiPageLayout>): void {
    this.multiPageLayout = { ...this.multiPageLayout, ...layout };
  }

  public getMultiPageLayout(): MultiPageLayout {
    return { ...this.multiPageLayout };
  }

  public addSection(section: FormSection, autoPageBreak: boolean = true): void {
    if (autoPageBreak && this.multiPageLayout?.autoPageBreak) {
      // Calculate section height and check for overflow
      const estimatedSectionHeight =
        section.fields.length *
          (this.theme.fontSize! + this.theme.fieldSpacing!) +
        50;
      this.handleContentOverflow(estimatedSectionHeight);
    }

    this.sections.push(section);
  }

  public navigateToPage(pageNumber: number): boolean {
    if (pageNumber >= 1 && pageNumber <= this.pages.length) {
      this.setCurrentPage(pageNumber - 1);
      return true;
    }
    return false;
  }

  public getPageMargins(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } {
    const margins = this.defaultPageOptions.margins!;
    return {
      top: margins.top || 50,
      bottom: margins.bottom || 50,
      left: margins.left || 50,
      right: margins.right || 50,
    };
  }

  public getContentArea(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const margins = this.defaultPageOptions.margins!;
    return {
      x: margins.left!,
      y: margins.bottom! + this.multiPageLayout.footerHeight!,
      width: this.defaultPageOptions.width! - margins.left! - margins.right!,
      height: this.multiPageLayout.contentHeight!,
    };
  }
}
