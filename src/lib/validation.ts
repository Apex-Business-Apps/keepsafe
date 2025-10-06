// Centralized validation schemas for production-grade input validation
import { z } from "zod";

// Auth validation
export const authSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
});

// Item validation
export const itemSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(255, { message: "Name must be less than 255 characters" }),
  brand: z.string()
    .trim()
    .max(100, { message: "Brand must be less than 100 characters" })
    .optional()
    .or(z.literal("")),
  category: z.string()
    .trim()
    .max(100, { message: "Category must be less than 100 characters" })
    .optional()
    .or(z.literal("")),
  purchase_date: z.string()
    .optional()
    .or(z.literal("")),
  warranty_months: z.number()
    .int()
    .min(0)
    .max(600)
    .optional(),
  price: z.number()
    .min(0)
    .max(999999999.99)
    .optional(),
  serial_number: z.string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal("")),
  barcode: z.string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal("")),
  notes: z.string()
    .trim()
    .max(5000, { message: "Notes must be less than 5000 characters" })
    .optional()
    .or(z.literal("")),
  receipt_file_path: z.string()
    .max(500)
    .optional()
    .or(z.literal("")),
});

export type ItemInput = z.infer<typeof itemSchema>;
export type AuthInput = z.infer<typeof authSchema>;
