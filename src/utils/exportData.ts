import { Item } from "@/hooks/useItems";

export const exportToCSV = (items: Item[], filename = "inventory-export.csv"): void => {
  const headers = [
    "Name",
    "Brand",
    "Category",
    "Purchase Date",
    "Warranty (months)",
    "Price",
    "Serial Number",
    "Barcode",
    "Notes",
    "Recall Match",
    "Created At"
  ];

  const csvContent = [
    headers.join(","),
    ...items.map(item => [
      escapeCSV(item.name),
      escapeCSV(item.brand || ""),
      escapeCSV(item.category || ""),
      item.purchase_date || "",
      item.warranty_months?.toString() || "",
      item.price?.toFixed(2) || "",
      escapeCSV(item.serial_number || ""),
      escapeCSV(item.barcode || ""),
      escapeCSV(item.notes || ""),
      item.recall_match ? "Yes" : "No",
      item.created_at || ""
    ].join(","))
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
};

export const exportToJSON = (items: Item[], filename = "inventory-export.json"): void => {
  const exportData = items.map(item => ({
    name: item.name,
    brand: item.brand || null,
    category: item.category || null,
    purchase_date: item.purchase_date || null,
    warranty_months: item.warranty_months || null,
    price: item.price || null,
    serial_number: item.serial_number || null,
    barcode: item.barcode || null,
    notes: item.notes || null,
    recall_match: item.recall_match || false,
    recall_url: item.recall_url || null,
    created_at: item.created_at || null
  }));

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, filename, "application/json");
};

const escapeCSV = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
