import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { ItemListSkeleton } from "@/components/LoadingSkeleton";
import { useItems } from "@/hooks/useItems";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { StatsCards, RecallAlerts, WarrantyTimeline, ActivityFeed } from "@/components/dashboard";
import { generatePDF } from "@/utils/pdfExport";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "@/hooks/use-toast";
import { Download, LogOut, Shield, Plus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();
  const { items, loading, addItem, deleteItem } = useItems(session?.user?.id);
  const stats = useDashboardStats(items);
  const { activities, loading: activitiesLoading, error: activitiesError } = useActivityFeed(session?.user?.id);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { state: { from: "/dashboard" } });
    }
  }, [session, authLoading, navigate]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
  }, []);

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

  if (authLoading || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <header className="relative z-10 glass-effect border-b border-primary/20">
        <div className="container mx-auto px-6 py-3 flex justify-center items-center relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-xl rounded-full" />
              <Shield className="h-7 w-7 text-primary relative z-10" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              KeepSafe
            </h1>
          </div>
          <div className="flex gap-3 absolute right-6">
            <Button 
              onClick={handleExportPDF} 
              variant="outline"
              className="border-primary/30 hover:border-accent hover:bg-accent/10 font-semibold transition-all"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="ghost"
              className="hover:bg-destructive/10 hover:text-destructive font-semibold transition-all"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-6 space-y-8">
        {/* Stats Cards Row */}
        <StatsCards
          totalItems={stats.totalItems}
          totalValue={stats.totalValue}
          activeRecalls={stats.activeRecalls}
          expiringWarranties={stats.expiringWarranties}
          loading={loading}
        />

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recall Alerts - Takes priority */}
          <div className="lg:col-span-1">
            <RecallAlerts
              items={stats.recallItems}
              loading={loading}
              userId={session.user.id}
            />
          </div>

          {/* Warranty Timeline */}
          <div className="lg:col-span-1">
            <WarrantyTimeline
              items={stats.warrantyItems}
              loading={loading}
            />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed
              activities={activities}
              loading={activitiesLoading}
              error={activitiesError}
            />
          </div>
        </div>

        {/* Add Item Form */}
        <div className="glass-effect border border-primary/20 rounded-2xl p-8 shadow-premium">
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
              <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Inventory
              </h2>
            </div>
            <ItemListSkeleton />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Inventory
              </h2>
              <div className="px-4 py-2 glass-effect rounded-full border border-primary/20">
                <span className="text-sm font-bold text-primary">{items.length} Items</span>
              </div>
            </div>
            <ItemList items={items} onDelete={deleteItem} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
