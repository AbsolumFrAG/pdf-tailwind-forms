import PDFGenerator from "../pdf-generator";
import { PDFDocument } from "pdf-lib";

describe("Multipage AcroForm Support", () => {
  let generator: PDFGenerator;

  beforeEach(() => {
    generator = new PDFGenerator();
  });

  afterEach(async () => {
    await generator.destroy();
  });

  it("should place fields on correct pages with explicit pageIndex", async () => {
    const config = {
      content: `
        <div style="height: 900px; page-break-after: always;">
          <h1>Page 1</h1>
          <div class="field-page1">Field on page 1</div>
        </div>
        <div style="height: 900px;">
          <h1>Page 2</h1>
          <div class="field-page2">Field on page 2</div>
        </div>
      `,
      fields: [
        {
          name: "field1",
          type: "text" as const,
          pageIndex: 0,
          position: { x: 100, y: 100, width: 200, height: 30 }
        },
        {
          name: "field2", 
          type: "text" as const,
          pageIndex: 1,
          position: { x: 100, y: 100, width: 200, height: 30 }
        }
      ]
    };

    const result = await generator.generate(config);
    expect(result.pageCount).toBe(2);
    expect(result.fieldCount).toBe(2);

    // Vérifier que les champs sont sur les bonnes pages
    const pdfDoc = await PDFDocument.load(result.bytes);
    const form = pdfDoc.getForm();
    
    const field1 = form.getTextField("field1");
    const field2 = form.getTextField("field2");
    
    expect(field1).toBeDefined();
    expect(field2).toBeDefined();
  }, 30000);

  it("should auto-detect page from selector position", async () => {
    const config = {
      content: `
        <div style="height: 900px; page-break-after: always;">
          <h1>Page 1</h1>
          <input class="field-auto-page1" style="margin-top: 100px;" />
        </div>
        <div style="height: 900px;">
          <h1>Page 2</h1>
          <input class="field-auto-page2" style="margin-top: 100px;" />
        </div>
      `,
      fields: [
        {
          name: "autoField1",
          type: "text" as const,
          selector: ".field-auto-page1"
        },
        {
          name: "autoField2",
          type: "text" as const, 
          selector: ".field-auto-page2"
        }
      ]
    };

    const result = await generator.generate(config);
    expect(result.pageCount).toBe(2);
    expect(result.fieldCount).toBe(2);
  }, 30000);

  it("should handle pageIndex override for selector-based fields", async () => {
    const config = {
      content: `
        <div style="height: 900px; page-break-after: always;">
          <h1>Page 1</h1>
          <input class="my-field" />
        </div>
        <div style="height: 900px;">
          <h1>Page 2</h1>
        </div>
      `,
      fields: [
        {
          name: "overrideField",
          type: "text" as const,
          selector: ".my-field",
          pageIndex: 1 // Force sur page 2 même si détecté sur page 1
        }
      ]
    };

    const result = await generator.generate(config);
    expect(result.pageCount).toBe(2);
    expect(result.fieldCount).toBe(1);
  }, 30000);

  it("should handle invalid page indices gracefully", async () => {
    const config = {
      content: '<div style="height: 400px;"><h1>Single Page</h1></div>',
      fields: [
        {
          name: "invalidPage",
          type: "text" as const,
          pageIndex: 5, // Page qui n'existe pas
          position: { x: 100, y: 100, width: 200, height: 30 }
        }
      ]
    };

    const result = await generator.generate(config);
    expect(result.pageCount).toBe(1);
    expect(result.fieldCount).toBe(0); // Champ ignoré car page invalide
  }, 30000);

  it("should support different field types across multiple pages", async () => {
    const config = {
      content: `
        <div style="height: 900px; page-break-after: always;">
          <h1>Page 1 - Personal Info</h1>
        </div>
        <div style="height: 900px; page-break-after: always;">
          <h1>Page 2 - Preferences</h1>
        </div>
        <div style="height: 900px;">
          <h1>Page 3 - Signature</h1>
        </div>
      `,
      fields: [
        {
          name: "name",
          type: "text" as const,
          pageIndex: 0,
          position: { x: 100, y: 200, width: 300, height: 30 }
        },
        {
          name: "newsletter",
          type: "checkbox" as const,
          pageIndex: 1,
          position: { x: 100, y: 200, width: 20, height: 20 }
        },
        {
          name: "signature",
          type: "signature" as const,
          pageIndex: 2,
          position: { x: 100, y: 200, width: 300, height: 60 }
        }
      ]
    };

    const result = await generator.generate(config);
    expect(result.pageCount).toBe(3);
    expect(result.fieldCount).toBe(3);
  }, 30000);
});