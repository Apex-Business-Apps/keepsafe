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
  receipt_photo_url?: string; // Deprecated: kept for backwards compatibility
  receipt_file_path?: string; // New: stores file path for dynamic signed URLs
  notes?: string;
  recall_match?: boolean;
  recall_url?: string;
  recall_match_score?: number;
  recall_match_reason?: string;
  recall_source_system?: string;
  recall_published_date?: string;
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
        .select("id, user_id, name, brand, category, purchase_date, warranty_months, price, serial_number, barcode, receipt_photo_url, receipt_file_path, notes, recall_match, recall_url, created_at, updated_at")
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
        const rows = data || [];
        const recalledIds = rows.filter((item) => item.recall_match).map((item) => item.id);
        if (recalledIds.length === 0) {
          setItems(rows);
        } else {
          const { data: matches, error: matchesError } = await supabase
            .from("item_recall_matches")
            .select("item_id, match_score, match_reason, source_system, published_date")
            .in("item_id", recalledIds)
            .order("match_score", { ascending: false });

          if (matchesError) {
            console.warn("Recall evidence unavailable:", matchesError.message);
            setItems(rows);
          } else {
            const bestMatchByItem = new Map((matches || []).map((match) => [match.item_id, match]));
            setItems(rows.map((item) => {
              const match = bestMatchByItem.get(item.id);
              return match ? {
                ...item,
                recall_match_score: match.match_score,
                recall_match_reason: match.match_reason,
                recall_source_system: match.source_system || undefined,
                recall_published_date: match.published_date || undefined,
              } : item;
            }));
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

      setItems((current) => [data, ...current]);
      toast({ title: "Item added successfully" });
      await trackEvent('item_added', { name: item.name, category: item.category || 'uncategorized' }, userId);
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

      setItems((current) => current.map((item) => item.id === id ? { ...item, ...updates } : item));
      toast({ title: "Item updated successfully" });
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

      const deleted = items.find((item) => item.id === id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast({
        title: "Item deleted",
        description: deleted ? `${deleted.name} was removed.` : "Item was removed.",
      });
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
