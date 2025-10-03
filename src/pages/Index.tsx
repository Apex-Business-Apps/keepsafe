import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { useItems } from "@/hooks/useItems";
import { generatePDF } from "@/utils/pdfExport";
import { toast } from "@/hooks/use-toast";
import { Download, LogOut, Shield } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { items, loading, addItem, deleteItem } = useItems(session?.user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth", { state: { from: "/dashboard" } });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth", { state: { from: "/dashboard" } });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
  };

  const handleExportPDF = async () => {
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
      toast({ title: "PDF exported successfully!" });
    } catch (error) {
      toast({
        title: "Error exporting PDF",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (!session) {
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

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 pt-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Next-Gen Home Protection
            </span>
          </div>
          <h2 className="text-5xl font-black">
            <span className="text-foreground">Secure Your</span>
            <br />
            <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
              Entire Life
            </span>
          </h2>
        </div>
      </div>

      <main className="relative z-10 container mx-auto px-6 py-6 space-y-10">
        <div className="glass-effect border border-primary/20 rounded-2xl p-8 shadow-premium">
          <ItemForm onSubmit={addItem} userId={session.user.id} />
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary" />
            <p className="mt-4 text-muted-foreground font-medium">Loading your items...</p>
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
