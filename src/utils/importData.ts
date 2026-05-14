import { Item } from "@/hooks/useItems";

export type ImportItem = Omit<Item, "id" | "user_id" | "created_at" | "updated_at">;

export interface ImportResult {
  items: ImportItem[];
  errors: string[];
}

const FIELD_MAP: Record<string, keyof ImportItem> = {
  name: "name",
  brand: "brand",
  category: "category",
  "purchase date": "purchase_date",
  purchase_date: "purchase_date",
  "warranty (months)": "warranty_months",
  warranty_months: "warranty_months",
  warranty: "warranty_months",
  price: "price",
  "serial number": "serial_number",
  serial_number: "serial_number",
  serial: "serial_number",
  barcode: "barcode",
  upc: "barcode",
  notes: "notes",
};

export const parseCSV = (text: string): ImportResult => {
  const errors: string[] = [];
  const items: ImportItem[] = [];

  const rows = parseCSVRows(text);
  if (rows.length < 2) {
    return { items, errors: ["CSV must have a header row and at least one data row"] };
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every((c) => !c.trim())) continue;
    const item: Partial<ImportItem> = {};
    headers.forEach((h, idx) => {
      const key = FIELD_MAP[h];
      const raw = (row[idx] ?? "").trim();
      if (!key || !raw) return;
      if (key === "warranty_months") {
        const n = parseInt(raw, 10);
        if (!isNaN(n)) item.warranty_months = n;
      } else if (key === "price") {
        const n = parseFloat(raw.replace(/[^0-9.\-]/g, ""));
        if (!isNaN(n)) item.price = n;
      } else {
        (item as Record<string, unknown>)[key] = raw;
      }
    });

    if (!item.name) {
      errors.push(`Row ${i + 1}: missing required "name"`);
      continue;
    }
    items.push(item as ImportItem);
  }

  return { items, errors };
};

export const parseJSON = (text: string): ImportResult => {
  const errors: string[] = [];
  const items: ImportItem[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { items, errors: ["Invalid JSON file"] };
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  arr.forEach((entry, idx) => {
    if (!entry || typeof entry !== "object") {
      errors.push(`Entry ${idx + 1}: not an object`);
      return;
    }
    const e = entry as Record<string, unknown>;
    if (!e.name || typeof e.name !== "string") {
      errors.push(`Entry ${idx + 1}: missing required "name"`);
      return;
    }
    const item: ImportItem = { name: e.name.trim() };
    const strFields: (keyof ImportItem)[] = [
      "brand", "category", "purchase_date", "serial_number", "barcode", "notes",
    ];
    strFields.forEach((f) => {
      if (typeof e[f] === "string" && (e[f] as string).trim()) {
        (item as Record<string, unknown>)[f] = (e[f] as string).trim();
      }
    });
    if (typeof e.warranty_months === "number") item.warranty_months = e.warranty_months;
    if (typeof e.price === "number") item.price = e.price;
    items.push(item);
  });

  return { items, errors };
};

// Minimal RFC-4180-ish CSV parser supporting quoted fields & commas/newlines inside quotes
const parseCSVRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};
