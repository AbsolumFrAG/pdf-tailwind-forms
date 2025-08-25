import { PDFFont, Color, Rotation } from 'pdf-lib';

export interface TailwindStyles {
  classes: string;
  customCSS?: string;
}

export interface BaseFieldOptions {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font?: PDFFont;
  fontSize?: number;
  textColor?: Color;
  backgroundColor?: Color;
  borderColor?: Color;
  borderWidth?: number;
  rotate?: Rotation;
  tailwind?: TailwindStyles;
}

export interface TextFieldOptions extends BaseFieldOptions {
  multiline?: boolean;
  maxLength?: number;
  combed?: boolean;
  password?: boolean;
  fileSelect?: boolean;
  spellCheck?: boolean;
  scrollable?: boolean;
  alignment?: 'Left' | 'Center' | 'Right';
  defaultValue?: string;
  placeholder?: string;
}

export interface CheckBoxOptions extends BaseFieldOptions {
  checked?: boolean;
  checkType?: 'check' | 'cross' | 'circle' | 'star' | 'square' | 'diamond';
}

export interface RadioGroupOptions extends Omit<BaseFieldOptions, 'x' | 'y' | 'width' | 'height'> {
  options: RadioOption[];
  defaultValue?: string;
}

export interface RadioOption {
  value: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DropdownOptions extends BaseFieldOptions {
  options: string[] | { value: string; label: string }[];
  defaultValue?: string;
  multiselect?: boolean;
  editable?: boolean;
  sorted?: boolean;
  spellCheck?: boolean;
}

export interface ListBoxOptions extends BaseFieldOptions {
  options: string[] | { value: string; label: string }[];
  defaultValues?: string[];
  multiselect?: boolean;
  sorted?: boolean;
}

export interface ButtonOptions extends BaseFieldOptions {
  label: string;
  action?: ButtonAction;
  image?: Uint8Array | ArrayBuffer;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom' | 'overlay';
}

export interface ButtonAction {
  type: 'JavaScript' | 'GoTo' | 'URI' | 'SubmitForm' | 'ResetForm';
  payload?: any;
}

export interface SignatureFieldOptions extends BaseFieldOptions {
  required?: boolean;
  readOnly?: boolean;
}

export interface DateFieldOptions extends TextFieldOptions {
  format?: string;
  minDate?: Date;
  maxDate?: Date;
}

export interface NumberFieldOptions extends TextFieldOptions {
  min?: number;
  max?: number;
  decimals?: number;
  thousandsSeparator?: boolean;
  currencySymbol?: string;
}

export interface ComboBoxOptions extends BaseFieldOptions {
  options: string[] | { value: string; label: string }[];
  editable?: boolean;
  defaultValue?: string;
  spellCheck?: boolean;
}

export interface ImageFieldOptions extends BaseFieldOptions {
  image?: Uint8Array | ArrayBuffer;
  aspectRatio?: 'preserve' | 'stretch' | 'fit' | 'fill';
  border?: boolean;
}

export interface BarcodeFieldOptions extends BaseFieldOptions {
  type: 'QR' | 'Code128' | 'Code39' | 'EAN13' | 'EAN8' | 'UPC';
  value: string;
  showText?: boolean;
}

export interface TableFieldOptions {
  x: number;
  y: number;
  rows: number;
  columns: number;
  cellWidth: number;
  cellHeight: number;
  headers?: string[];
  data?: string[][];
  borderColor?: Color;
  borderWidth?: number;
  headerBackgroundColor?: Color;
  headerTextColor?: Color;
  alternateRowColors?: boolean;
  tailwind?: TailwindStyles;
}

export interface PageOptions {
  width?: number;
  height?: number;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  orientation?: 'portrait' | 'landscape';
}

export interface MultiPageLayout {
  autoPageBreak?: boolean;
  pageBreakMargin?: number;
  headerHeight?: number;
  footerHeight?: number;
  contentHeight?: number;
  pageNumbering?: {
    enabled?: boolean;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    format?: string; // e.g., "Page {current} of {total}"
    startPage?: number;
    fontSize?: number;
    color?: Color;
    font?: PDFFont;
  };
  header?: {
    enabled?: boolean;
    content?: string | ((pageNumber: number, totalPages: number) => string);
    fontSize?: number;
    color?: Color;
    font?: PDFFont;
    alignment?: 'left' | 'center' | 'right';
  };
  footer?: {
    enabled?: boolean;
    content?: string | ((pageNumber: number, totalPages: number) => string);
    fontSize?: number;
    color?: Color;
    font?: PDFFont;
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface PageBreakOptions {
  type?: 'auto' | 'manual';
  beforeElement?: boolean;
  afterElement?: boolean;
  keepWithNext?: boolean;
  orphanControl?: number; // minimum lines at bottom of page
  widowControl?: number;  // minimum lines at top of page
}

export interface ContentFlow {
  currentY: number;
  remainingHeight: number;
  pageNumber: number;
  totalPages: number;
  isOverflowing: boolean;
}

export interface PDFGeneratorConfig {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  language?: string;
  pageLayout?: 'SinglePage' | 'OneColumn' | 'TwoColumnLeft' | 'TwoColumnRight' | 'TwoPageLeft' | 'TwoPageRight';
  pageMode?: 'UseNone' | 'UseOutlines' | 'UseThumbs' | 'FullScreen' | 'UseOC' | 'UseAttachments';
  defaultPageOptions?: PageOptions;
  multiPageLayout?: MultiPageLayout;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  customValidator?: (value: any) => boolean;
}

export interface FieldValidation {
  rules: ValidationRule[];
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export interface AccessibilityOptions {
  tabIndex?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaRequired?: boolean;
  ariaInvalid?: boolean;
  screenReaderText?: string;
}

export interface ConditionalLogic {
  showIf?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  }[];
  hideIf?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  }[];
  enableIf?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
    value: any;
  }[];
}

export interface FormSection {
  title?: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  collapsed?: boolean;
  tailwind?: TailwindStyles;
}

export interface FormTheme {
  primaryColor?: Color;
  secondaryColor?: Color;
  fontFamily?: string;
  fontSize?: number;
  borderRadius?: number;
  fieldSpacing?: number;
  labelPosition?: 'top' | 'left' | 'right' | 'inline';
  errorColor?: Color;
  successColor?: Color;
  warningColor?: Color;
}