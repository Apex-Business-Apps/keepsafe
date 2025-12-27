import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { ItemSearchFilter } from "@/components/ItemSearchFilter";
import { ItemListSkeleton } from "@/components/LoadingSkeleton";
import { useItems, Item } from "@/hooks/useItems";
import { useAuthSession } from "@/hooks/useAuthSession";
import { generatePDF } from "@/utils/pdfExport";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const ItemsPage = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();
  const { items, loading, addItem, deleteItem } = useItems(session?.user?.id);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  // Initialize filtered items when items load
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { state: { from: "/dashboard/items" } });
    }
  }, [session, authLoading, navigate]);

  const handleExportPDF = useCallback(async () => {
    if (items.length === 0) {
      toast({
        title: "No items to export",
        description: "Add some items first",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePDF(items);
      await trackEvent('binder_exported', { items_count: items.length }, session?.user?.id);
      toast({ title: "PDF exported successfully!" });
    } catch (error) {
      toast({
        title: "Error exporting PDF",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [items, session?.user?.id]);

  const handleFilteredItems = useCallback((filtered: Item[]) => {
    setFilteredItems(filtered);
  }, []);

  if (authLoading || !session) {
    return null;
  }

  return (
    <DashboardLayout onExportPDF={handleExportPDF}>
      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search and Filter */}
        {!loading && items.length > 0 && (
          <ItemSearchFilter 
            items={items} 
            onFilteredItems={handleFilteredItems} 
          />
        )}

        {/* Add Item Form */}
        <div className="glass-effect border border-primary/20 rounded-2xl p-4 sm:p-8 shadow-premium">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Add New Item</h2>
          </div>
          <ItemForm onSubmit={addItem} userId={session.user.id} />
        </div>
        
        {/* Inventory List */}
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Inventory
              </h2>
            </div>
            <ItemListSkeleton />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Inventory
              </h2>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 glass-effect rounded-full border border-primary/20">
                  <span className="text-sm font-bold text-primary">
                    {filteredItems.length === items.length 
                      ? `${items.length} Items` 
                      : `${filteredItems.length} of ${items.length}`
                    }
                  </span>
                </div>
              </div>
            </div>
            <ItemList items={filteredItems} onDelete={deleteItem} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ItemsPage;
