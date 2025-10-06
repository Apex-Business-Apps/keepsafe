// PDF Binder Export using pdf-lib
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function exportInsuranceBinder(items) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  // Group items by room
  const itemsByRoom = items.reduce((acc, item) => {
    const room = item.room || 'Uncategorized';
    if (!acc[room]) acc[room] = [];
    acc[room].push(item);
    return acc;
  }, {});

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 20;
  let currentY = pageHeight - margin;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Title
  page.drawText('Home Inventory - Insurance Binder', {
    x: margin,
    y: currentY,
    size: 18,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  currentY -= 30;

  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: currentY,
    size: 10,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  currentY -= 30;

  // Iterate through rooms
  Object.entries(itemsByRoom).forEach(([room, roomItems]) => {
    // Check if we need a new page
    if (currentY < margin + 100) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    }

    // Room header
    page.drawText(`Room: ${room}`, {
      x: margin,
      y: currentY,
      size: 14,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });
    currentY -= 25;

    // Table headers
    const headers = ['Item', 'Brand', 'Model', 'Serial', 'Value', 'Warranty'];
    const colWidths = [120, 80, 80, 80, 60, 60];
    let xPos = margin;

    headers.forEach((header, i) => {
      page.drawText(header, {
        x: xPos,
        y: currentY,
        size: 9,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      xPos += colWidths[i];
    });
    currentY -= lineHeight;

    // Draw line under headers
    page.drawLine({
      start: { x: margin, y: currentY + 5 },
      end: { x: pageWidth - margin, y: currentY + 5 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    currentY -= 5;

    // Item rows
    roomItems.forEach((item) => {
      if (currentY < margin + 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
        
        // Repeat headers on new page
        page.drawText(`Room: ${room} (continued)`, {
          x: margin,
          y: currentY,
          size: 14,
          font: timesRomanBold,
          color: rgb(0, 0, 0),
        });
        currentY -= 25;
      }

      xPos = margin;
      const rowData = [
        item.name || '',
        item.brand || '',
        item.model || '',
        item.serial || '',
        item.purchase_price ? `$${parseFloat(item.purchase_price).toFixed(2)}` : '',
        item.warranty_months ? `${item.warranty_months}mo` : '',
      ];

      rowData.forEach((text, i) => {
        const truncated = text.length > 15 ? text.substring(0, 12) + '...' : text;
        page.drawText(truncated, {
          x: xPos,
          y: currentY,
          size: 8,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        xPos += colWidths[i];
      });

      currentY -= lineHeight;
    });

    currentY -= 20; // Extra space between rooms
  });

  // Summary footer
  if (currentY < margin + 80) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    currentY = pageHeight - margin;
  }

  currentY -= 20;
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: pageWidth - margin, y: currentY },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  currentY -= 25;

  const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.purchase_price) || 0), 0);
  page.drawText(`Total Items: ${items.length}`, {
    x: margin,
    y: currentY,
    size: 12,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Total Value: $${totalValue.toFixed(2)}`, {
    x: pageWidth - margin - 150,
    y: currentY,
    size: 12,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  // Serialize and download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'keepsafe-binder.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
