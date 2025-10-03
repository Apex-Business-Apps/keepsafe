import { useState, useEffect } from "react";
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

  const fetchItems = async () => {
    if (!userId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching items",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const addItem = async (item: Omit<Item, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("items")
      .insert([{ ...item, user_id: userId }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    toast({ title: "Item added successfully" });
    await trackEvent('item_added', { name: item.name, category: item.category || 'uncategorized' }, userId);
    fetchItems();
    return data;
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const { error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error updating item",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({ title: "Item updated successfully" });
    fetchItems();
    return true;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({ title: "Item deleted successfully" });
    fetchItems();
    return true;
  };

  return { items, loading, addItem, updateItem, deleteItem, refetch: fetchItems };
};
