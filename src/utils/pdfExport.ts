import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Item } from "@/hooks/useItems";
import { format } from "date-fns";

export const generatePDF = async (items: Item[]) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  let y = height - 50;

  // Title
  page.drawText("KeepSafe - Household Inventory", {
    x: 50,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  y -= 30;
  page.drawText(`Generated: ${format(new Date(), "MMMM dd, yyyy")}`, {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  y -= 30;

  for (const item of items) {
    // Check if we need a new page
    if (y < 100) {
      page = pdfDoc.addPage([612, 792]);
      y = height - 50;
    }

    // Item name
    page.drawText(item.name, {
      x: 50,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // Item details
    const details = [];
    if (item.brand) details.push(`Brand: ${item.brand}`);
    if (item.category) details.push(`Category: ${item.category}`);
    if (item.purchase_date)
      details.push(`Purchased: ${format(new Date(item.purchase_date), "MMM dd, yyyy")}`);
    if (item.warranty_months) details.push(`Warranty: ${item.warranty_months} months`);
    if (item.price) details.push(`Price: $${item.price.toFixed(2)}`);
    if (item.serial_number) details.push(`Serial: ${item.serial_number}`);
    if (item.barcode) details.push(`Barcode: ${item.barcode}`);

    for (const detail of details) {
      page.drawText(detail, {
        x: 60,
        y,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 15;
    }

    if (item.recall_match) {
      page.drawText("⚠️ RECALL ALERT", {
        x: 60,
        y,
        size: 10,
        font: boldFont,
        color: rgb(0.8, 0, 0),
      });
      y -= 15;
      if (item.recall_url) {
        page.drawText(item.recall_url, {
          x: 60,
          y,
          size: 8,
          font,
          color: rgb(0, 0, 0.8),
        });
        y -= 15;
      }
    }

    if (item.notes) {
      page.drawText(`Notes: ${item.notes}`, {
        x: 60,
        y,
        size: 9,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 15;
    }

    y -= 10; // Space between items
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `keepsafe-inventory-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
