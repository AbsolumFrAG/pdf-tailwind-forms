import { FormField, GenerateConfig } from "../pdf-generator";

/**
 * Data structure for invoice template generation
 */
export interface InvoiceData {
  /** Invoice number or identifier */
  invoiceNumber?: string;
  /** Invoice issue date */
  date?: string;
  /** Payment due date */
  dueDate?: string;
  /** Company name (required) */
  companyName: string;
  /** Company address */
  companyAddress?: string;
  /** Client name (required) */
  clientName: string;
  /** Client billing address */
  clientAddress?: string;
  /** Array of invoice line items */
  items: Array<{
    /** Item or service description */
    description: string;
    /** Quantity ordered */
    quantity: number;
    /** Unit price */
    price: number;
  }>;
  /** Tax percentage (e.g., 20 for 20%) */
  tax?: number;
  /** Currency symbol or code */
  currency?: string;
}

/**
 * Creates a professional invoice template with automatic calculations
 * 
 * Generates a styled invoice PDF with:
 * - Company and client information sections
 * - Itemized billing table with automatic totals
 * - Tax calculations
 * - Interactive form fields for editing
 * - Professional styling with TailwindCSS
 * 
 * @param data Invoice data including company, client, and line items
 * @returns GenerateConfig ready for PDF generation
 * 
 * @example
 * ```typescript
 * const invoiceConfig = createInvoiceTemplate({
 *   companyName: 'Acme Corp',
 *   companyAddress: '123 Business St, City, State 12345',
 *   clientName: 'Client Company',
 *   clientAddress: '456 Client Ave, City, State 67890',
 *   invoiceNumber: 'INV-2024-001',
 *   date: '2024-01-15',
 *   dueDate: '2024-02-15',
 *   items: [
 *     { description: 'Consulting Services', quantity: 10, price: 150.00 },
 *     { description: 'Software License', quantity: 1, price: 299.99 }
 *   ],
 *   tax: 8.5,
 *   currency: '$'
 * });
 * 
 * const generator = new PDFGenerator();
 * const result = await generator.generate(invoiceConfig);
 * ```
 */
export function createInvoiceTemplate(data: InvoiceData): GenerateConfig {
  const currency = data.currency || "€";
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const taxAmount = data.tax ? subtotal * (data.tax / 100) : 0;
  const total = subtotal + taxAmount;

  const itemsHTML = data.items
    .map(
      (item, index) => `
    <tr class="border-b">
      <td class="py-3 field-desc-${index}">${item.description}</td>
      <td class="py-3 text-center field-qty-${index}">${item.quantity}</td>
      <td class="py-3 text-right field-price-${index}">${item.price.toFixed(
        2
      )} ${currency}</td>
      <td class="py-3 text-right font-medium">${(
        item.quantity * item.price
      ).toFixed(2)} ${currency}</td>
    </tr>
  `
    )
    .join("");

  const fields: FormField[] = [
    {
      name: "invoiceNumber",
      type: "text",
      selector: ".field-invoice-number",
      defaultValue: data.invoiceNumber,
      fontSize: 14,
      borderWidth: 0,
    },
    {
      name: "clientName",
      type: "text",
      selector: ".field-client-name",
      defaultValue: data.clientName,
      required: true,
      fontSize: 12,
      borderWidth: 0,
    },
    {
      name: "clientAddress",
      type: "text",
      selector: ".field-client-address",
      defaultValue: data.clientAddress,
      multiline: true,
      fontSize: 11,
      borderWidth: 0,
      height: 60,
    },
    {
      name: "paymentMethod",
      type: "dropdown",
      selector: ".field-payment-method",
      options: ["Bank Transfer", "Credit Card", "PayPal", "Cash"],
      defaultValue: "Bank Transfer",
      fontSize: 11,
      borderWidth: 1,
    },
    {
      name: "signature",
      type: "signature",
      selector: ".field-signature",
      height: 60,
      borderWidth: 1,
    },
    {
      name: "isPaid",
      type: "checkbox",
      selector: ".field-paid",
      defaultValue: false,
      size: 16,
    },
  ];

  return {
    content: `
      <div class="min-h-screen bg-white p-8">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="flex justify-between items-start mb-12">
            <div>
              <h1 class="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
              <p class="text-gray-600">Invoice #<span class="field-invoice-number font-medium">${
                data.invoiceNumber || ""
              }</span></p>
            </div>
            <div class="text-right">
              <h2 class="text-2xl font-bold text-gray-800">${
                data.companyName
              }</h2>
              <p class="text-gray-600 mt-1">${data.companyAddress || ""}</p>
            </div>
          </div>

          <!-- Client Info -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold text-gray-700 mb-3">Bill To:</h3>
              <div class="field-client-name font-medium text-gray-800 mb-2"></div>
              <div class="field-client-address text-gray-600"></div>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <div class="space-y-2">
                <p class="text-gray-600">Date: <span class="font-medium">${
                  data.date || new Date().toLocaleDateString()
                }</span></p>
                <p class="text-gray-600">Due Date: <span class="font-medium">${
                  data.dueDate || ""
                }</span></p>
                <div class="text-gray-600">Payment: <span class="field-payment-method"></span></div>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="w-full mb-8">
            <thead class="bg-gray-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left">Description</th>
                <th class="py-3 px-4 text-center">Quantity</th>
                <th class="py-3 px-4 text-right">Unit Price</th>
                <th class="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="flex justify-end mb-12">
            <div class="w-80">
              <div class="flex justify-between py-2">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">${subtotal.toFixed(
                  2
                )} ${currency}</span>
              </div>
              ${
                data.tax
                  ? `
                <div class="flex justify-between py-2">
                  <span class="text-gray-600">Tax (${data.tax}%):</span>
                  <span class="font-medium">${taxAmount.toFixed(
                    2
                  )} ${currency}</span>
                </div>
              `
                  : ""
              }
              <div class="flex justify-between py-3 border-t-2 border-gray-300">
                <span class="text-xl font-bold">Total:</span>
                <span class="text-xl font-bold text-green-600">${total.toFixed(
                  2
                )} ${currency}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-between items-end">
            <div>
              <p class="text-sm text-gray-600 mb-2">Authorized Signature:</p>
              <div class="field-signature w-64 h-20 border-2 border-gray-300"></div>
            </div>
            <div class="field-paid flex items-center">
              <div class="w-6 h-6 border-2 border-gray-400 rounded mr-3"></div>
              <span class="text-lg font-medium text-gray-700">Paid</span>
            </div>
          </div>
        </div>
      </div>
    `,
    fields,
    pdfOptions: {
      format: "A4",
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    },
    metadata: {
      title: `Invoice ${data.invoiceNumber || ""}`,
      author: data.companyName,
      subject: "Invoice",
      creator: "TailwindPDF Forms Library",
    },
  };
}
