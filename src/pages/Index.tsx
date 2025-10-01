import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ItemForm } from "@/components/ItemForm";
import { ItemList } from "@/components/ItemList";
import { useItems } from "@/hooks/useItems";
import { generatePDF } from "@/utils/pdfExport";
import { toast } from "@/hooks/use-toast";
import { Download, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">KeepSafe</h1>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Binder
            </Button>
            <Button onClick={handleSignOut} variant="ghost">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <ItemForm onSubmit={addItem} userId={session.user.id} />
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Your Items ({items.length})
              </h2>
              <ItemList items={items} onDelete={deleteItem} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
