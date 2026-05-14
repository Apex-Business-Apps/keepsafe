import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { Item } from "@/hooks/useItems";
import { addMonths, differenceInDays, format, isAfter } from "date-fns";

function drawLine(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size = 10) {
  page.drawText(text.slice(0, 110), { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
}

function proofWarnings(item: Item): string[] {
  const warnings = [];
  if (!item.receipt_file_path && !item.receipt_photo_url) warnings.push("missing receipt");
  if (!item.serial_number) warnings.push("missing serial");
  if (!item.purchase_date) warnings.push("missing purchase date");
  if (!item.warranty_months) warnings.push("missing warranty");
  return warnings;
}

export const generatePDF = async (items: Item[]) => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [612, 792];
  let page = pdfDoc.addPage(pageSize);
  const { height } = page.getSize();
  let y = height - 50;
  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const recallItems = items.filter((item) => item.recall_match);
  const incompleteProofItems = items.filter((item) => proofWarnings(item).length > 0);
  const upcomingWarranties = items
    .filter((item) => item.purchase_date && item.warranty_months)
    .map((item) => ({ item, expires: addMonths(new Date(item.purchase_date!), item.warranty_months!) }))
    .filter(({ expires }) => isAfter(expires, new Date()) && differenceInDays(expires, new Date()) <= 90)
    .sort((a, b) => a.expires.getTime() - b.expires.getTime());

  page.drawText("KeepSafe Insurance Binder", { x: 50, y, size: 22, font: boldFont, color: rgb(0, 0, 0) });
  y -= 28;
  drawLine(page, `Generated: ${format(new Date(), "MMMM dd, yyyy")}`, 50, y, font);
  y -= 28;
  page.drawText("Summary", { x: 50, y, size: 16, font: boldFont, color: rgb(0, 0, 0) });
  y -= 20;
  [
    `Items: ${items.length}`,
    `Total documented value: $${totalValue.toFixed(2)}`,
    `Recall alerts: ${recallItems.length}`,
    `Items with missing proof fields: ${incompleteProofItems.length}`,
    `Warranty reminders in next 90 days: ${upcomingWarranties.length}`,
  ].forEach((line) => { drawLine(page, line, 60, y, font); y -= 15; });

  if (upcomingWarranties.length > 0) {
    y -= 10;
    page.drawText("Warranty Reminders", { x: 50, y, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    y -= 18;
    upcomingWarranties.slice(0, 20).forEach(({ item, expires }) => {
      drawLine(page, `${item.name} expires ${format(expires, "MMM dd, yyyy")}`, 60, y, font);
      y -= 14;
    });
  }

  page = pdfDoc.addPage(pageSize);
  y = height - 50;
  page.drawText("Inventory Details", { x: 50, y, size: 18, font: boldFont, color: rgb(0, 0, 0) });
  y -= 30;

  for (const item of items) {
    if (y < 120) {
      page = pdfDoc.addPage(pageSize);
      y = height - 50;
    }
    page.drawText(item.name, { x: 50, y, size: 14, font: boldFont, color: rgb(0, 0, 0) });
    y -= 18;
    const details = [];
    if (item.brand) details.push(`Brand: ${item.brand}`);
    if (item.category) details.push(`Category: ${item.category}`);
    if (item.purchase_date) details.push(`Purchased: ${format(new Date(item.purchase_date), "MMM dd, yyyy")}`);
    if (item.warranty_months) details.push(`Warranty: ${item.warranty_months} months`);
    if (item.price) details.push(`Price: $${item.price.toFixed(2)}`);
    if (item.serial_number) details.push(`Serial: ${item.serial_number}`);
    if (item.barcode) details.push(`Barcode: ${item.barcode}`);
    details.forEach((detail) => { drawLine(page, detail, 60, y, font); y -= 14; });

    const warnings = proofWarnings(item);
    if (warnings.length > 0) {
      drawLine(page, `Proof warning: ${warnings.join(', ')}`, 60, y, boldFont, 9);
      y -= 14;
    }
    if (item.recall_match) {
      drawLine(page, `RECALL ALERT: ${item.recall_match_reason || item.recall_url || 'review official notice'}`, 60, y, boldFont, 9);
      y -= 14;
    }
    if (item.notes) { drawLine(page, `Notes: ${item.notes}`, 60, y, font, 9); y -= 14; }
    y -= 10;
  }

  if (recallItems.length > 0 || incompleteProofItems.length > 0) {
    page = pdfDoc.addPage(pageSize);
    y = height - 50;
    page.drawText("Recall Appendix & Missing-Proof Warnings", { x: 50, y, size: 18, font: boldFont, color: rgb(0, 0, 0) });
    y -= 28;
    recallItems.forEach((item) => {
      if (y < 80) { page = pdfDoc.addPage(pageSize); y = height - 50; }
      drawLine(page, `${item.name}: ${item.recall_match_reason || item.recall_url || 'Review official recall notice'}`, 60, y, font, 9);
      y -= 14;
    });
    y -= 10;
    incompleteProofItems.forEach((item) => {
      if (y < 80) { page = pdfDoc.addPage(pageSize); y = height - 50; }
      drawLine(page, `${item.name}: ${proofWarnings(item).join(', ')}`, 60, y, font, 9);
      y -= 14;
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `keepsafe-inventory-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
