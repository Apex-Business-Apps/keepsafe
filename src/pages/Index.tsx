import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { ItemListSkeleton } from "@/components/LoadingSkeleton";
import { useItems } from "@/hooks/useItems";
import { useAuthSession } from "@/hooks/useAuthSession";
import { generatePDF } from "@/utils/pdfExport";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "@/hooks/use-toast";
import { Download, LogOut, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuthSession();
  const { items, loading, addItem, deleteItem } = useItems(session?.user?.id);

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

      {/* Empty State or CTA Section */}
      {!loading && items.length === 0 && (
        <div className="relative z-10 container mx-auto px-6 pt-12 pb-6">
          <div className="glass-effect border border-primary/20 rounded-3xl p-12 text-center space-y-6 shadow-premium">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
              <Shield className="h-10 w-10 text-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black">
              <span className="text-foreground">Let's Add Your</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                First Item
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Start protecting your belongings in under a minute. Add an item, upload a receipt, and we'll monitor recalls automatically.
            </p>
            <ul className="text-left max-w-md mx-auto space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span>Automatically tracked warranties</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span>Instant recall alerts for your safety</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">✓</span>
                </div>
                <span>Export insurance binder in one click</span>
              </li>
            </ul>
            <Button
              size="lg"
              onClick={() => document.getElementById('name')?.focus()}
              className="text-lg h-14 px-10 gradient-accent hover:opacity-90 shadow-premium transition-all duration-150 hover:scale-105 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              <Shield className="mr-2 h-5 w-5" />
              Add Your First Item
            </Button>
          </div>
        </div>
      )}

      <main className="relative z-10 container mx-auto px-6 py-6 space-y-10">
        <div className="glass-effect border border-primary/20 rounded-2xl p-8 shadow-premium">
          <ItemForm onSubmit={addItem} userId={session.user.id} />
        </div>
        
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
