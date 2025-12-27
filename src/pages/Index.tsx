import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ItemListSkeleton } from "@/components/LoadingSkeleton";
import { useItems } from "@/hooks/useItems";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { StatsCards, RecallAlerts, WarrantyTimeline, ActivityFeed } from "@/components/dashboard";
import { generatePDF } from "@/utils/pdfExport";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();
  const { items, loading } = useItems(session?.user?.id);
  const stats = useDashboardStats(items);
  const { activities, loading: activitiesLoading, error: activitiesError } = useActivityFeed(session?.user?.id);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/auth", { state: { from: "/dashboard" } });
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

  if (authLoading || !session) {
    return null;
  }

  return (
    <DashboardLayout onExportPDF={handleExportPDF}>
      <div className="container mx-auto px-6 py-6 space-y-8">
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

        {/* Quick Access to Inventory */}
        {loading ? (
          <ItemListSkeleton />
        ) : (
          <div className="glass-effect border border-primary/20 rounded-2xl p-6 shadow-premium">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Quick Inventory Overview</h2>
              <button 
                onClick={() => navigate("/dashboard/items")}
                className="text-sm font-semibold text-primary hover:text-accent transition-colors"
              >
                View All Items →
              </button>
            </div>
            <p className="text-muted-foreground">
              You have <span className="font-bold text-primary">{items.length}</span> items in your inventory.
              {stats.activeRecalls > 0 && (
                <span className="text-destructive ml-2">
                  ({stats.activeRecalls} with active recalls)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
