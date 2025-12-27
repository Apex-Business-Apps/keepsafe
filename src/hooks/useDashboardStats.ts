import { useMemo } from "react";
import { addMonths, differenceInDays, isBefore, isAfter } from "date-fns";

interface Item {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  purchase_date?: string;
  warranty_months?: number;
  price?: number;
  serial_number?: string;
  barcode?: string;
  receipt_file_path?: string;
  notes?: string;
  recall_match?: boolean;
  recall_url?: string;
}

interface WarrantyItem extends Item {
  expirationDate: Date;
  daysRemaining: number;
  status: "expired" | "critical" | "warning" | "good" | "none";
}

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  activeRecalls: number;
  expiringWarranties: number;
  recallItems: Item[];
  warrantyItems: WarrantyItem[];
}

export function useDashboardStats(items: Item[]): DashboardStats {
  return useMemo(() => {
    const today = new Date();
    
    // Total items
    const totalItems = items.length;
    
    // Total value (sum of prices)
    const totalValue = items.reduce((sum, item) => {
      return sum + (item.price || 0);
    }, 0);
    
    // Active recalls
    const recallItems = items.filter((item) => item.recall_match === true);
    const activeRecalls = recallItems.length;
    
    // Process warranty items
    const warrantyItems: WarrantyItem[] = items
      .filter((item) => item.purchase_date && item.warranty_months)
      .map((item) => {
        const purchaseDate = new Date(item.purchase_date!);
        const expirationDate = addMonths(purchaseDate, item.warranty_months!);
        const daysRemaining = differenceInDays(expirationDate, today);
        
        let status: WarrantyItem["status"];
        if (isBefore(expirationDate, today)) {
          status = "expired";
        } else if (daysRemaining <= 7) {
          status = "critical";
        } else if (daysRemaining <= 30) {
          status = "warning";
        } else {
          status = "good";
        }
        
        return {
          ...item,
          expirationDate,
          daysRemaining,
          status,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
    
    // Count warranties expiring within 30 days (not already expired)
    const expiringWarranties = warrantyItems.filter(
      (item) => item.status === "critical" || item.status === "warning"
    ).length;
    
    return {
      totalItems,
      totalValue,
      activeRecalls,
      expiringWarranties,
      recallItems,
      warrantyItems,
    };
  }, [items]);
}
