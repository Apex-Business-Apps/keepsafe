import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "@/hooks/use-toast";

export interface Item {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  category?: string;
  purchase_date?: string;
  warranty_months?: number;
  price?: number;
  serial_number?: string;
  barcode?: string;
  receipt_photo_url?: string;
  notes?: string;
  recall_match?: boolean;
  recall_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const useItems = (userId: string | undefined) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Optimized query: select only needed fields, use index
      const { data, error } = await supabase
        .from("items")
        .select("id, user_id, name, brand, category, purchase_date, warranty_months, price, serial_number, barcode, receipt_photo_url, notes, recall_match, recall_url, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching items:", error);
        toast({
          title: "Error fetching items",
          description: error.message,
          variant: "destructive",
        });
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<Item, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("items")
        .insert([{ ...item, user_id: userId }])
        .select()
        .single();

      if (error) {
        console.error("Error adding item:", error);
        toast({
          title: "Error adding item",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({ title: "Item added successfully" });
      await trackEvent('item_added', { name: item.name, category: item.category || 'uncategorized' }, userId);
      await fetchItems();
      return data;
    } catch (err) {
      console.error("Unexpected error adding item:", err);
      toast({
        title: "Error adding item",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    try {
      const { error } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating item:", error);
        toast({
          title: "Error updating item",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({ title: "Item updated successfully" });
      await fetchItems();
      return true;
    } catch (err) {
      console.error("Unexpected error updating item:", err);
      toast({
        title: "Error updating item",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting item:", error);
        toast({
          title: "Error deleting item",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({ title: "Item deleted successfully" });
      await fetchItems();
      return true;
    } catch (err) {
      console.error("Unexpected error deleting item:", err);
      toast({
        title: "Error deleting item",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return { items, loading, addItem, updateItem, deleteItem, refetch: fetchItems };
};
